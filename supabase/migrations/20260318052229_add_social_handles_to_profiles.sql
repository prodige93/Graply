/*
  # Add social handles to profiles

  1. Modified Tables
    - `profiles`
      - `instagram_handle` (text, default '') - Instagram username
      - `tiktok_handle` (text, default '') - TikTok username
      - `youtube_handle` (text, default '') - YouTube channel name

  2. Notes
    - These columns store the social media handles entered by creators
    - Default empty string means not connected
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'instagram_handle'
  ) THEN
    ALTER TABLE profiles ADD COLUMN instagram_handle text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'tiktok_handle'
  ) THEN
    ALTER TABLE profiles ADD COLUMN tiktok_handle text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'youtube_handle'
  ) THEN
    ALTER TABLE profiles ADD COLUMN youtube_handle text DEFAULT '';
  END IF;
END $$;