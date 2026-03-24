/*
  # Add messaging_enabled to profiles

  1. Modified Tables
    - `profiles`
      - `messaging_enabled` (boolean, default true) - Controls whether the user accepts incoming messages

  2. Notes
    - Allows users to toggle messaging on/off from their profile
    - Defaults to true so existing users can receive messages by default
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'messaging_enabled'
  ) THEN
    ALTER TABLE profiles ADD COLUMN messaging_enabled boolean DEFAULT true;
  END IF;
END $$;
