-- Aperçu profil créateur / membre pour les visiteurs : mode privé (PDF Graply page créateur)
-- expose uniquement les champs nécessaires ; les champs sensibles sont vidés côté SQL lorsque is_public = false.

CREATE OR REPLACE FUNCTION public.get_creator_profile_preview(p_username text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r public.profiles%ROWTYPE;
  approved_videos int;
  campaigns_with_approved int;
BEGIN
  SELECT * INTO r FROM public.profiles WHERE username = p_username LIMIT 1;

  IF r.id IS NULL THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  SELECT
    COUNT(*) FILTER (WHERE vs.status = 'approved'),
    COUNT(DISTINCT vs.campaign_id) FILTER (WHERE vs.status = 'approved')
  INTO approved_videos, campaigns_with_approved
  FROM public.video_submissions vs
  WHERE vs.user_id = r.id;

  RETURN jsonb_build_object(
    'found', true,
    'is_public', COALESCE(r.is_public, true),
    'messaging_enabled', COALESCE(r.messaging_enabled, true),
    'username', r.username,
    'display_name', CASE WHEN COALESCE(r.is_public, true) THEN r.display_name ELSE '' END,
    'bio', CASE WHEN COALESCE(r.is_public, true) THEN r.bio ELSE '' END,
    'avatar_url', r.avatar_url,
    'banner_url', r.banner_url,
    'content_tags', CASE WHEN COALESCE(r.is_public, true) THEN to_jsonb(COALESCE(r.content_tags, '{}'::text[])) ELSE '[]'::jsonb END,
    'website', CASE WHEN COALESCE(r.is_public, true) THEN COALESCE(r.website, '') ELSE '' END,
    'created_at', r.created_at,
    'instagram_handle', CASE WHEN COALESCE(r.is_public, true) THEN COALESCE(r.instagram_handle, '') ELSE '' END,
    'tiktok_handle', CASE WHEN COALESCE(r.is_public, true) THEN COALESCE(r.tiktok_handle, '') ELSE '' END,
    'youtube_handle', CASE WHEN COALESCE(r.is_public, true) THEN COALESCE(r.youtube_handle, '') ELSE '' END,
    'clip_views_total', COALESCE(r.clip_views_total, 0),
    'stats', jsonb_build_object(
      'approved_videos', COALESCE(approved_videos, 0),
      'campaigns_with_approved_video', COALESCE(campaigns_with_approved, 0)
    )
  );
END;
$$;

COMMENT ON FUNCTION public.get_creator_profile_preview(text) IS
  'Lecture publique : profil par username avec stats Graply ; bio/réseaux masqués si profil privé.';

GRANT EXECUTE ON FUNCTION public.get_creator_profile_preview(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_creator_profile_preview(text) TO authenticated;
