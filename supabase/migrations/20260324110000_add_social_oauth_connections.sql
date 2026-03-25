/*
  # Social OAuth Connections

  Permet aux utilisateurs de connecter leurs comptes Instagram, TikTok et YouTube
  via OAuth. Chaque plateforme a sa propre fonction RPC qui échange le code
  d'autorisation contre un token, récupère les infos utilisateur, et stocke le tout.

  ## Setup requis (une seule fois, via Supabase Dashboard SQL Editor) :

  -- Instagram (Meta Developer Console → Instagram App)
  SELECT vault.create_secret('YOUR_INSTAGRAM_APP_ID', 'instagram_client_id');
  SELECT vault.create_secret('YOUR_INSTAGRAM_APP_SECRET', 'instagram_client_secret');

  -- TikTok (TikTok Developer Portal)
  SELECT vault.create_secret('YOUR_TIKTOK_CLIENT_KEY', 'tiktok_client_key');
  SELECT vault.create_secret('YOUR_TIKTOK_CLIENT_SECRET', 'tiktok_client_secret');

  -- YouTube / Google (Google Cloud Console → OAuth 2.0 Client)
  SELECT vault.create_secret('YOUR_GOOGLE_CLIENT_ID', 'youtube_client_id');
  SELECT vault.create_secret('YOUR_GOOGLE_CLIENT_SECRET', 'youtube_client_secret');
*/

CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- ============================================================
-- Table social_connections
-- ============================================================
CREATE TABLE IF NOT EXISTS social_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  platform text NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube')),
  platform_user_id text NOT NULL DEFAULT '',
  platform_username text NOT NULL DEFAULT '',
  access_token text NOT NULL DEFAULT '',
  refresh_token text DEFAULT '',
  token_expires_at timestamptz,
  connected_at timestamptz DEFAULT now(),
  UNIQUE(user_id, platform)
);

ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connections"
  ON social_connections FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own connections"
  ON social_connections FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own connections"
  ON social_connections FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own connections"
  ON social_connections FOR DELETE TO authenticated
  USING (user_id = auth.uid());


