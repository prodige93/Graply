/*
  Suppression définitive du compte : données applicatives + ligne auth.users.
  Appellez : SELECT public.delete_my_account(); via supabase.rpc('delete_my_account') (session requise).
*/

CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM public.campaign_applications WHERE user_id = uid;
  DELETE FROM public.video_submissions WHERE user_id = uid;
  DELETE FROM public.notifications WHERE user_id = uid;
  DELETE FROM public.instagram_videos WHERE user_id = uid;
  DELETE FROM public.tiktok_videos WHERE user_id = uid;
  DELETE FROM public.youtube_videos WHERE user_id = uid;
  DELETE FROM public.social_connections WHERE user_id = uid;
  DELETE FROM public.campaigns WHERE user_id = uid;
  DELETE FROM public.profiles WHERE id = uid;

  DELETE FROM auth.users WHERE id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_my_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;
