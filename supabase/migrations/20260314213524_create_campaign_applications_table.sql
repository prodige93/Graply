/*
  # Create campaign_applications table

  1. New Tables
    - `campaign_applications`
      - `id` (uuid, primary key)
      - `campaign_id` (uuid, foreign key to campaigns)
      - `user_id` (uuid, foreign key to auth.users)
      - `motivation` (text) - why the creator wants to join
      - `status` (text) - pending, accepted, rejected
      - `reject_reason` (text) - reason if rejected
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `campaign_applications` table
    - Authenticated users can insert their own applications
    - Authenticated users can read their own applications
    - Campaign owners can read applications for their campaigns
    - Campaign owners can update application status
*/

CREATE TABLE IF NOT EXISTS campaign_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  motivation text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  reject_reason text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(campaign_id, user_id)
);

ALTER TABLE campaign_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own applications"
  ON campaign_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own applications"
  ON campaign_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Campaign owners can read applications"
  ON campaign_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_applications.campaign_id
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
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_applications.campaign_id
    )
  );
