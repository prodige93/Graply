-- Vues par vidéo (scraping / APIs) + agrégation vers profiles.clip_views_total

ALTER TABLE public.instagram_videos
  ADD COLUMN IF NOT EXISTS view_count bigint NOT NULL DEFAULT 0;

ALTER TABLE public.tiktok_videos
  ADD COLUMN IF NOT EXISTS view_count bigint NOT NULL DEFAULT 0;

ALTER TABLE public.youtube_videos
  ADD COLUMN IF NOT EXISTS view_count bigint NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.instagram_videos.view_count IS 'Vues ou métrique équivalente (IG : souvent 0 tant que l’API n’expose pas les vues).';
COMMENT ON COLUMN public.tiktok_videos.view_count IS 'Vues TikTok renvoyées par l’API vidéo.';
COMMENT ON COLUMN public.youtube_videos.view_count IS 'Vues YouTube (statistics.viewCount).';

-- Recalcule la somme des vues sur toutes les vidéos liées à l’utilisateur et met à jour profiles.clip_views_total
CREATE OR REPLACE FUNCTION public.recompute_clip_views_total()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  total bigint;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT
    COALESCE((SELECT SUM(view_count) FROM public.instagram_videos WHERE user_id = uid), 0) +
    COALESCE((SELECT SUM(view_count) FROM public.tiktok_videos WHERE user_id = uid), 0) +
    COALESCE((SELECT SUM(view_count) FROM public.youtube_videos WHERE user_id = uid), 0)
  INTO total;

  UPDATE public.profiles
  SET clip_views_total = total, updated_at = now()
  WHERE id = uid;

  RETURN jsonb_build_object('clip_views_total', total);
END;
$$;

GRANT EXECUTE ON FUNCTION public.recompute_clip_views_total() TO authenticated;

-- TikTok : inclut view_count dans la liste vidéo (API v2)
CREATE OR REPLACE FUNCTION public.sync_tiktok_videos()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tok text;
  resp record;
  body jsonb;
  err_code text;
  vids jsonb;
  vid jsonb;
  tt_ids text[] := '{}';
  deleted_count int;
  upserted_count int := 0;
  uid uuid := auth.uid();
  cur bigint;
  has_more boolean := true;
  iter int := 0;
  share_u text;
  title_t text;
  cover_u text;
  vid_id text;
  ts_raw bigint;
  ts_tz timestamptz;
  req_body text;
  vc bigint;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT access_token INTO tok
  FROM social_connections
  WHERE user_id = uid AND platform = 'tiktok'
  LIMIT 1;

  IF tok IS NULL OR tok = '' THEN
    RETURN jsonb_build_object('error', 'not_connected');
  END IF;

  cur := NULL;
  WHILE has_more AND iter < 15 LOOP
    iter := iter + 1;
    IF cur IS NULL THEN
      req_body := '{"max_count":20}';
    ELSE
      req_body := format('{"max_count":20,"cursor":%s}', cur);
    END IF;

    SELECT * INTO resp FROM extensions.http((
      'POST'::extensions.http_method,
      'https://open.tiktokapis.com/v2/video/list/?fields=id,title,cover_image_url,share_url,create_time,view_count',
      ARRAY[
        extensions.http_header('Authorization', 'Bearer ' || tok),
        extensions.http_header('Content-Type', 'application/json')
      ],
      'application/json',
      req_body
    )::extensions.http_request);

    body := resp.content::jsonb;
    err_code := COALESCE(body->'error'->>'code', '');
    IF err_code IS NOT NULL AND err_code != '' AND err_code != 'ok' THEN
      RETURN jsonb_build_object(
        'error', COALESCE(body->'error'->>'message', 'tiktok_api_error'),
        'code', err_code
      );
    END IF;

    vids := COALESCE(body->'data'->'videos', '[]'::jsonb);
    FOR vid IN SELECT * FROM jsonb_array_elements(vids)
    LOOP
      vid_id := vid->>'id';
      IF vid_id IS NULL OR vid_id = '' THEN CONTINUE; END IF;
      tt_ids := array_append(tt_ids, vid_id);
      title_t := COALESCE(vid->>'title', 'Vidéo TikTok');
      cover_u := COALESCE(vid->>'cover_image_url', '');
      IF cover_u = '' THEN cover_u := 'https://placehold.co/320x180/1a1a1a/666?text=TikTok'; END IF;
      share_u := COALESCE(vid->>'share_url', 'https://www.tiktok.com/video/' || vid_id);
      ts_raw := COALESCE((vid->>'create_time')::bigint, 0);
      IF ts_raw > 1000000000000 THEN
        ts_tz := to_timestamp(ts_raw / 1000.0);
      ELSIF ts_raw > 0 THEN
        ts_tz := to_timestamp(ts_raw);
      ELSE
        ts_tz := now();
      END IF;
      vc := COALESCE(NULLIF(trim(COALESCE(vid->>'view_count', '')), '')::bigint, 0);

      INSERT INTO tiktok_videos (id, user_id, title, cover_url, share_url, timestamp, view_count, updated_at)
      VALUES (vid_id, uid, title_t, cover_u, share_u, ts_tz, vc, now())
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        cover_url = EXCLUDED.cover_url,
        share_url = EXCLUDED.share_url,
        timestamp = EXCLUDED.timestamp,
        view_count = EXCLUDED.view_count,
        updated_at = now();
      upserted_count := upserted_count + 1;
    END LOOP;

    has_more := COALESCE((body->'data'->>'has_more')::boolean, false);
    cur := (body->'data'->>'cursor')::bigint;
    IF NOT has_more OR jsonb_array_length(vids) = 0 THEN
      EXIT;
    END IF;
  END LOOP;

  DELETE FROM tiktok_videos
  WHERE user_id = uid
    AND id != ALL(tt_ids);

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN jsonb_build_object('synced', upserted_count, 'deleted', deleted_count);
END;
$$;

