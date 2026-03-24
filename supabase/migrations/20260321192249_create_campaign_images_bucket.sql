/*
  # Create campaign-images storage bucket

  1. New Storage Bucket
    - `campaign-images`: public bucket for campaign photo uploads
  2. Security
    - Public read access for all users (campaigns are public)
    - Authenticated users can upload/update/delete their own campaign images
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('campaign-images', 'campaign-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view campaign images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'campaign-images');

CREATE POLICY "Authenticated users can upload campaign images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'campaign-images');

CREATE POLICY "Authenticated users can update campaign images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'campaign-images')
  WITH CHECK (bucket_id = 'campaign-images');

CREATE POLICY "Authenticated users can delete campaign images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'campaign-images');
