/*
  # Fix campaign_applications RLS for campaign owners

  Previous policies used EXISTS (SELECT 1 FROM campaigns WHERE id = …) without
  checking ownership, so any authenticated user could read/update all applications.

  Owners are identified by campaigns.user_id = auth.uid().
*/

DROP POLICY IF EXISTS "Campaign owners can read applications" ON campaign_applications;

CREATE POLICY "Campaign owners can read applications"
  ON campaign_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_applications.campaign_id
        AND campaigns.user_id IS NOT NULL
        AND campaigns.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Campaign owners can update application status" ON campaign_applications;

CREATE POLICY "Campaign owners can update application status"
  ON campaign_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_applications.campaign_id
        AND campaigns.user_id IS NOT NULL
        AND campaigns.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_applications.campaign_id
        AND campaigns.user_id IS NOT NULL
        AND campaigns.user_id = auth.uid()
    )
  );
