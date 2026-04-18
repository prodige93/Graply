/*
  # video_submissions — titre affiché côté entreprise

  Colonne optionnelle pour le libellé de la vidéo (sinon fallback UI sur plateforme + date).
*/

ALTER TABLE video_submissions
  ADD COLUMN IF NOT EXISTS video_title text NOT NULL DEFAULT '';
