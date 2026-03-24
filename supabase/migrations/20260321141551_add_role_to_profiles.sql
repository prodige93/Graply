/*
  # Add role column to profiles table

  1. Changes
    - `profiles` table: add `role` column (text) to distinguish between 'creator' and 'enterprise' accounts
    - Default is 'creator' for all existing profiles
    - This enables the search overlay in both apps to show results with the correct type label
      and to filter/categorize profiles by their role

  2. Notes
    - Existing profiles will default to 'creator'
    - Enterprise signups should set role = 'enterprise'
    - The search in both apps will use this column to display "Créateurs" vs "Entreprises" sections
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'creator';
  END IF;
END $$;
