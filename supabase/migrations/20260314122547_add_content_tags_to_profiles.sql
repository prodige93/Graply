/*
  # Add content_tags to profiles

  1. Modified Tables
    - `profiles`
      - `content_tags` (text[], default '{}') - Array of content category tags for the profile

  2. Notes
    - Allows users to display and manage their content categories (e.g., Technologie, Lifestyle, Gaming)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'content_tags'
  ) THEN
    ALTER TABLE profiles ADD COLUMN content_tags text[] DEFAULT '{}';
  END IF;
END $$;

UPDATE profiles
SET content_tags = ARRAY['Technologie']
WHERE id = '00000000-0000-0000-0000-000000000001' AND (content_tags IS NULL OR content_tags = '{}');
