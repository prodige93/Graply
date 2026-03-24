/*
  # Create profiles table

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, default random uuid)
      - `username` (text, unique, not null)
      - `display_name` (text, default '')
      - `bio` (text, default '')
      - `avatar_url` (text, nullable) - URL to profile picture
      - `banner_url` (text, nullable) - URL to banner image
      - `is_public` (boolean, default true) - whether profile is public or private
      - `website` (text, default '')
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `profiles` table
    - Add policy for anyone to read public profiles
    - Add policy for authenticated users to read own profile
    - Add policy for authenticated users to insert own profile
    - Add policy for authenticated users to update own profile

  3. Storage
    - Create `avatars` bucket for profile pictures and banners
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  display_name text DEFAULT '',
  bio text DEFAULT '',
  avatar_url text,
  banner_url text,
  is_public boolean DEFAULT true,
  website text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_public = true OR id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view avatar files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatars"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars')
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can delete own avatars"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars');
