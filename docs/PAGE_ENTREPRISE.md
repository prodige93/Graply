# Page Entreprise — exigences PDF et état d’implémentation

Document de référence : checklist « Page Entreprise » (Mon profil, Mes campagnes, Création, Validation, Dashboard, etc.).

## Mon profil

| Exigence | Implémentation |
|----------|----------------|
| Modification du profil | Formulaire d’édition (bio, site, tags) + enregistrement Supabase. |
| Public / privé | Toggle `is_public` (inchangé). |
| Tags de contenu | Multi-sélection + sauvegarde `content_tags`. |
| Lien site web | Champ `website` éditable. |
| Réseaux sociaux | **Ajout** : édition **Instagram / TikTok / YouTube** (`instagram_handle`, `tiktok_handle`, `youtube_handle`) dans le mode édition du profil entreprise. |
| Catégories campagnes (en cours, pause, enregistrées, brouillons) | Données via `MyCampaignsContext` + onglets `CampaignTabContext` ; synchro fine = QA manuelle. |

## Mes campagnes & actions

| Exigence | Implémentation |
|----------|----------------|
| Parité avec Mon profil | Même source de données contextuelle ; vérifier navigation et cartes (QA). |
| Créer ma campagne | Route `creer-campagne` ; bouton déjà présent. |

## Créer ma campagne

| Exigence | Implémentation |
|----------|----------------|
| Champs obligatoires (*) entre étapes | Déjà géré par `isStepValid` (général, détails, récompense, contenu, paramètres). |
| Budget minimum **300 €** (détails) | **Fait** : validation et message d’erreur à 300 € (plus 500 €). Constante `MIN_CAMPAIGN_BUDGET_EUR`. |
| Récompense : ≥ **1 €** / 1 000 vues | **Fait** : `validateRewardRow` + `MIN_PER_1000_VIEWS_EUR`. |
| Paiement minimum **≥ 1 €** | **Fait** : `MIN_SINGLE_PAYMENT_EUR`. |
| Paiement max ≤ budget (ligne ou total) | **Fait** : comparaison au budget plateforme ou au budget campagne si une seule plateforme. |
| Multi-plateformes : budget alloué par plateforme obligatoire | **Fait** : chaque ligne doit avoir un montant > 0. |
| Paramètres : abonnés min si option activée | **Fait** : étape Paramètres valide un nombre > 0 si « abonnés requis » est coché. |
| Seuil par réseau (ex. 12k IG + 12k TikTok) | **Partiel** : un seul champ global pour l’instant ; note d’UI vers candidature / validation créateur pour la logique par plateforme. |
| Candidature ⇒ confidentialité obligatoire | **Fait** : `require_application` force `require_review` ; toggle confidentialité désactivé tant que la candidature est active. |
| Publier → Stripe → accueil | **Backlog** : enchaînement paiement + webhook + statut `published` à brancher sur l’API Stripe existante ou une session « budget marque » dédiée. |

## Validation (créateurs & vidéos)

| Exigence | Implémentation |
|----------|----------------|
| Encadrés stats | Pages dédiées existantes ; comportement métier (refus, notifs, vues min/max, budget épuisé) = **à valider / compléter** côté produit et éventuellement backend. |
| Vues scrapées après acceptation | Partiellement couvert par les RPC vues côté créateur ; règles par campagne entreprise = extension future. |

## Dashboard entreprise

| Exigence | Implémentation |
|----------|----------------|
| Filtres réseau, dates, vues/coûts | UI présente ; tests manuels recommandés. |
| Clic campagne / créateur | Liens existants ; QA recommandée. |

## Recherche, messagerie, enregistrés

Comportement aligné sur l’app créateur (réutilisation des patterns) — **tests manuels**.

## Mon compte & paramètres

Identique créateur sauf badge — inchangé ; badge entreprise déjà distinct où applicable.

---

## Récap des fichiers modifiés / ajoutés (cette passe)

- `src/enterprise/lib/campaignBudgetRules.ts` — règles budgétaires centralisées.
- `src/enterprise/pages/CreateCampaignPage.tsx` — validation étapes (budget 300 €, récompenses, paramètres abonnés, lien candidature → confidentialité).
- `src/enterprise/components/create-campaign/StepTwo.tsx` — seuil 300 € affiché.
- `src/enterprise/components/create-campaign/StepThree.tsx` — texte d’aide conforme au PDF.
- `src/enterprise/components/create-campaign/StepFive.tsx` — confidentialité verrouillée si candidature, libellés clarifiés.
- `src/enterprise/pages/ProfilePage.tsx` — édition des handles réseaux.

Prochaine étape prioritaire hors scope immédiat : **flux Stripe post-publication** (session checkout + statut campagne + webhook).
