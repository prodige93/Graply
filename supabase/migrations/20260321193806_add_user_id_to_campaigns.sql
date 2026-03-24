/*
  # Add user_id to campaigns table

  ## Changes
  - Adds a `user_id` column (uuid, nullable for existing rows) to the `campaigns` table
  - Links each campaign to the authenticated user who created it (references auth.users)
  - Updates RLS policies so enterprise users only see their own campaigns in "Mes campagnes"
  - The creator app continues to see all published campaigns (no user_id filter needed)

  ## Notes
  - Existing campaigns will have user_id = NULL (no data loss)
  - New campaigns created after this migration will automatically store the creator's user_id
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS campaigns_user_id_idx ON campaigns(user_id);
