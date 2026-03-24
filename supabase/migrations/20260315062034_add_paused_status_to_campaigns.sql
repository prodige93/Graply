/*
  # Add paused status support to campaigns

  ## Changes
  - Adds 'paused' as a valid status value for campaigns (alongside 'draft' and 'published')
  - No schema change needed since status is a text column — just documenting the new value

  ## Notes
  - Paused campaigns are campaigns previously published but temporarily halted by their owner
  - The UI will show a yellow "En pause" badge for paused campaigns
  - Paused campaigns can be resumed (status goes back to 'published')
*/

-- No DDL needed, status column is already text type.
-- This migration documents the intent and can serve as a checkpoint.
SELECT 1;
