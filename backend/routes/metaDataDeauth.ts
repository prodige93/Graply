import type { Request, Response } from "express";
import { parseMetaSignedRequest } from "../lib/metaSignedRequest";
import { supabaseAdmin } from "../config/supabaseAdmin";

/**
 * POST `/api/webhooks/meta/deauth`
 *
 * Déclenché par Meta quand un utilisateur retire l’application Graply depuis
 * ses paramètres Instagram / Facebook. Obligatoire pour l’App Review (produit
 * « Paramètres de connexion professionnelle Instagram »).
 *
 * Meta envoie `signed_request` (form-urlencoded). On répond 200 OK sans corps
 * particulier ; on en profite pour supprimer la ligne `social_connections`
 * correspondante quand on peut retrouver l’utilisateur par `platform_user_id`.
 *
 * Doc : https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
 * et https://developers.facebook.com/docs/facebook-login/guides/advanced/existing-system/#parsingsr
 */
export async function postMetaDeauth(req: Request, res: Response): Promise<void> {
  const appSecret =
    process.env.META_APP_SECRET?.trim() ||
    process.env.FACEBOOK_APP_SECRET?.trim();
  if (!appSecret) {
    console.error("[meta deauth] META_APP_SECRET manquant");
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
    console.warn("[meta deauth] signed_request invalide ou absent");
    res.sendStatus(400);
    return;
  }

  const platformUserId =
    typeof payload.user_id === "string" ? payload.user_id : "";
  if (platformUserId && supabaseAdmin) {
    const { error } = await supabaseAdmin
      .from("social_connections")
      .delete()
      .eq("platform", "instagram")
      .eq("platform_user_id", platformUserId);
    if (error) {
      console.warn(
        "[meta deauth] suppression social_connections échouée:",
        error.message,
      );
    }
  }

  res.status(200).json({ ok: true });
}
