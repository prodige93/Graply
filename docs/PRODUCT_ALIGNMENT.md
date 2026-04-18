# Alignement produit (PDF pré-lancement)

## Messagerie

- Le document interne mentionne une **v2** pour la messagerie. L’application expose déjà une entrée « Messagerie » : soit on **aligne le texte** du PDF sur l’existant, soit on **limite** les fonctionnalités affichées jusqu’à la v2 (bannière « Bientôt »). À trancher côté produit.

## Dashboard « temps réel »

- **Position actuelle** : affichage **quasi temps réel** — mise à jour lors des changements sur la ligne `profiles` (Realtime si activé) + **polling toutes les 45 secondes** + rechargement après actions locales (ex. déconnexion réseau social).
- Une synchronisation **strictement temps réel** (flux WebSocket par vidéo) n’est pas requise pour la première version si le document accepte cette définition.

## Slides Accueil / Mon compte / Campagnes / Accueil entreprise

- **Une seule logique** : hook `useHeroFeaturedSlides` + données `campaigns` publiées + repli `FALLBACK_HERO_SLIDES` dans `homeHeroFeatured.ts`.
- **Classement** : les campagnes candidates sont triées par **budget numérique décroissant**, puis par ordre d’arrivée dans le lot récent ; les **5** premières alimentent le carrousel.

## Scraping des vues

- **TikTok** : `view_count` récupéré via l’API vidéo (champ demandé dans `sync_tiktok_videos`).
- **YouTube** : `view_count` via `videos.list` + `statistics.viewCount` (`refresh_youtube_view_counts` après synchro).
- **Instagram** : colonne `view_count` prête, souvent **0** tant que l’API utilisée n’expose pas les vues par média sans appel Insights supplémentaire.

## Solde créateur (`creator_wallet_balance`)

- Le montant affiché doit être alimenté par votre logique métier (versements, webhooks Stripe, etc.). Le retrait remet le solde à zéro côté profil après validation métier.
