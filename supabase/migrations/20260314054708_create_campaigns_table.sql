/*
  # Create campaigns table

  1. New Tables
    - `campaigns`
      - `id` (uuid, primary key)
      - `name` (text, not null) - Campaign name
      - `description` (text) - Campaign description
      - `photo_url` (text) - URL/base64 of the campaign photo
      - `budget` (text, not null) - Budget amount
      - `content_type` (text, not null) - UGC or Clipping
      - `categories` (text array) - Selected categories
      - `platforms` (text array) - Selected platforms (instagram, youtube, tiktok)
      - `platform_budgets` (jsonb) - Budget details per platform
      - `information` (text) - Additional information/brief
      - `rules` (text array) - Campaign rules
      - `require_followers` (boolean) - Whether minimum followers is required
      - `min_followers` (text) - Minimum followers count
      - `require_application` (boolean) - Whether application is required
      - `require_review` (boolean) - Whether review is required
      - `status` (text) - Campaign status (published, draft)
      - `created_at` (timestamptz) - Creation timestamp
  2. Security
    - Enable RLS on `campaigns` table
    - Add policy for anonymous users to insert campaigns (no auth yet)
    - Add policy for anonymous users to read campaigns (no auth yet)
*/

CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  photo_url text,
  budget text NOT NULL,
  content_type text NOT NULL,
  categories text[] DEFAULT '{}',
  platforms text[] DEFAULT '{}',
  platform_budgets jsonb DEFAULT '{}',
  information text DEFAULT '',
  rules text[] DEFAULT '{}',
  require_followers boolean DEFAULT false,
  min_followers text DEFAULT '',
  require_application boolean DEFAULT false,
  require_review boolean DEFAULT false,
  status text DEFAULT 'published',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert campaigns"
  ON campaigns
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read campaigns"
  ON campaigns
  FOR SELECT
  TO anon
  USING (true);
