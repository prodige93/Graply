import { Request, Response } from "express";
import { verifyMetaXHubSignature256 } from "../lib/metaWebhookSignature";

/**
 * Instagram Platform — Webhooks Meta (produit Webhooks du Meta App Dashboard).
 *
 * - GET : vérification du Callback URL (`hub.mode`, `hub.challenge`, `hub.verify_token`).
 * - POST : notifications JSON ; corps brut requis pour valider `X-Hub-Signature-256` avec `META_APP_SECRET`.
 *
 * À enregistrer dans le Dashboard : Callback URL = `https://<backend>/api/webhooks/meta`,
 * Verify Token = `INSTAGRAM_WEBHOOK_VERIFY_TOKEN`.
 * Après connexion OAuth, activer les abonnements côté API : POST `/{ig-user-id}/subscribed_apps` sur graph.instagram.com
 * (voir doc « Enable Subscriptions »).
 *
 * @see https://developers.facebook.com/docs/instagram-platform/webhooks
 */

function queryString(
  req: Request,
  dotted: string,
  underscored: string,
): string | undefined {
  const q = req.query as Record<string, unknown>;
  for (const key of [dotted, underscored]) {
    const v = q[key];
    if (typeof v === "string" && v.length > 0) return v;
    if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  }
  return undefined;
}

/** Étape 1 — Verification Request (configuration du produit Webhooks dans le Dashboard). */
export function getMetaInstagramWebhook(req: Request, res: Response): void {
  const mode = queryString(req, "hub.mode", "hub_mode");
  const token = queryString(req, "hub.verify_token", "hub_verify_token");
  const challenge = queryString(req, "hub.challenge", "hub_challenge");
  const verifyToken =
    process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN?.trim() ||
    process.env.META_WEBHOOK_VERIFY_TOKEN?.trim();

  if (!verifyToken) {
    console.error(
      "[meta webhook] INSTAGRAM_WEBHOOK_VERIFY_TOKEN (ou META_WEBHOOK_VERIFY_TOKEN) manquant",
    );
    res.sendStatus(503);
    return;
  }

  if (mode === "subscribe" && token === verifyToken && challenge != null) {
    res.status(200).type("text/plain").send(challenge);
    return;
  }

  console.warn("[meta webhook] Vérification refusée", {
    mode,
    tokenMatch: token === verifyToken,
    hasChallenge: challenge != null,
  });
  res.sendStatus(403);
}

/** Étape 1 — Event Notifications (POST JSON). Répondre 200 OK rapidement. */
export function postMetaInstagramWebhook(req: Request, res: Response): void {
  const raw = req.body as Buffer | undefined;
  if (!Buffer.isBuffer(raw)) {
    res.sendStatus(400);
    return;
  }

  const sig = req.headers["x-hub-signature-256"];
  const sigStr = Array.isArray(sig) ? sig[0] : sig;
  const appSecret =
    process.env.META_APP_SECRET?.trim() ||
    process.env.FACEBOOK_APP_SECRET?.trim();

  const prod = process.env.NODE_ENV === "production";
  if (prod && !appSecret) {
    console.error("[meta webhook] META_APP_SECRET requis en production");
    res.sendStatus(503);
    return;
  }

  if (appSecret) {
    if (!verifyMetaXHubSignature256(raw, sigStr, appSecret)) {
      console.warn("[meta webhook] Signature X-Hub-Signature-256 invalide ou absente");
      res.sendStatus(403);
      return;
    }
  } else {
    console.warn(
      "[meta webhook] META_APP_SECRET absent — accepter uniquement en dev (signature non vérifiée)",
    );
  }

  try {
    const payload = JSON.parse(raw.toString("utf8")) as unknown;
    // Point d’extension : file d’attente, sync ciblée, etc.
    if (payload && typeof payload === "object") {
      const preview = JSON.stringify(payload).slice(0, 800);
      console.log("[meta webhook] événement reçu:", preview);
    }
  } catch (e) {
    console.warn("[meta webhook] JSON invalide:", e);
    res.sendStatus(400);
    return;
  }

  res.sendStatus(200);
}
