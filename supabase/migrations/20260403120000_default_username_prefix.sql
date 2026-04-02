/*
  # Pseudo par défaut : préfixe username_ (affiché « username » côté app)

  Remplace le préfixe u_ par username_<12 hex de l’id> pour les nouveaux comptes.
  Unicité conservée ; l’app affiche « username » tant que la valeur reste auto-générée.
*/

-- Profils déjà créés avec l’ancien u_<32 hex>
UPDATE public.profiles
SET
  username = 'username_' || substr(replace(id::text, '-', ''), 1, 12),
  updated_at = now()
WHERE username ~ '^u_[a-f0-9]{32}$';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uname text := 'username_' || substr(replace(NEW.id::text, '-', ''), 1, 12);
  rrole text := COALESCE(NEW.raw_user_meta_data->>'role', 'creator');
BEGIN
  INSERT INTO public.profiles (id, username, role, display_name, bio)
  VALUES (NEW.id, uname, rrole, '', '')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_my_profile()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  uname text;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = uid) THEN
    RETURN;
  END IF;

  uname := 'username_' || substr(replace(uid::text, '-', ''), 1, 12);
  INSERT INTO public.profiles (id, username, role, display_name, bio)
  VALUES (
    uid,
    uname,
    COALESCE(
      (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = uid),
      'creator'
    ),
    '',
    ''
  )
  ON CONFLICT (id) DO NOTHING;
END;
$$;
