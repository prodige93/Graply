/*
  # Add delete policy for draft campaigns

  1. Security Changes
    - Add DELETE policy on `campaigns` table to allow deleting draft campaigns
    - Only drafts (status = 'draft') can be deleted
    - Restricted to authenticated users

  2. Notes
    - Published campaigns cannot be deleted through this policy
    - This supports the "Mes brouillons" feature where users can remove unwanted drafts
*/

CREATE POLICY "Authenticated users can delete draft campaigns"
  ON campaigns
  FOR DELETE
  TO authenticated
  USING (status = 'draft');
