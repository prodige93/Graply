# Page Créateur — PDF « Graply page créateur » (synthèse)

Référence : checklist pré-lancement (profil, accueil, vérifier ma vidéo, validations, dashboard, recherche, paramètres, etc.).

## Profil créateur

| Exigence | État |
|----------|------|
| **Mode privé** : invisible sauf bannière, photo, compteurs campagnes / vidéos | **Fait** : RPC `get_creator_profile_preview` + `/u/:username` affiche un mode restreint (bio, tags, réseaux, site masqués). Compteurs : vues Graply, vidéos approuvées, campagnes avec au moins une vidéo approuvée. |
| Modification profil / synchro | Déjà géré côté `ProfilePage` / Supabase (hors périmètre de cette passe). |
| **Messagerie** : si profil **public** et interrupteur **activé** | **Fait** : bouton Message masqué si `!is_public \|\| !messaging_enabled` (aligné PDF : public + option). |
| Campagnes / onglets synchronisés | Logique existante (`MyCampaignsContext`, onglets) — QA manuelle. |
| **Statistiques** (vues Graply, vidéos, campagnes après acceptation) | **Fait** sur la vue publique `/u/:username` via RPC + `clip_views_total` / agrégats `video_submissions`. |

## Accueil

| Exigence | État |
|----------|------|
| Carrousel ≤ 5 visuels | Déjà `MAX_HERO_FEATURED_SLIDES` + `mapCampaignRowsToHeroSlides` ; requête campagnes limitée à 12 entrées avant mapping. |

## Vérifier ma vidéo

| Exigence | État |
|----------|------|
| Page listant enregistrées / vidéo déjà envoyée / accepté (privé) | **Fait** : route **`/verifier-ma-video`** + composant **`VerifyVideoCampaignPicker`** (sections optionnelles). `openVerifyModal()` redirige vers cette page lorsque `MobileLayout` a enregistré le `navigate`. |
| Flux existant depuis une campagne | Inchangé : `/campagne/:id/verification`. |

## Validations & dashboard

| Exigence | État |
|----------|------|
| Encadrés, candidatures, scraping / rémunération | Partiellement couvert ailleurs (`creatorPayoutRules`, migrations vues) — voir backlog produit. |
| Retrait hebdomadaire | Déjà traité dans une passe précédente (`last_creator_withdrawal_at`, règles). |

## Recherche

| Exigence | État |
|----------|------|
| Utilisateurs / marques, pas de recherche de campagnes dans cet écran | **OK** : `CreatorSearchPage` = créateurs mock ; pas de recherche campagne ici. |

## Paramètres & compte

| Exigence | État |
|----------|------|
| E-mail, téléphone, mot de passe, A2F | Déjà dans `SettingsPage` + `SettingsSecurityPrivacySection` + `MfaEnrollmentPanel`. |
| Politique / données / YouTube dans catégorie dédiée | Déjà regroupé dans « Compte, confidentialité et données ». |
| Carrousel Mon compte = accueil | Déjà `useHeroFeaturedSlides` partagé. |

## Fichiers principaux (cette passe)

- `supabase/migrations/20260418160000_creator_profile_preview_rpc.sql`
- `src/shared/lib/creatorProfilePreview.ts`
- `src/creator/pages/UserProfilePage.tsx`, `src/enterprise/pages/UserProfilePage.tsx`
- `src/shared/lib/verifyVideoCampaignData.ts`, `src/creator/components/VerifyVideoCampaignPicker.tsx`
- `src/creator/pages/VerifyVideoHubPage.tsx`, `src/creator/components/VerifyVideoModal.tsx`
- `src/shared/lib/verifyEvent.ts` (`setVerifyVideoNavigate`)
- `src/creator/components/MobileLayout.tsx`

## Backlog explicite

- Messagerie « V2 » (PDF) : hors scope.
- Tableaux de bord / graphiques : QA métier.
- Classement campagnes + masquage nom : dépend des données `hidden_*` sur profil — à recouper avec l’UI campagne.
