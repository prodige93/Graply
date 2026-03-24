/*
  # Allow deleting any campaign (not just drafts)

  1. Security Changes
    - Drop the existing delete policy that only allows deleting drafts
    - Add a new DELETE policy that allows authenticated users to delete any campaign
    - This supports both draft deletion and published campaign deletion features

  2. Notes
    - Applies to all campaign statuses (draft, published, etc.)
    - Restricted to authenticated users only
*/

DROP POLICY IF EXISTS "Authenticated users can delete draft campaigns" ON campaigns;

CREATE POLICY "Authenticated users can delete campaigns"
  ON campaigns
  FOR DELETE
  TO authenticated
  USING (true);