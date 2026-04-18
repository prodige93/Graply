# Infra, déploiement et QA manuelle (pré-lancement)

Ce document complète le code : il décrit ce qui relève de l’exploitation, des vérifications humaines et des environnements, pas du seul dépôt applicatif.

## Infrastructure

- **Capacité & résilience** : planifier un audit charge (pics de connexion, webhooks Stripe, jobs Supabase) sur l’environnement de **production** ; définir des alertes (latence, erreurs 5xx, quotas API TikTok / YouTube / Instagram).
- **Secrets** : variables `VITE_*`, clés Stripe, OAuth Google/TikTok/YouTube/Instagram, et secrets Vault Supabase (`stripe_secret_key`, etc.) doivent être présents et distincts par environnement.
- **Base Supabase** : appliquer les migrations dans l’ordre (`supabase db push` ou pipeline CI). Vérifier que l’extension `http` est disponible pour les RPC de synchro vidéo.
- **Realtime** : pour que le dashboard reçoive les mises à jour `profiles` en direct, activer la réplication Realtime sur la table `public.profiles` (ou s’appuyer sur le polling 45 s déjà prévu en secours).

## QA manuelle (extraits)

### Authentification

- Connexion e-mail / mot de passe, Google OAuth, flux « mot de passe oublié » jusqu’à réception du mail.
- Changement d’e-mail et confirmation côté boîte mail.

### Carrousel « Top campagnes »

- Accueil créateur, accueil entreprise, page Campagnes, Mon compte : vérifier que les **mêmes** campagnes publiées (tri budget puis fraîcheur) apparaissent, avec image et titre cohérents.
- Sans campagne publiée : affichage des visuels de secours.

### Vues & retraits créateur

- Connecter TikTok et/ou YouTube, lancer une synchro (ouvrir le dashboard / recharger) : `clip_views_total` doit augmenter si les APIs renvoient des vues.
- Vérifier le seuil d’éligibilité au retrait (5 000 vues) et la limite **un retrait / 7 jours** avec messages adaptés.

### Régression navigation

- Depuis le bandeau Campagnes, « Voir la campagne » ouvre `/cagne/:uuid` lorsque l’UUID existe.

## Scénarios de non-régression automatisables plus tard

- Tests E2E (Playwright) sur les parcours critique : connexion, liste campagnes, candidature, dashboard.
- Monitoring des erreurs front (Sentry ou équivalent) en production.
