/*
  # Add saved_campaign_ids to profiles

  ## Summary
  Adds a `saved_campaign_ids` column to the profiles table to persist saved campaigns
  per user. This allows synchronization of saved campaigns across the creator app and
  the enterprise app since both share the same Supabase backend and user account.

  ## Changes
  - `profiles` table: new column `saved_campaign_ids` (text array, default empty array)

  ## Notes
  - No data loss: existing rows get an empty array as default
  - The update RLS policy already exists and covers this new column
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'saved_campaign_ids'
  ) THEN
    ALTER TABLE profiles ADD COLUMN saved_campaign_ids text[] DEFAULT '{}' NOT NULL;
  END IF;
END $$;
