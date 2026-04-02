/*
  # TikTok & YouTube videos sync (aligné sur instagram_videos)
  - Tables tiktok_videos, youtube_videos
  - RPC sync_tiktok_videos, sync_youtube_videos
  - disconnect_social : supprime aussi les vidéos de la plateforme déconnectée
*/

-- ============================================================
-- tiktok_videos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tiktok_videos (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  cover_url TEXT NOT NULL,
  share_url TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tiktok_videos_user ON tiktok_videos(user_id);

ALTER TABLE tiktok_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tiktok videos"
  ON tiktok_videos FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service can manage tiktok videos"
  ON tiktok_videos FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- youtube_videos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.youtube_videos (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  thumbnail_url TEXT,
  watch_url TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_youtube_videos_user ON youtube_videos(user_id);

ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own youtube videos"
  ON youtube_videos FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service can manage youtube videos"
  ON youtube_videos FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- sync_tiktok_videos
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_tiktok_videos()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
      'https://open.tiktokapis.com/v2/video/list/?fields=id,title,cover_image_url,share_url,create_time',
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

      INSERT INTO tiktok_videos (id, user_id, title, cover_url, share_url, timestamp, updated_at)
      VALUES (vid_id, uid, title_t, cover_u, share_u, ts_tz, now())
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        cover_url = EXCLUDED.cover_url,
        share_url = EXCLUDED.share_url,
        timestamp = EXCLUDED.timestamp,
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
END; $$;

-- ============================================================
-- sync_youtube_videos
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_youtube_videos()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  tok text;
  resp record;
  body jsonb;
  items jsonb;
  it jsonb;
  yt_ids text[] := '{}';
  deleted_count int;
  upserted_count int := 0;
  uid uuid := auth.uid();
  vid_id text;
  title_t text;
  thumb text;
  published text;
  ts_tz timestamptz;
  next_page text;
  page_iter int := 0;
  url text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT access_token INTO tok
  FROM social_connections
  WHERE user_id = uid AND platform = 'youtube'
  LIMIT 1;

  IF tok IS NULL OR tok = '' THEN
    RETURN jsonb_build_object('error', 'not_connected');
  END IF;

  next_page := NULL;

  WHILE page_iter < 5 LOOP
    page_iter := page_iter + 1;

    IF next_page IS NULL OR next_page = '' THEN
      url := 'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&forMine=true&maxResults=50';
    ELSE
      url := 'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&forMine=true&maxResults=50&pageToken=' || next_page;
    END IF;

    SELECT * INTO resp FROM extensions.http((
      'GET'::extensions.http_method,
      url,
      ARRAY[extensions.http_header('Authorization', 'Bearer ' || tok)],
      'application/json',
      ''::text
    )::extensions.http_request);

    body := resp.content::jsonb;

    IF body ? 'error' THEN
      RETURN jsonb_build_object(
        'error', COALESCE(body->'error'->>'message', 'youtube_api_error')
      );
    END IF;

    items := COALESCE(body->'items', '[]'::jsonb);
    FOR it IN SELECT * FROM jsonb_array_elements(items)
    LOOP
      vid_id := it->'id'->>'videoId';
      IF vid_id IS NULL OR vid_id = '' THEN CONTINUE; END IF;
      yt_ids := array_append(yt_ids, vid_id);
      title_t := COALESCE(it->'snippet'->>'title', 'Vidéo YouTube');
      thumb := COALESCE(
        it->'snippet'->'thumbnails'->'medium'->>'url',
        it->'snippet'->'thumbnails'->'default'->>'url',
        ''
      );
      IF thumb = '' THEN thumb := 'https://placehold.co/320x180/1a1a1a/666?text=YouTube'; END IF;
      published := COALESCE(it->'snippet'->>'publishedAt', '');
      IF published = '' THEN
        ts_tz := now();
      ELSE
        ts_tz := published::timestamptz;
      END IF;

      INSERT INTO youtube_videos (id, user_id, title, thumbnail_url, watch_url, published_at, updated_at)
      VALUES (
        vid_id,
        uid,
        title_t,
        thumb,
        'https://www.youtube.com/watch?v=' || vid_id,
        ts_tz,
        now()
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        thumbnail_url = EXCLUDED.thumbnail_url,
        watch_url = EXCLUDED.watch_url,
        published_at = EXCLUDED.published_at,
        updated_at = now();
      upserted_count := upserted_count + 1;
    END LOOP;

    next_page := body->>'nextPageToken';
    IF next_page IS NULL OR next_page = '' THEN
      EXIT;
    END IF;
  END LOOP;

  DELETE FROM youtube_videos
  WHERE user_id = uid
    AND id != ALL(yt_ids);

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN jsonb_build_object('synced', upserted_count, 'deleted', deleted_count);
END; $$;

-- ============================================================
-- disconnect_social — purge les vidéos de la plateforme
-- ============================================================
CREATE OR REPLACE FUNCTION public.disconnect_social(p_platform text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  IF p_platform = 'instagram' THEN
    DELETE FROM instagram_videos WHERE user_id = uid;
  ELSIF p_platform = 'tiktok' THEN
    DELETE FROM tiktok_videos WHERE user_id = uid;
  ELSIF p_platform = 'youtube' THEN
    DELETE FROM youtube_videos WHERE user_id = uid;
  END IF;

  DELETE FROM social_connections WHERE user_id = uid AND platform = p_platform;
  IF p_platform = 'instagram' THEN UPDATE profiles SET instagram_handle = '', updated_at = now() WHERE id = uid;
  ELSIF p_platform = 'tiktok' THEN UPDATE profiles SET tiktok_handle = '', updated_at = now() WHERE id = uid;
  ELSIF p_platform = 'youtube' THEN UPDATE profiles SET youtube_handle = '', updated_at = now() WHERE id = uid;
  END IF;
END; $$;
