/*
  # video_submissions — métriques et accès propriétaire de campagne

  - Ajoute view_count et payout_amount (suivi post-validation).
  - Permet aux entreprises (campaigns.user_id = auth.uid()) de lire et
    mettre à jour les soumissions liées à leurs campagnes (ex. approuver,
    renseigner vues / versement).
*/

ALTER TABLE video_submissions
  ADD COLUMN IF NOT EXISTS view_count bigint NOT NULL DEFAULT 0;

ALTER TABLE video_submissions
  ADD COLUMN IF NOT EXISTS payout_amount numeric(14, 2) NOT NULL DEFAULT 0;

CREATE POLICY "Campaign owners can read video submissions for own campaigns"
  ON video_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM campaigns c
      WHERE c.user_id = auth.uid()
        AND c.id::text = video_submissions.campaign_id
    )
  );

CREATE POLICY "Campaign owners can update video submissions on own campaigns"
  ON video_submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM campaigns c
      WHERE c.user_id = auth.uid()
        AND c.id::text = video_submissions.campaign_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM campaigns c
      WHERE c.user_id = auth.uid()
        AND c.id::text = video_submissions.campaign_id
    )
  );
