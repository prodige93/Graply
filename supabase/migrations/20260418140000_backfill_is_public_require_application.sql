/*
  # Aligner is_public avec require_application

  Les insertions d’historique n’envoyaient pas `is_public`, donc la valeur par défaut
  `true` restait alors que `require_application = true` (campagne par candidature).
  Corrige les lignes incohérentes pour que le catalogue et les agrégations « privé »
  correspondent au comportement attendu.
*/

UPDATE campaigns
SET is_public = false
WHERE COALESCE(require_application, false) = true
  AND is_public = true;