-- YouTube : met à jour view_count via videos.list + statistics (après sync_youtube_videos)
CREATE OR REPLACE FUNCTION public.refresh_youtube_view_counts()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tok text;
  uid uuid := auth.uid();
  all_ids text[];
  resp record;
  body jsonb;
  item jsonb;
  vid_id text;
  vc bigint;
  i int;
  len int;
  chunk_len int;
  ids_param text;
  updated_n int := 0;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT access_token INTO tok
  FROM social_connections
  WHERE user_id = uid AND platform = 'youtube'
  LIMIT 1;

  IF tok IS NULL OR tok = '' THEN
    RETURN jsonb_build_object('skipped', true, 'reason', 'not_connected');
  END IF;

  SELECT array_agg(id ORDER BY id) INTO all_ids FROM youtube_videos WHERE user_id = uid;
  IF all_ids IS NULL THEN
    RETURN jsonb_build_object('updated', 0);
  END IF;

  len := array_length(all_ids, 1);
  IF len IS NULL OR len = 0 THEN
    RETURN jsonb_build_object('updated', 0);
  END IF;

  i := 1;
  WHILE i <= len LOOP
    chunk_len := LEAST(50, len - i + 1);
    ids_param := array_to_string(all_ids[i : i + chunk_len - 1], ',');

    SELECT * INTO resp FROM extensions.http((
      'GET'::extensions.http_method,
      'https://www.googleapis.com/youtube/v3/videos?part=statistics&id=' || ids_param,
      ARRAY[extensions.http_header('Authorization', 'Bearer ' || tok)],
      'application/json',
      ''::text
    )::extensions.http_request);

    body := resp.content::jsonb;
    IF body ? 'error' THEN
      RETURN jsonb_build_object(
        'error', COALESCE(body->'error'->>'message', 'youtube_stats_error')
      );
    END IF;

    FOR item IN SELECT * FROM jsonb_array_elements(COALESCE(body->'items', '[]'::jsonb))
    LOOP
      vid_id := item->>'id';
      vc := COALESCE(NULLIF(trim(COALESCE(item->'statistics'->>'viewCount', '')), '')::bigint, 0);
      IF vid_id IS NOT NULL AND vid_id <> '' THEN
        UPDATE youtube_videos
        SET view_count = vc, updated_at = now()
        WHERE id = vid_id AND user_id = uid;
        IF FOUND THEN
          updated_n := updated_n + 1;
        END IF;
      END IF;
    END LOOP;

    i := i + 50;
  END LOOP;

  RETURN jsonb_build_object('updated', updated_n);
END;
$$;

GRANT EXECUTE ON FUNCTION public.refresh_youtube_view_counts() TO authenticated;
