import { Router, Request, Response } from "express";
import stripe from "../config/stripe";
import { supabaseAdmin } from "../config/supabaseAdmin";
import { budgetToCents } from "../lib/money";

const router = Router();

const FRONTEND = process.env.FRONTEND_URL || "http://localhost:5173";

/**
 * POST /api/enterprise-checkout
 * Authorization: Bearer <access_token Supabase>
 * Body: { campaignId: string }
 *
 * Crée une session Stripe Checkout (paiement plateforme, sans Connect) pour le budget
 * de la campagne en statut pending_checkout. Vérifie que le JWT correspond au propriétaire.
 */
router.post("/enterprise-checkout", async (req: Request, res: Response) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: "Service indisponible (configuration serveur)." });
    }

    const auth = req.headers.authorization;
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: "Non authentifié." });
    }

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData.user) {
      return res.status(401).json({ error: "Session invalide." });
    }
    const userId = userData.user.id;

    const campaignId = req.body?.campaignId as string | undefined;
    if (!campaignId) {
      return res.status(400).json({ error: "campaignId requis." });
    }

    const { data: campaign, error: fetchErr } = await supabaseAdmin
      .from("campaigns")
      .select("id, user_id, budget, status, name")
      .eq("id", campaignId)
      .maybeSingle();

    if (fetchErr || !campaign) {
      return res.status(404).json({ error: "Campagne introuvable." });
    }

    if (campaign.user_id !== userId) {
      return res.status(403).json({ error: "Accès refusé." });
    }

    if (campaign.status !== "pending_checkout") {
      return res.status(400).json({
        error: "La campagne n'est pas en attente de paiement.",
      });
    }

    const amountCents = budgetToCents(campaign.budget as string);
    if (amountCents < 50) {
      return res.status(400).json({ error: "Montant de campagne invalide." });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: campaignId,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: amountCents,
            product_data: {
              name: `Campagne Graply — ${(campaign.name as string).slice(0, 80)}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        campaign_id: campaignId,
        user_id: userId,
        amount_cents: String(amountCents),
      },
      payment_intent_data: {
        metadata: {
          campaign_id: campaignId,
        },
      },
      success_url: `${FRONTEND}/app-entreprise/paiement-reussi-campagne?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND}/app-entreprise/mes-campagnes?checkout=cancel`,
    });

    await supabaseAdmin
      .from("campaigns")
      .update({
        stripe_checkout_session_id: session.id,
      })
      .eq("id", campaignId);

    res.json({ url: session.url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("enterprise-checkout:", msg);
    res.status(500).json({ error: "Erreur lors de la création du paiement." });
  }
});

/**
 * GET /api/enterprise-checkout/session?session_id=cs_...
 * Vérifie l'état Stripe (utile si le webhook est lent).
 */
router.get("/enterprise-checkout/session", async (req: Request, res: Response) => {
  try {
    const sessionId = req.query.session_id as string | undefined;
    if (!sessionId) {
      return res.status(400).json({ error: "session_id requis." });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    const campaignId =
      (session.metadata?.campaign_id as string) ||
      (session.client_reference_id as string) ||
      null;

    res.json({
      payment_status: session.payment_status,
      status: session.status,
      campaign_id: campaignId,
      amount_total: session.amount_total,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("enterprise-checkout session:", msg);
    res.status(500).json({ error: "Impossible de lire la session." });
  }
});

export default router;
