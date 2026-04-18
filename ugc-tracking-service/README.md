# Service UGC — scraping des vues & calcul de rémunération

Worker **BullMQ** + **Prisma** + **Redis** : file `video-scraping`, calcul `$/1K` vues avec seuil minimum, plafond par création et budget campagne (voir `src/services/payout.service.ts`).

## Démarrage rapide

```bash
cd ugc-tracking-service
cp .env.example .env
```

**Base Supabase** — Dans le dashboard : **Settings → Database** : mot de passe PostgreSQL dans `DATABASE_URL`. Si le mot de passe contient `@`, `&`, `:`, `/`, etc., il **doit** être encodé (ex. Node : `encodeURIComponent('…')`).

**Important (projet Graply + Supabase existant)** — La base contient déjà des tables avec des FK vers `auth.users`. `npx prisma db push` et `prisma db pull` peuvent échouer avec **P4002** / **P1013**. Pour créer uniquement les tables du worker UGC, utiliser une fois :

```bash
npm run prisma:execute-ugc-sql
```

(équivalent : `prisma db execute --file prisma/ugc_tables_init.sql`.) Les tables sont préfixées `ugc_*` pour ne pas entrer en conflit avec `public.campaigns`. Pour des évolutions de schéma ensuite : `prisma migrate diff` + `db execute`, plutôt que `db push` sur cette instance.

```bash
npm install
npx prisma generate
npx prisma db push   # ou: npm run prisma:migrate

npm run worker       # lance le worker (tsx)
# ou en dev avec reload : npm run dev:worker
```

## Fichiers principaux

| Chemin | Rôle |
|--------|------|
| `src/queue/scraping.queue.ts` | Queue BullMQ + connexion Redis exportée |
| `src/workers/scraping.worker.ts` | Job : scrape → payout → transaction budget → replanification |
| `src/services/payout.service.ts` | Règles métier Graply |
| `src/services/scraper.service.ts` | YouTube via API officielle ; TikTok / Instagram à brancher |
| `src/services/tracking.service.ts` | `startVideoTracking()` : création ligne + 1er job |
| `src/utils/scraping.utils.ts` | Fréquence adaptative (2h / 8h / 24h) |

## Brief Discord (copier-coller)

Le texte structuré pour l’équipe est dans [`docs/BRIEF_UGC_TRACKING_DISCORD.md`](docs/BRIEF_UGC_TRACKING_DISCORD.md).

## Notes prod

- Utiliser **transactions** pour budget + vidéo (déjà fait dans le worker).
- Surveiller la queue : **Bull Board** (`@bull-board/api` + `@bull-board/express`).
- TikTok / Instagram : implémentation **RapidAPI** dans `scraper.service.ts` (`TIKTOK_RAPIDAPI_*`, `INSTAGRAM_RAPIDAPI_*`). Choisir une API sur RapidAPI et aligner `*_PATH` / `*_QUERY_PARAM` sur sa doc si besoin.
