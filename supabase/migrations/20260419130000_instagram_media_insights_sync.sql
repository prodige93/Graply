-- Sync Instagram : aligné sur la doc « Instagram API with Instagram Login » — Media Insights
-- (https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login)
-- Nécessite les scopes OAuth instagram_business_basic + instagram_business_manage_insights
-- et un nouvel écran de consentement pour les utilisateurs déjà connectés avant ce déploiement.

CREATE OR REPLACE FUNCTION public.sync_instagram_videos()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  tok text;
  resp record;
  body jsonb;
  ig_media jsonb;
  media_item jsonb;
  ig_ids text[] := '{}';
  deleted_count int;
  upserted_count int := 0;
  uid uuid := auth.uid();
  insight_resp record;
  insight_json jsonb;
  vc bigint;
  mid text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT access_token INTO tok
  FROM social_connections
  WHERE user_id = uid AND platform = 'instagram'
  LIMIT 1;

  IF tok IS NULL THEN
    RETURN jsonb_build_object('error', 'not_connected');
  END IF;

  SELECT * INTO resp FROM extensions.http_get(
    format(
      'https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,permalink&limit=50&access_token=%s',
      tok
    )
  );

  body := resp.content::jsonb;

  IF body ? 'error' THEN
    RETURN jsonb_build_object('error', body->'error'->>'message');
  END IF;

  ig_media := COALESCE(body->'data', '[]'::jsonb);

  FOR media_item IN SELECT * FROM jsonb_array_elements(ig_media)
  LOOP
    IF media_item->>'media_type' = 'VIDEO' THEN
      mid := media_item->>'id';
      ig_ids := array_append(ig_ids, mid);

      vc := 0;
      BEGIN
        SELECT * INTO insight_resp FROM extensions.http_get(
          format(
            'https://graph.instagram.com/%s/insights?metric=views&access_token=%s',
            mid,
            tok
          )
        );
        insight_json := insight_resp.content::jsonb;
        IF NOT (insight_json ? 'error') AND insight_json ? 'data' THEN
          SELECT COALESCE(
            (
              SELECT (elem->'values'->0->>'value')::bigint
              FROM jsonb_array_elements(insight_json->'data') elem
              WHERE elem->>'name' IN ('views', 'video_views')
              LIMIT 1
            ),
            0
          ) INTO vc;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        vc := 0;
      END;

      INSERT INTO instagram_videos (id, user_id, caption, media_url, thumbnail_url, permalink, timestamp, view_count, updated_at)
      VALUES (
        mid,
        uid,
        media_item->>'caption',
        media_item->>'media_url',
        media_item->>'thumbnail_url',
        media_item->>'permalink',
        (media_item->>'timestamp')::timestamptz,
        COALESCE(vc, 0),
        now()
      )
      ON CONFLICT (id) DO UPDATE SET
        caption = EXCLUDED.caption,
        media_url = EXCLUDED.media_url,
        thumbnail_url = EXCLUDED.thumbnail_url,
        permalink = EXCLUDED.permalink,
        view_count = EXCLUDED.view_count,
        updated_at = now();

      upserted_count := upserted_count + 1;
    END IF;
  END LOOP;

  DELETE FROM instagram_videos
  WHERE user_id = uid
    AND id != ALL(ig_ids);

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'synced', upserted_count,
    'deleted', deleted_count
  );
END; $$;

COMMENT ON COLUMN public.instagram_videos.view_count IS
  'Vues organiques (métrique views / video_views via Insights API — délai possible jusqu’à 48 h, doc Meta).';
