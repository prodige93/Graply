<div align="center">

<!-- Bannière en PNG : GitHub n’affiche en général pas les SVG dans <img> du README (politique de sécurité). La source éditable reste `.github/assets/readme-hero.svg`. -->
<img src=".github/assets/readme-hero.png" alt="Graply — bannière" width="100%" />

<br/>

<a href="https://graply.io"><img src="https://img.shields.io/badge/Site-graply.io-7c3aed?style=for-the-badge&logo=googlechrome&logoColor=white" alt="graply.io" /></a>
<img src="https://img.shields.io/badge/Statut-En%20d%C3%A9veloppement-f59e0b?style=for-the-badge" alt="En développement" />

<br/><br/>

<img src="public/graply-app-icon.jpg" alt="Icône Graply" width="120" />

<br/>

**Plateforme de mise en relation entre marques et créateurs** — campagnes UGC, candidatures, suivi des contenus et des performances sur les réseaux.

[Site](https://graply.io) · [Dépôt](https://github.com/prodige93/Graply)

</div>

---

## Statut du projet et graply.io

Ce dépôt est un **projet en développement actif** : l’interface, les parcours métier et les intégrations **changent encore** (bugs possibles, régressions temporaires, fonctionnalités inachevées). Le badge **« En développement »** en tête du README rappelle exactement cela : **ne pas attendre un produit figé** comme en production stable.

**Ce que tu vois sur graply.io** (page d’accueil, message du fournisseur d’hébergement, « site en construction », etc.) ne vient **pas** de ce fichier README ni du code seul : cela dépend du **domaine** (DNS, nameservers) et de **l’hébergeur auquel ce nom pointe**. Tant que le domaine n’est pas relié au **déploiement réel du front** (build `dist/` sur l’outil d’hébergement que tu utilises), le navigateur affichera ce que ce DNS indique — souvent une **page par défaut** chez le registrar ou l’hébergeur où la zone DNS est gérée. Mettre à jour le dépôt ou le badge « en développement » **ne remplace pas** cette étape réseau / infra.

En résumé : **développement actif** = état du produit dans le code ; **URL publique** = configuration DNS + hébergement du site.

---

## À quoi sert Graply ?

Graply aide les **marques** à lancer et piloter des **campagnes** avec des **créateurs** (Instagram, TikTok, YouTube), et aide les **créateurs** à **postuler**, suivre leurs **candidatures** et **synchroniser** leurs comptes pour afficher stats et vidéos sur un **dashboard**.

| Côté | Fonctions typiques |
|------|---------------------|
| **Entreprise** | Création de campagnes, budget, validation de contenus, paiements, suivi |
| **Créateur** | Profil, candidatures, messagerie liée aux campagnes, connexion des réseaux (OAuth), vidéos et indicateurs |
| **Technique** | Auth, base de données avec politiques d’accès, API (webhooks, paiements), services optionnels de suivi |

### Schéma simplifié du flux

```mermaid
flowchart LR
  subgraph Marques
    M[Entreprise]
  end
  subgraph Plateforme
    G[Graply]
    DB[(Données)]
    API[API]
  end
  subgraph Créateurs
    C[Créateur]
  end
  M -->|Campagnes et budget| G
  C -->|Candidatures et profil| G
  G --> DB
  G --> API
  API --> P[Paiements]
  API --> W[Intégrations réseaux]
```

---

## Stack technique

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase&logoColor=black" alt="Supabase" />
  <img src="https://img.shields.io/badge/Stripe-Paiements-635bff?logo=stripe&logoColor=white" alt="Stripe" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white" alt="Node" />
</p>

---

## Sommaire

- [Statut du projet et graply.io](#statut-du-projet-et-graplyio)
- [Installation](#installation)
- [Variables d’environnement](#variables-denvironnement)
- [Développement local](#développement-local)
- [Build et déploiement](#build-et-déploiement)
- [Base de données](#base-de-données)

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

Les fichiers d’environnement **ne sont pas versionnés**. Chaque environnement (local, CI, hébergeur) doit être configuré avec les identifiants et URL fournis par les services que vous connectez (hébergement, base de données, paiements, réseaux sociaux, etc.), **sans jamais** coller de secrets dans le dépôt ni dans une issue publique.

---

## Développement local

| Commande | Rôle |
|----------|------|
| `npm run dev` | Front Vite (port par défaut du tooling) |
| `npm run backend:dev` | API Express (proxy `/api` depuis Vite selon config) |
| `npm run lint` / `npm run typecheck` | Qualité du code |

---

## Build et déploiement

```bash
npm run build
```

Le front est émis dans **`dist/`**. La configuration d’hébergement (fichiers du dépôt et variables de build) doit pointer vers une API accessible en HTTPS si vous utilisez le proxy d’API côté front.

---

## Base de données

Les migrations SQL se trouvent dans **`supabase/migrations/`**. Appliquez-les avec l’outil de votre choix (CLI du fournisseur ou interface du service).
