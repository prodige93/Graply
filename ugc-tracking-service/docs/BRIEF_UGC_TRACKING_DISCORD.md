# Tracking vidéo UGC — brief technique (Discord)

**Contexte** — Rémunération automatique des créateurs UGC : après soumission d’une vidéo, on enchaîne des jobs de **scraping** des vues (polling décalé, pas du “temps réel”) et on applique les règles **$/1K**, **seuil min**, **plafond max**, **budget campagne**.

---

**Stack** — TypeScript · BullMQ · Redis · Prisma · PostgreSQL

---

**Flux**

1. Créateur soumet une vidéo → `startVideoTracking()` crée `VideoTracking` + enqueue le 1er job `scrape-video`.
2. Worker : scrape vues → `calculatePayout()` → MAJ DB (vues, gain, statut) + **décrément budget** si le gain cumulé augmente.
3. Si vidéo **ACTIVE** → replanifier le prochain scrape avec délai adaptatif (2h / 8h / 24h selon l’âge de la vidéo).
4. Si **CAPPED** (plafond atteint) ou **BUDGET_EXHAUSTED** (pas de budget pour payer, ou campagne épuisée) → **plus de jobs** pour cette vidéo.

---

**Règles de rémunération (résumé)**

- `G_brut = (V × R) / 1000` avec `R` = $/1K vues.
- Si `G_brut < P_min` → pas de paiement (`pending`), on continue à scraper.
- Sinon `G = min(G_brut, P_max)`.
- Si `B < G` (budget restant campagne) → **0 $** pour ce passage (`budget_exhausted`), **pas de paiement partiel** — comportement produit : arrêt / statut adapté côté vidéo.
- Si tout est OK → gain retenu ; si `G = P_max` → **CAPPED**, arrêt scraping pour cette vidéo.

---

**Fréquence de scraping (recommandée)**

- &lt; 2 jours : ~2 h  
- 2–7 jours : ~8 h  
- &gt; 7 jours : ~1 jour  
- Plafond ou budget : **stop**

---

**Points critiques pour les devs**

1. **Transactions Prisma** quand on touche au `remainingBudget` (concurrence entre vidéos).
2. **Monitoring** BullMQ (ex. Bull Board).
3. **Historique** : table `VideoScrapeLog` (une ligne par scrape réussi côté worker).
4. **Retry** BullMQ sur échec réseau / rate limit (déjà en `defaultJobOptions`).
5. **TikTok / Instagram** : stubs à remplacer par une intégration conforme (API / partenaire).

---

**Variables d’environnement** — voir `ugc-tracking-service/.env.example` (`DATABASE_URL`, `REDIS_*`, `YOUTUBE_API_KEY`, etc.).

---

**Commandes**

```text
npm install && npx prisma generate && npx prisma db push
npm run worker
```
