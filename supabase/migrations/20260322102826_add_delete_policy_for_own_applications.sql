/*
  # Add DELETE policy for campaign_applications

  Allows authenticated users to delete their own non-pending applications
  (used when removing rejected/accepted applications from the UI).
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'campaign_applications'
    AND policyname = 'Users can delete own applications'
  ) THEN
    EXECUTE '
      CREATE POLICY "Users can delete own applications"
        ON campaign_applications
        FOR DELETE
        TO authenticated
        USING (auth.uid() = user_id)
    ';
  END IF;
END $$;
