/*
  # Add anon read/update policies for demo profile

  Allows the demo profile (fixed UUID) to be read and updated
  without authentication, so the public/private toggle works
  correctly in the app without requiring a logged-in user.

  1. New Policies
    - anon can SELECT the demo profile regardless of is_public value
    - anon can UPDATE the demo profile
*/

DROP POLICY IF EXISTS "Anon can view demo profile" ON profiles;
CREATE POLICY "Anon can view demo profile"
  ON profiles FOR SELECT
  TO anon
  USING (id = '00000000-0000-0000-0000-000000000001'::uuid);

DROP POLICY IF EXISTS "Anon can update demo profile" ON profiles;
CREATE POLICY "Anon can update demo profile"
  ON profiles FOR UPDATE
  TO anon
  USING (id = '00000000-0000-0000-0000-000000000001'::uuid)
  WITH CHECK (id = '00000000-0000-0000-0000-000000000001'::uuid);
