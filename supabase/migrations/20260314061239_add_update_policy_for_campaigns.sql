/*
  # Add update policy for campaigns

  1. Security Changes
    - Add policy for anonymous users to update campaigns (no auth yet)
    - This enables the "edit campaign" feature

  2. Important Notes
    - Temporary anon access until auth is implemented
*/

CREATE POLICY "Anyone can update campaigns"
  ON campaigns
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
