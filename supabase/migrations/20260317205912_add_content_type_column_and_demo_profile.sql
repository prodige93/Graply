/*
  # Add content_type column and seed demo profile

  1. Modified Tables
    - `profiles`
      - Add `content_type` column (text array, default empty)

  2. Data
    - Insert the demo profile row if it doesn't exist
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'content_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN content_type text[] DEFAULT ARRAY[]::text[];
  END IF;
END $$;

INSERT INTO profiles (id, username, display_name, bio, is_public, website, content_tags, content_type, messaging_enabled)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'username',
  'Username',
  'Marque officielle. Nous collaborons avec des createurs pour inspirer et innover.',
  true,
  '',
  ARRAY['Technologie'],
  ARRAY[]::text[],
  true
)
ON CONFLICT (id) DO NOTHING;
