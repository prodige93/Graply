/*
  # Fetch Instagram Media
  Ajoute une RPC pour récupérer les vidéos du compte Instagram connecté.
  Met à jour connect_instagram pour obtenir un token long-durée (60 jours).
*/
-- ============================================================
-- connect_instagram (v2) – échange aussi pour un long-lived token
-- ============================================================
CREATE OR REPLACE FUNCTION public.connect_instagram(auth_code text, redir_uri text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  cid text; csecret text;
  resp record; body jsonb;
  tok text; long_tok text; uid_ig text; uname text;
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT decrypted_secret INTO cid     FROM vault.decrypted_secrets WHERE name = 'instagram_client_id' LIMIT 1;
  SELECT decrypted_secret INTO csecret FROM vault.decrypted_secrets WHERE name = 'instagram_client_secret' LIMIT 1;
  IF csecret IS NULL THEN RAISE EXCEPTION 'instagram_client_secret not in vault'; END IF;
  -- Exchange code for short-lived token
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
  -- Exchange short-lived token for long-lived token (valid ~60 days)
  SELECT * INTO resp FROM extensions.http_get(
    format('https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=%s&access_token=%s',
      csecret, tok)
  );
  body := resp.content::jsonb;
  long_tok := body->>'access_token';
  IF long_tok IS NOT NULL THEN
    tok := long_tok;
  END IF;
  -- Get username
  SELECT * INTO resp FROM extensions.http_get(
    format('https://graph.instagram.com/me?fields=id,username&access_token=%s', tok)
  );
  body := resp.content::jsonb;
  uname := COALESCE(body->>'username', '');
  -- Store connection with long-lived token
  INSERT INTO social_connections (user_id, platform, platform_user_id, platform_username, access_token, connected_at)
  VALUES (uid, 'instagram', uid_ig, uname, tok, now())
  ON CONFLICT (user_id, platform) DO UPDATE SET
    platform_user_id = EXCLUDED.platform_user_id,
    platform_username = EXCLUDED.platform_username,
    access_token = EXCLUDED.access_token,
    connected_at = now();
  UPDATE profiles SET instagram_handle = '@' || uname, updated_at = now() WHERE id = uid;
  RETURN jsonb_build_object('platform', 'instagram', 'username', uname);
END; $$;
-- ============================================================
-- fetch_instagram_media – récupère les médias du compte IG connecté
-- ============================================================
CREATE OR REPLACE FUNCTION public.fetch_instagram_media()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  tok text;
  resp record;
  body jsonb;
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT access_token INTO tok
  FROM social_connections
  WHERE user_id = uid AND platform = 'instagram'
  LIMIT 1;
  IF tok IS NULL THEN
    RETURN jsonb_build_object('error', 'not_connected', 'data', '[]'::jsonb);
  END IF;
  SELECT * INTO resp FROM extensions.http_get(
    format(
      'https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,permalink&limit=50&access_token=%s',
      tok
    )
  );
  body := resp.content::jsonb;
  IF body ? 'error' THEN
    RETURN jsonb_build_object(
      'error', COALESCE(body->'error'->>'message', 'unknown_error'),
      'code', COALESCE(body->'error'->>'code', '0'),
      'data', '[]'::jsonb
    );
  END IF;
  RETURN jsonb_build_object('data', COALESCE(body->'data', '[]'::jsonb));
END; $$;
-- ============================================================
-- refresh_instagram_token – rafraîchit un long-lived token IG
-- ============================================================
CREATE OR REPLACE FUNCTION public.refresh_instagram_token()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  tok text;
  resp record;
  body jsonb;
  new_tok text;
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
      'https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=%s',
      tok
    )
  );
  body := resp.content::jsonb;
  new_tok := body->>'access_token';
  IF new_tok IS NULL THEN
    RETURN jsonb_build_object('error', COALESCE(body->'error'->>'message', 'refresh_failed'));
  END IF;
  UPDATE social_connections
  SET access_token = new_tok, connected_at = now()
  WHERE user_id = uid AND platform = 'instagram';
  RETURN jsonb_build_object('refreshed', true);
END; $$;