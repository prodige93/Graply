import crypto from "node:crypto";
import type { Request, Response } from "express";
import { parseMetaSignedRequest } from "../lib/metaSignedRequest";
import { supabaseAdmin } from "../config/supabaseAdmin";

/**
 * POST `/api/webhooks/meta/delete`
 *
 * Callback Meta « Data Deletion Request ». Déclenché quand un utilisateur
 * demande la suppression de ses données depuis Instagram / Facebook.
 * Réponse attendue par Meta (JSON) :
 *   { "url": "https://...", "confirmation_code": "<code>" }
 * où `url` permet à l’utilisateur de vérifier le statut de sa demande.
 *
 * Doc : https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
 */

function generateConfirmationCode(): string {
  return crypto.randomBytes(16).toString("hex");
}

function buildStatusUrl(code: string): string {
  const publicUrl =
    process.env.PUBLIC_FRONTEND_URL?.trim() ||
    process.env.FRONTEND_URL?.split(",")[0]?.trim() ||
    "https://graply.io";
  const base = publicUrl.replace(/\/+$/, "");
  return `${base}/data-deletion-status?code=${encodeURIComponent(code)}`;
}

export async function postMetaDataDelete(
  req: Request,
  res: Response,
): Promise<void> {
  const appSecret =
    process.env.META_APP_SECRET?.trim() ||
    process.env.FACEBOOK_APP_SECRET?.trim();
  if (!appSecret) {
    console.error("[meta delete] META_APP_SECRET manquant");
    res.sendStatus(503);
    return;
  }

  const body = req.body as Record<string, unknown> | undefined;
  const signed =
    typeof body?.signed_request === "string"
      ? (body.signed_request as string)
      : undefined;

  const payload = parseMetaSignedRequest(signed, appSecret);
  if (!payload) {
    console.warn("[meta delete] signed_request invalide ou absent");
    res.sendStatus(400);
    return;
  }

  const platformUserId =
    typeof payload.user_id === "string" ? payload.user_id : "";
  const confirmationCode = generateConfirmationCode();

  if (platformUserId && supabaseAdmin) {
    const { data: conn, error: findErr } = await supabaseAdmin
      .from("social_connections")
      .select("user_id")
      .eq("platform", "instagram")
      .eq("platform_user_id", platformUserId)
      .maybeSingle();
    if (findErr) {
      console.warn(
        "[meta delete] lookup social_connections échoué:",
        findErr.message,
      );
    }
    const grapleyUserId = conn?.user_id ?? null;

    const { error: delConnErr } = await supabaseAdmin
      .from("social_connections")
      .delete()
      .eq("platform", "instagram")
      .eq("platform_user_id", platformUserId);
    if (delConnErr) {
      console.warn(
        "[meta delete] suppression social_connections échouée:",
        delConnErr.message,
      );
    }

    if (grapleyUserId) {
      const { error: delVideosErr } = await supabaseAdmin
        .from("instagram_videos")
        .delete()
        .eq("user_id", grapleyUserId);
      if (delVideosErr) {
        console.warn(
          "[meta delete] suppression instagram_videos échouée:",
          delVideosErr.message,
        );
      }

      const { error: profileErr } = await supabaseAdmin
        .from("profiles")
        .update({
          instagram_handle: "",
          updated_at: new Date().toISOString(),
        })
        .eq("id", grapleyUserId);
      if (profileErr) {
        console.warn(
          "[meta delete] reset instagram_handle échoué:",
          profileErr.message,
        );
      }
    }
  }

  res.status(200).json({
    url: buildStatusUrl(confirmationCode),
    confirmation_code: confirmationCode,
  });
}
