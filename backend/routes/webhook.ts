import { Router, Request, Response } from "express";
import stripe from "../config/stripe";

const router = Router();

// POST /api/webhook
// Stripe envoie les événements ici après chaque paiement
// IMPORTANT : cette route doit recevoir le body brut (raw), pas du JSON parsé
/**
 * POST /webhook — endpoint appelé par Stripe pour notifier des événements (paiements, transferts, etc.).
 *
 * Prérequis :
 * - Body brut (raw) : express.raw() sur cette route dans server.ts — ne pas parser en JSON avant la vérif de signature.
 * - En-tête Stripe-Signature + STRIPE_WEBHOOK_SECRET dans .env (secret du Dashboard Stripe, ex. whsec_...).
 *
 * Flux :
 * 1. Vérifie la signature avec stripe.webhooks.constructEvent → 400 si invalide ou corps altéré
 * 2. Traite event.type dans un switch (ex. checkout.session.completed, transfer.created)
 * 3. default : log des événements non gérés (filet de sécurité)
 * 4. Répond { received: true } en 200 si la requête à été authentifiée par Stripe (retente sinon)
 */
router.post(
  "/webhook",
  // express.raw() est appliqué dans server.ts uniquement pour cette route
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;

    let event;

    /**
     * authentifies le webhook Stripe et je décodes le corps en un event sûr, ou je refuses la requête.
     */
    try {
      /**
       * stripe.webhooks.constructEvent(...) sert à vérifier que la requête vient vraiment de Stripe
       * et à transformer le corps brut en un objet event utilisable dans le code.
       */
      event = stripe.webhooks.constructEvent(
        /**
         * req.body — le corps de la requête tel quel (souvent un Buffer / chaîne brute),
         * sans passer par express.json(). C’est obligatoire : Stripe signe exactement ces octets ;
         * si j'ai déjà parsé en JSON, la signature ne matche plus.
         */
        req.body,
        /**
         * sig — la valeur de l’en-tête Stripe-Signature que Stripe envoie.
         * Elle contient l’info pour contrôler la signature.
         */
        sig,
        /**
         * process.env.STRIPE_WEBHOOK_SECRET — le secret du webhook que je copie depuis le Dashboard Stripe
         * (celui qui commence souvent par whsec_...). Seul mon serveur et Stripe le connaissent ;
         * ça permet de valider la signature.
         */
        process.env.STRIPE_WEBHOOK_SECRET as string,
      );
    } catch (err: any) {
      /**
       * Si la signature est fausse ou le body modifié → une erreur est levée,
       * et mon catch répond 400 (requête rejetée).
       */
      console.error("Webhook signature invalide:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Traitement des événements Stripe
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        // mets à jour la base de données
        // ex: créditer le budget de la campagne, enregistrer le paiement
        console.log("Paiement confirmé pour la session:", session.id);
        break;
      }

      case "transfer.created": {
        // Stripe a bien transféré l'argent au créateur
        const transfer = event.data.object;
        console.log("Transfert créateur effectué:", transfer.id);
        break;
      }

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    // Toujours répondre 200 pour confirmer la réception à Stripe
    res.json({ received: true });
  },
);

export default router;
