/*
  # Add is_public to campaigns

  - Private campaigns (`is_public = false`) drive creator UX: candidature vs postuler direct.
  - Backfill from require_application (candidature = private).
*/

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true;

UPDATE campaigns
SET is_public = NOT COALESCE(require_application, false);
