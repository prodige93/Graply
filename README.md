# Graply

**Site :** [https://graply.io](https://graply.io)

Plateforme de mise en relation **marques** et **créateurs** (UGC, campagnes, suivi des performances). Ce dépôt contient l’application web (React + Vite), l’API Express (paiements Stripe, webhooks Meta/Instagram), les migrations **Supabase** et un service optionnel de suivi UGC.

---

## Sommaire

- [Prérequis](#prérequis)
- [Structure du dépôt](#structure-du-dépôt)
- [Installation](#installation)
- [Variables d’environnement](#variables-denvironnement)
- [Développement local](#développement-local)
- [Build & déploiement front (Netlify)](#build--déploiement-front-netlify)
- [Base de données (Supabase)](#base-de-données-supabase)
- [Sécurité](#sécurité)

---

## Prérequis

- **Node.js** 20+ (recommandé)
- **npm**
- Un projet **[Supabase](https://supabase.com)** (URL + clé anon + `service_role` pour le backend)
- Comptes **Stripe**, **Meta / Instagram**, **TikTok**, **Google (YouTube)** selon les fonctionnalités activées

---

## Structure du dépôt

| Dossier | Rôle |
|--------|------|
| `src/` | Front React (parcours créateur & entreprise, dashboard, OAuth callback) |
| `public/` | Assets statiques, `oauth-redirect.html` pour les retours OAuth |
| `backend/` | API **Express** : checkout entreprise, webhooks Stripe, webhooks Meta/Instagram |
| `supabase/migrations/` | Schéma SQL et RPC (auth, campagnes, connexions sociales, etc.) |
| `ugc-tracking-service/` | Service optionnel (scraping / stats vidéos) |
| `scripts/patch-netlify-redirects.mjs` | Après `vite build`, génère `dist/_redirects` (proxy `/api` → backend) |
| `ENV_SETUP.txt` | Liste des **noms** de variables d’environnement (sans secrets) |

---

## Installation

```bash
git clone https://github.com/prodige93/Graply.git
cd Graply
npm install
npm run backend:install
```

---

## Variables d’environnement

Les fichiers **`.env`** ne sont **pas** versionnés. Crée-les localement à partir de la liste dans **`ENV_SETUP.txt`** (racine, `backend/`, `ugc-tracking-service/`).

Les secrets OAuth côté Supabase (ex. Instagram) se configurent dans le **Vault** du projet Supabase (voir commentaires dans les migrations concernées).

---

## Développement local

**1. Front (Vite)** — [http://localhost:5173](http://localhost:5173)

```bash
npm run dev
```

Le fichier `vite.config.ts` proxifie **`/api`** vers **`http://localhost:3300`** pour coller au backend local.

**2. Backend (Express)**

```bash
npm run backend:dev
```

Ou : `cd backend && npm install && npm run dev`

Crée **`backend/.env`** (voir `ENV_SETUP.txt`) : Stripe, Supabase `service_role`, `META_APP_SECRET` / `INSTAGRAM_WEBHOOK_VERIFY_TOKEN` si tu testes les webhooks Meta.

**3. Qualité**

```bash
npm run lint
npm run typecheck
```

---

## Build & déploiement front (Netlify)

```bash
npm run build
```

- Publie le dossier **`dist/`** (voir `netlify.toml`).
- **`BACKEND_PUBLIC_URL`** (variable Netlify au build) : URL HTTPS publique du backend Node **sans** slash final (ex. `https://api.graply.io` ou ton URL Render). Elle sert à générer le proxy **`/api/*`** dans `_redirects`.
- Si la variable est absente, le script utilise par défaut **`https://api.graply.io`** : adapte DNS + déploiement ou la variable.

---

## Base de données (Supabase)

1. Lier le projet : `supabase link` (CLI) ou appliquer les migrations depuis le **SQL Editor** / **Migrations** du dashboard.
2. Les fichiers sous **`supabase/migrations/`** décrivent le schéma attendu par l’app (RLS, RPC, stockage, OAuth, etc.).

---

## Sécurité

- Ne **jamais** committer de `.env`, clés API, jetons ou fichiers `*.vault.local.sql`.
- Le dépôt suit une politique stricte dans **`.gitignore`** ; les détails des variables sont listés dans **`ENV_SETUP.txt`** sans valeurs sensibles.

---

## Licence & contact

Projet **privé** — droits réservés. Pour toute question sur le déploiement ou l’accès aux environnements **graply.io**, contacte l’équipe propriétaire du dépôt.
