/*
  # Add anon RLS policies for the demo profile

  1. Changes
    - Add SELECT policy for `anon` role on `profiles` table for the demo profile
    - Add UPDATE policy for `anon` role on `profiles` table for the demo profile
    - Add INSERT policy for `anon` role on `profiles` table for the demo profile

  2. Security
    - Policies are scoped to a single known demo profile ID only
    - No other rows can be accessed by anon
*/

CREATE POLICY "Anon can view demo profile"
  ON profiles
  FOR SELECT
  TO anon
  USING (id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Anon can update demo profile"
  ON profiles
  FOR UPDATE
  TO anon
  USING (id = '00000000-0000-0000-0000-000000000001'::uuid)
  WITH CHECK (id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Anon can insert demo profile"
  ON profiles
  FOR INSERT
  TO anon
  WITH CHECK (id = '00000000-0000-0000-0000-000000000001'::uuid);
