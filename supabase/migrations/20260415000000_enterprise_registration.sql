/*
  Informations d'enregistrement entreprise :
  - Ajoute les colonnes nécessaires à la table profiles
  - Crée le bucket "enterprise-docs" pour les pièces justificatives
*/

-- Colonnes entreprise
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'company_legal_name') THEN
    ALTER TABLE public.profiles
      ADD COLUMN company_legal_name text DEFAULT '',
      ADD COLUMN company_siret text DEFAULT '',
      ADD COLUMN company_country text DEFAULT '',
      ADD COLUMN company_kbis_url text DEFAULT '',
      ADD COLUMN company_rep_name text DEFAULT '',
      ADD COLUMN company_id_doc_url text DEFAULT '',
      ADD COLUMN company_website text DEFAULT '',
      ADD COLUMN company_registration_completed boolean DEFAULT false;
  END IF;
END $$;

-- Bucket pour les documents entreprise (privé)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'enterprise-docs',
  'enterprise-docs',
  false,
  10485760, -- 10 MB
  ARRAY['image/jpeg','image/png','image/webp','application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Les utilisateurs authentifiés peuvent uploader dans leur propre dossier
DROP POLICY IF EXISTS "Enterprise docs upload" ON storage.objects;
CREATE POLICY "Enterprise docs upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'enterprise-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Enterprise docs select" ON storage.objects;
CREATE POLICY "Enterprise docs select"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'enterprise-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Enterprise docs delete" ON storage.objects;
CREATE POLICY "Enterprise docs delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'enterprise-docs' AND (storage.foldername(name))[1] = auth.uid()::text);
  