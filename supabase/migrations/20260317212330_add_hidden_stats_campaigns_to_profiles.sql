/*
  # Add hidden preferences columns to profiles

  1. New Columns
    - `hidden_stats` (text[], default '{}') - stat keys the user hides from their statistics view (e.g. 'views', 'videos', 'rating')
    - `hidden_campaigns` (text[], default '{}') - campaign IDs the user hides from the recent campaigns section

  2. Notes
    - These are user-controlled visibility preferences for the stats tab
    - Empty arrays mean nothing is hidden (default)
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
    WHERE table_name = 'profiles' AND column_name = 'hidden_campaigns'
  ) THEN
    ALTER TABLE profiles ADD COLUMN hidden_campaigns text[] DEFAULT '{}';
  END IF;
END $$;