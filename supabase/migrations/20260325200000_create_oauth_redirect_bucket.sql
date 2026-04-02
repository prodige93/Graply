/*
  # Create OAuth redirect bucket

  Bucket public pour héberger la page de redirection OAuth.
  Instagram/TikTok/YouTube redirigent vers cette page HTTPS (Supabase Storage),
  qui elle-même redirige vers localhost avec le code d'autorisation.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('oauth', 'oauth', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can read oauth files" ON storage.objects;
CREATE POLICY "Anyone can read oauth files"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'oauth');
