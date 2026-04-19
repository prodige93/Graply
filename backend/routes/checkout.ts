import { Router, Request, Response } from "express";
import stripe from "../config/stripe";

const router = Router();

// POST /api/checkout
// Body: { amountInCents: number, creatorStripeAccountId: string, isSubscriptionPremium: boolean }
// Post crée une session Stripe Checkout pour un paiement unique en euros, avec frais plateforme (commission) et versement vers le compte Connect du créateur (creatorStripeAccountId). Elle renvoie au front l’URL de la page de paiement Stripe.
/**
 * POST /checkout — crée une session Stripe Checkout (paiement unique, EUR).
 *
 * Body attendu :
 * - amountInCents : montant total payé par le client (centimes)
 * - creatorStripeAccountId : compte Stripe Connect du créateur (destination du transfert)
 * - isSubscriptionPremium : si true, commission plateforme 5 %, sinon 8 %
 *
 * Flux :
 * 1. Valide les champs obligatoires → 400 si manquants
 * 2. Calcule la commission uniquement côté serveur (ne jamais faire confiance au front)
 * 3. Crée une session Checkout avec transfer_data vers le créateur + application_fee (plateforme)
 * 4. Renvoie { url } pour rediriger l’utilisateur vers la page de paiement Stripe
 * 5. En erreur Stripe/réseau → 500 + log
 */
router.post("/checkout", async (req: Request, res: Response) => {
    try {
        if (!stripe) {
            return res.status(503).json({ error: "Paiement indisponible (Stripe non configuré)." });
        }

        const { amountInCents, creatorStripeAccountId, isSubscriptionPremium } = req.body;

        if (!amountInCents || !creatorStripeAccountId) {
            return res.status(400).json({ error: "Paramètres manquants." });
        }

        // Calcul de la comission côté backend - jamais front-end
        const commissionRate = isSubscriptionPremium ? 0.05 : 0.08;
        const applicationFee = Math.round(amountInCents * commissionRate);

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        unit_amount: amountInCents,
                        product_data: {
                            name: "Campagne Graply",
                        },
                    },
                    quantity: 1,
                },
            ],
            payment_intent_data: {
                application_fee_amount: applicationFee,
                transfer_data: {
                    destination: creatorStripeAccountId,
                },
            },
            success_url: `${process.env.FRONTEND_URL}/success`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        });

        res.json({ url: session.url });
    } catch (err: any) {
        console.error("Erreur Stripe checkout:", err.message);
        res.status(500).json({ error: "Erreur lors de la création de la session." });
    }
});

export default router;
