/*
  # Create video_submissions table

  ## Purpose
  Persists video submissions from creators to campaigns. Previously stored only in-memory (lost on refresh).

  ## New Tables
  - `video_submissions`
    - `id` (uuid, primary key)
    - `user_id` (uuid, foreign key → auth.users)
    - `campaign_id` (text) - matches campaign id (static or supabase)
    - `campaign_name` (text)
    - `brand` (text)
    - `campaign_photo` (text) - URL
    - `platform` (text) - instagram | tiktok | youtube
    - `video_url` (text)
    - `submitted_at` (timestamptz, default now())
    - `status` (text, default 'in_review') - in_review | approved | rejected

  ## Security
  - RLS enabled
  - Authenticated users can insert their own submissions
  - Authenticated users can read their own submissions
  - Authenticated users can delete their own non-in_review submissions
*/

CREATE TABLE IF NOT EXISTS video_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id text NOT NULL,
  campaign_name text NOT NULL DEFAULT '',
  brand text NOT NULL DEFAULT '',
  campaign_photo text NOT NULL DEFAULT '',
  platform text NOT NULL DEFAULT '',
  video_url text NOT NULL DEFAULT '',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'in_review'
);

ALTER TABLE video_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own video submissions"
  ON video_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own video submissions"
  ON video_submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own non-review submissions"
  ON video_submissions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND status != 'in_review');

CREATE POLICY "Users can update own submissions"
  ON video_submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS video_submissions_user_id_idx ON video_submissions(user_id);
CREATE INDEX IF NOT EXISTS video_submissions_campaign_id_idx ON video_submissions(campaign_id);
