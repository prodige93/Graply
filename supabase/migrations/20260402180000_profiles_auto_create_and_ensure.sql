/*
  # Profil utilisateur : persistance après reconnexion

  - À l’inscription : une ligne `profiles` est créée avec `id = auth.users.id`.
  - Utilisateurs déjà existants sans ligne : backfill + RPC `ensure_my_profile()` appelée depuis l’app.
  - Sans ligne profil, les UPDATE depuis le client ne touchent aucune ligne : les changements
    restaient seulement en mémoire (état React) puis disparaissaient au logout.
*/

-- Création auto à chaque nouveau compte auth
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- Utilisateurs auth sans profil (comptes créés avant ce trigger)
INSERT INTO public.profiles (id, username, role, display_name, bio)
SELECT
  u.id,
  'username_' || substr(replace(u.id::text, '-', ''), 1, 12),
  COALESCE(u.raw_user_meta_data->>'role', 'creator'),
  '',
  ''
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- RPC : garantir une ligne profil pour la session courante (idempotent)
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

REVOKE ALL ON FUNCTION public.ensure_my_profile() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_my_profile() TO authenticated;