-- ============================================================
-- connect_instagram
-- ============================================================
CREATE OR REPLACE FUNCTION public.connect_instagram(auth_code text, redir_uri text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  cid text; csecret text;
  resp record; body jsonb;
  tok text; uid_ig text; uname text;
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT decrypted_secret INTO cid     FROM vault.decrypted_secrets WHERE name = 'instagram_client_id' LIMIT 1;
  SELECT decrypted_secret INTO csecret FROM vault.decrypted_secrets WHERE name = 'instagram_client_secret' LIMIT 1;
  IF csecret IS NULL THEN RAISE EXCEPTION 'instagram_client_secret not in vault'; END IF;

  -- Exchange code for token
  SELECT * INTO resp FROM extensions.http_post(
    'https://api.instagram.com/oauth/access_token',
    format('client_id=%s&client_secret=%s&grant_type=authorization_code&redirect_uri=%s&code=%s',
      cid, csecret, redir_uri, auth_code),
    'application/x-www-form-urlencoded'
  );
  body := resp.content::jsonb;
  tok := body->>'access_token';
  uid_ig := COALESCE(body->>'user_id', body->'user_id'->>'', '');
  IF tok IS NULL THEN RAISE EXCEPTION 'Instagram token error: %', body::text; END IF;

  -- Get username
  SELECT * INTO resp FROM extensions.http_get(
    format('https://graph.instagram.com/me?fields=id,username&access_token=%s', tok)
  );
  body := resp.content::jsonb;
  uname := COALESCE(body->>'username', '');

  -- Store connection
  INSERT INTO social_connections (user_id, platform, platform_user_id, platform_username, access_token, connected_at)
  VALUES (uid, 'instagram', uid_ig, uname, tok, now())
  ON CONFLICT (user_id, platform) DO UPDATE SET
    platform_user_id = EXCLUDED.platform_user_id,
    platform_username = EXCLUDED.platform_username,
    access_token = EXCLUDED.access_token,
    connected_at = now();

  -- Update profile handle
  UPDATE profiles SET instagram_handle = '@' || uname, updated_at = now() WHERE id = uid;

  RETURN jsonb_build_object('platform', 'instagram', 'username', uname);
END; $$;


-- ============================================================
-- connect_tiktok
-- ============================================================
CREATE OR REPLACE FUNCTION public.connect_tiktok(auth_code text, redir_uri text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  ckey text; csecret text;
  resp record; body jsonb;
  tok text; open_id text; dname text; rtok text;
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT decrypted_secret INTO ckey    FROM vault.decrypted_secrets WHERE name = 'tiktok_client_key' LIMIT 1;
  SELECT decrypted_secret INTO csecret FROM vault.decrypted_secrets WHERE name = 'tiktok_client_secret' LIMIT 1;
  IF csecret IS NULL THEN RAISE EXCEPTION 'tiktok_client_secret not in vault'; END IF;

  -- Exchange code for token
  SELECT * INTO resp FROM extensions.http_post(
    'https://open.tiktokapis.com/v2/oauth/token/',
    format('client_key=%s&client_secret=%s&code=%s&grant_type=authorization_code&redirect_uri=%s',
      ckey, csecret, auth_code, redir_uri),
    'application/x-www-form-urlencoded'
  );
  body := resp.content::jsonb;
  tok := body->>'access_token';
  open_id := COALESCE(body->>'open_id', '');
  rtok := COALESCE(body->>'refresh_token', '');
  IF tok IS NULL THEN RAISE EXCEPTION 'TikTok token error: %', body::text; END IF;

  -- Get user info
  SELECT * INTO resp FROM extensions.http((
    'GET'::extensions.http_method,
    'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url',
    ARRAY[extensions.http_header('Authorization', 'Bearer ' || tok)],
    'application/json'::text,
    ''::text
  )::extensions.http_request);
  body := resp.content::jsonb;
  dname := COALESCE(body->'data'->'user'->>'display_name', '');

  -- Store connection
  INSERT INTO social_connections (user_id, platform, platform_user_id, platform_username, access_token, refresh_token, connected_at)
  VALUES (uid, 'tiktok', open_id, dname, tok, rtok, now())
  ON CONFLICT (user_id, platform) DO UPDATE SET
    platform_user_id = EXCLUDED.platform_user_id,
    platform_username = EXCLUDED.platform_username,
    access_token = EXCLUDED.access_token,
    refresh_token = EXCLUDED.refresh_token,
    connected_at = now();

  UPDATE profiles SET tiktok_handle = '@' || dname, updated_at = now() WHERE id = uid;

  RETURN jsonb_build_object('platform', 'tiktok', 'username', dname);
END; $$;


-- ============================================================
-- connect_youtube
-- ============================================================
CREATE OR REPLACE FUNCTION public.connect_youtube(auth_code text, redir_uri text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  cid text; csecret text;
  resp record; body jsonb;
  tok text; rtok text; channel_id text; channel_name text;
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT decrypted_secret INTO cid     FROM vault.decrypted_secrets WHERE name = 'youtube_client_id' LIMIT 1;
  SELECT decrypted_secret INTO csecret FROM vault.decrypted_secrets WHERE name = 'youtube_client_secret' LIMIT 1;
  IF csecret IS NULL THEN RAISE EXCEPTION 'youtube_client_secret not in vault'; END IF;

  -- Exchange code for token
  SELECT * INTO resp FROM extensions.http_post(
    'https://oauth2.googleapis.com/token',
    format('code=%s&client_id=%s&client_secret=%s&redirect_uri=%s&grant_type=authorization_code',
      auth_code, cid, csecret, redir_uri),
    'application/x-www-form-urlencoded'
  );
  body := resp.content::jsonb;
  tok := body->>'access_token';
  rtok := COALESCE(body->>'refresh_token', '');
  IF tok IS NULL THEN RAISE EXCEPTION 'YouTube token error: %', body::text; END IF;

  -- Get channel info
  SELECT * INTO resp FROM extensions.http((
    'GET'::extensions.http_method,
    'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
    ARRAY[extensions.http_header('Authorization', 'Bearer ' || tok)],
    'application/json'::text,
    ''::text
  )::extensions.http_request);
  body := resp.content::jsonb;
  channel_id := COALESCE(body->'items'->0->>'id', '');
  channel_name := COALESCE(body->'items'->0->'snippet'->>'customUrl',
                           body->'items'->0->'snippet'->>'title', '');

  -- Store connection
  INSERT INTO social_connections (user_id, platform, platform_user_id, platform_username, access_token, refresh_token, connected_at)
  VALUES (uid, 'youtube', channel_id, channel_name, tok, rtok, now())
  ON CONFLICT (user_id, platform) DO UPDATE SET
    platform_user_id = EXCLUDED.platform_user_id,
    platform_username = EXCLUDED.platform_username,
    access_token = EXCLUDED.access_token,
    refresh_token = EXCLUDED.refresh_token,
    connected_at = now();

  UPDATE profiles SET youtube_handle = channel_name, updated_at = now() WHERE id = uid;

  RETURN jsonb_build_object('platform', 'youtube', 'username', channel_name, 'channel_id', channel_id);
END; $$;


-- ============================================================
-- disconnect_social (supprime la connexion + vide le handle)
-- ============================================================
CREATE OR REPLACE FUNCTION public.disconnect_social(p_platform text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  DELETE FROM social_connections WHERE user_id = uid AND platform = p_platform;
  IF p_platform = 'instagram' THEN UPDATE profiles SET instagram_handle = '', updated_at = now() WHERE id = uid;
  ELSIF p_platform = 'tiktok' THEN UPDATE profiles SET tiktok_handle = '', updated_at = now() WHERE id = uid;
  ELSIF p_platform = 'youtube' THEN UPDATE profiles SET youtube_handle = '', updated_at = now() WHERE id = uid;
  END IF;
END; $$;
