/*
  # Sync Instagram Videos
  - Crée une table instagram_videos pour persister les vidéos IG de chaque utilisateur
  - Crée une RPC sync_instagram_videos qui fait un UPSERT + DELETE bidirectionnel
  - Supprime l'ancienne RPC fetch_instagram_media devenue inutile
*/

-- ============================================================
-- Table instagram_videos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.instagram_videos (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  caption TEXT,
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  permalink TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_instagram_videos_user ON instagram_videos(user_id);

ALTER TABLE instagram_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own instagram videos"
  ON instagram_videos FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service can manage instagram videos"
  ON instagram_videos FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- sync_instagram_videos – synchronisation bidirectionnelle
-- ============================================================
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
      ig_ids := array_append(ig_ids, media_item->>'id');

      INSERT INTO instagram_videos (id, user_id, caption, media_url, thumbnail_url, permalink, timestamp, updated_at)
      VALUES (
        media_item->>'id',
        uid,
        media_item->>'caption',
        media_item->>'media_url',
        media_item->>'thumbnail_url',
        media_item->>'permalink',
        (media_item->>'timestamp')::timestamptz,
        now()
      )
      ON CONFLICT (id) DO UPDATE SET
        caption = EXCLUDED.caption,
        media_url = EXCLUDED.media_url,
        thumbnail_url = EXCLUDED.thumbnail_url,
        permalink = EXCLUDED.permalink,
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

-- ============================================================
-- Suppression de l'ancienne RPC (plus nécessaire)
-- ============================================================
DROP FUNCTION IF EXISTS public.fetch_instagram_media();
