/**
 * Après `vite build`, réécrit `dist/_redirects` pour proxifier `/api/*` vers le backend Express
 * (webhooks Meta, Stripe, checkout). Sans cette règle, Netlify sert l’SPA sur `/api/*`.
 *
 * Définir au build (Netlify / CI) :
 *   BACKEND_PUBLIC_URL=https://api.graply.io
 * ou l’URL Render / Fly / autre où tourne Express (sans slash final).
 *
 * Défaut : https://api.graply.io (DNS + déploiement backend à configurer).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "dist");
const redirectsPath = path.join(distDir, "_redirects");

const backend = (process.env.BACKEND_PUBLIC_URL || "https://api.graply.io").replace(
  /\/+$/,
  "",
);

const lines = [
  `# Généré par scripts/patch-netlify-redirects.mjs — BACKEND_PUBLIC_URL=${backend}`,
  `/api/*\t${backend}/api/:splat\t200`,
  `/countries.geo.json\t/countries.geo.json\t200`,
  `/*\t/index.html\t200`,
  "",
];

if (!fs.existsSync(distDir)) {
  console.error("[patch-netlify-redirects] dist/ introuvable — lancez vite build avant.");
  process.exit(1);
}

fs.writeFileSync(redirectsPath, lines.join("\n"), "utf8");
console.log(
  `[patch-netlify-redirects] dist/_redirects écrit — proxy /api/* → ${backend}/api/*`,
);
