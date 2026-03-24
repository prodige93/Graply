/*
  # Add content_type to profiles

  1. Changes
    - `profiles` table: add `content_type` column (text array) to store the creator's content type(s): 'clipping', 'ugc', or both
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'content_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN content_type text[] DEFAULT '{}';
  END IF;
END $$;
