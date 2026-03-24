/*
  # Recreate profiles table with public access

  ## Problem
  The profiles table does not exist in the database, which means all profile updates
  (avatar, banner, username, bio) are silently failing. The app uses a fixed profile ID
  without authentication, so policies requiring `authenticated` users also block all access.

  ## Changes
  1. Create the `profiles` table with all required columns
  2. Enable RLS with PUBLIC access policies (no auth required) since this is a single-user app
  3. Insert the default profile row used by the app (PROFILE_ID = 00000000-0000-0000-0000-000000000001)

  ## Tables
  - `profiles`: stores user profile data (avatar, banner, username, bio, etc.)

  ## Security
  - Public SELECT, INSERT, UPDATE allowed (app has no authentication)
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
  content_tags text[] DEFAULT '{}',
  messaging_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read profiles"
  ON profiles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert profiles"
  ON profiles FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update profiles"
  ON profiles FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

INSERT INTO profiles (id, username, display_name, bio, is_public, website, content_tags, messaging_enabled)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'moncompte',
  '',
  '',
  true,
  '',
  '{}',
  true
)
ON CONFLICT (id) DO NOTHING;
