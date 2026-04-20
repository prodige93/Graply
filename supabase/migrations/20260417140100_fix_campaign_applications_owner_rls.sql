/*
  # Restrict campaign_applications owner policies to real campaign owners

  Previous policies allowed any authenticated user to read/update applications
  for any campaign because EXISTS only checked campaign id match, not ownership.
*/

DROP POLICY IF EXISTS "Campaign owners can read applications" ON campaign_applications;
DROP POLICY IF EXISTS "Campaign owners can update application status" ON campaign_applications;

CREATE POLICY "Campaign owners can read applications"
  ON campaign_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_applications.campaign_id
        AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Campaign owners can update application status"
  ON campaign_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_applications.campaign_id
        AND campaigns.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_applications.campaign_id
        AND campaigns.user_id = auth.uid()
    )
  );
