/*
  # Add enterprise saved campaign IDs to profiles

  1. Modified Tables
    - `profiles`
      - Added `enterprise_saved_campaign_ids` (text[], default '{}')
        Separate saved campaigns list for the enterprise app,
        so enterprise and creator saved campaigns do not interfere.

  2. Important Notes
    - The existing `saved_campaign_ids` column remains untouched (creator app).
    - This new column is used exclusively by the enterprise app sidebar "Enregistre".
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'enterprise_saved_campaign_ids'
  ) THEN
    ALTER TABLE profiles ADD COLUMN enterprise_saved_campaign_ids text[] DEFAULT '{}';
  END IF;
END $$;
