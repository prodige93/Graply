-- Champs profil pour contact, suivi des vues clips (alimenté par jobs plus tard),
-- solde créateur et limitation des retraits (voir app).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text DEFAULT ''::text;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS clip_views_total bigint NOT NULL DEFAULT 0;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS creator_wallet_balance numeric(12, 2) NOT NULL DEFAULT 0;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_creator_withdrawal_at timestamptz;

COMMENT ON COLUMN public.profiles.phone IS 'Téléphone affiché / édité depuis les paramètres.';
COMMENT ON COLUMN public.profiles.clip_views_total IS 'Vues cumulées sur les vidéos Graply (synchro backend).';
COMMENT ON COLUMN public.profiles.creator_wallet_balance IS 'Solde disponible pour retrait créateur (EUR).';
COMMENT ON COLUMN public.profiles.last_creator_withdrawal_at IS 'Dernier retrait demandé depuis le dashboard créateur.';
