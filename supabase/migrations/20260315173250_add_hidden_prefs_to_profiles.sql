/*
  # Add hidden_stats and hidden_platforms to profiles

  1. Changes
    - `hidden_stats` (text[], default '{}') — list of stat labels the user has hidden from their public profile
    - `hidden_platforms` (text[], default '{}') — list of platform keys the user has hidden from their public profile

  2. Notes
    - These columns are set by the profile owner and respected on public profile views
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'hidden_stats'
  ) THEN
    ALTER TABLE profiles ADD COLUMN hidden_stats text[] DEFAULT '{}';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'hidden_platforms'
  ) THEN
    ALTER TABLE profiles ADD COLUMN hidden_platforms text[] DEFAULT '{}';
  END IF;
END $$;
