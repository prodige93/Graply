/*
  # Fix campaigns RLS policies

  The INSERT/SELECT/UPDATE policies were assigned only to the `anon` role,
  blocking authenticated users from inserting or reading campaigns.
  This migration drops the incorrect policies and recreates them for both
  anon and authenticated roles.
*/

DROP POLICY IF EXISTS "Anyone can insert campaigns" ON campaigns;
DROP POLICY IF EXISTS "Anyone can read campaigns" ON campaigns;
DROP POLICY IF EXISTS "Anyone can update campaigns" ON campaigns;

CREATE POLICY "Anyone can read campaigns"
  ON campaigns FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert campaigns"
  ON campaigns FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update campaigns"
  ON campaigns FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
