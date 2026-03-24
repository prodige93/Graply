/*
  # Fix storage policies for public access

  ## Problem
  The app uses a fixed profile ID without authentication, but the storage upload
  policies require `TO authenticated`. This causes all uploads to fail silently,
  returning a temporary blob URL that disappears on page reload.

  ## Changes
  - Drop the existing insert/update policies that require authentication
  - Create new policies that allow public (anon) access for uploads to the avatars bucket
  - Keep public read access as-is

  ## Note
  This is appropriate for a single-user app without authentication.
*/

DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;

CREATE POLICY "Public can upload to avatars bucket"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Public can update avatars bucket"
  ON storage.objects FOR UPDATE
  TO public
  USING (bucket_id = 'avatars')
  WITH CHECK (bucket_id = 'avatars');
