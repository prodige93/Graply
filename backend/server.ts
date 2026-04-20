import express from "express";
import cors from "cors";
import "dotenv/config";

import checkoutRouter from "./routes/checkout";
import enterpriseCheckoutRouter from "./routes/enterpriseCheckout";
import webhookRouter from "./routes/webhook";
import {
  getMetaInstagramWebhook,
  postMetaInstagramWebhook,
} from "./routes/metaInstagramWebhook";
import { postMetaDeauth } from "./routes/metaDataDeauth";
import { postMetaDataDelete } from "./routes/metaDataDelete";

const app = express();

/** Plusieurs origines (prod graply.io + dev). Ex. CORS_ORIGINS=https://graply.io,https://www.graply.io,http://localhost:5173 */
const corsOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const corsOriginOption =
  corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins;

app.use(cors({ origin: corsOriginOption, credentials: true }));

app.use(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  webhookRouter,
);

/** Instagram / Meta — Webhooks (corps brut pour X-Hub-Signature-256). @see metaInstagramWebhook.ts */
app.get("/api/webhooks/meta", getMetaInstagramWebhook);
app.post(
  "/api/webhooks/meta",
  express.raw({ type: "application/json" }),
  postMetaInstagramWebhook,
);

/**
 * Meta — Deauthorize & Data Deletion callbacks (App Review).
 * Meta poste `signed_request` en `application/x-www-form-urlencoded`.
 */
app.post(
  "/api/webhooks/meta/deauth",
  express.urlencoded({ extended: false }),
  postMetaDeauth,
);
app.post(
  "/api/webhooks/meta/delete",
  express.urlencoded({ extended: false }),
  postMetaDataDelete,
);

app.use(express.json());

app.get("/api", (_req, res) => {
  res.send("API running");
});

app.use("/api", checkoutRouter);
app.use("/api", enterpriseCheckoutRouter);

const PORT = Number(process.env.PORT) || 3300;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend Graply démarré sur le port ${PORT}`);
});
