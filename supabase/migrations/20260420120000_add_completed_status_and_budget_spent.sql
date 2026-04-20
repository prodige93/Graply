/*
  # Add completed status + budget_spent column

  ## Changes
  - Adds `budget_spent` numeric column (default 0) to track how much of the budget has been consumed
  - Documents the new 'completed' status value (alongside 'draft', 'published', 'paused')

  ## Notes
  - A campaign is marked 'completed' when budget_spent >= budget (all budget consumed)
  - Completed campaigns no longer appear in the public feed (status != 'published')
  - Completed campaigns appear in a dedicated "Terminé" tab for both enterprise and creator apps
*/

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS budget_spent numeric DEFAULT 0;
