/*
  # Add Stripe Connect support

  1. Changes
    - Add `stripe_account_id` column to `profiles` table
    - Enable `http` extension for making API calls from Postgres
    - Create `exchange_stripe_code` RPC function that exchanges a Stripe OAuth
      authorization code for a connected account ID and stores it in the profile

  2. Setup required (one-time, via Supabase Dashboard SQL Editor)
    - Store your Stripe secret key in vault:
      SELECT vault.create_secret('sk_test_YOUR_KEY_HERE', 'stripe_secret_key', 'Stripe secret key for Connect OAuth');
    - Enable the Google provider in Stripe Dashboard > Settings > Connect
    - Add your redirect URI in Stripe Dashboard > Settings > Connect > Redirects
*/

-- Add stripe_account_id to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'stripe_account_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN stripe_account_id text DEFAULT '';
  END IF;
END $$;

-- Enable http extension for API calls from Postgres
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Function to exchange Stripe OAuth code for a connected account ID
CREATE OR REPLACE FUNCTION public.exchange_stripe_code(auth_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stripe_key text;
  response record;
  body jsonb;
  account_id text;
  user_id uuid;
BEGIN
  user_id := auth.uid();
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT decrypted_secret INTO stripe_key
  FROM vault.decrypted_secrets
  WHERE name = 'stripe_secret_key'
  LIMIT 1;

  IF stripe_key IS NULL THEN
    RAISE EXCEPTION 'Stripe secret key not configured. Run in SQL Editor: SELECT vault.create_secret(''your_sk_key'', ''stripe_secret_key'');';
  END IF;

  SELECT * INTO response FROM extensions.http_post(
    'https://connect.stripe.com/oauth/token',
    format('client_secret=%s&code=%s&grant_type=authorization_code', stripe_key, auth_code),
    'application/x-www-form-urlencoded'
  );

  body := response.content::jsonb;

  IF body ? 'error' THEN
    RAISE EXCEPTION 'Stripe: %', COALESCE(body->>'error_description', body->>'error');
  END IF;

  account_id := body->>'stripe_user_id';

  IF account_id IS NULL THEN
    RAISE EXCEPTION 'No stripe_user_id in Stripe response';
  END IF;

  UPDATE profiles
  SET stripe_account_id = account_id, updated_at = now()
  WHERE id = user_id;

  RETURN jsonb_build_object('stripe_account_id', account_id);
END;
$$;
