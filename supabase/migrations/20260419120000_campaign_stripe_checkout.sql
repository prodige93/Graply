-- Paiement entreprise avant publication : suivi Stripe + horodatage

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

COMMENT ON COLUMN public.campaigns.stripe_checkout_session_id IS 'Dernière session Stripe Checkout pour le budget campagne (entreprise).';
COMMENT ON COLUMN public.campaigns.paid_at IS 'Date de confirmation du paiement (webhook checkout.session.completed).';

-- Statut texte : draft | pending_checkout | published | paused (inchangé, valeurs applicatives)
