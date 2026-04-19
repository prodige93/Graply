import Stripe from "stripe";

const secret = process.env.STRIPE_SECRET_KEY?.trim();

const stripe = secret
  ? new Stripe(secret, {
      apiVersion: "2026-02-25.clover",
    })
  : null;

if (!stripe) {
  console.warn(
    "[backend] STRIPE_SECRET_KEY manquant — checkout et webhooks Stripe sont désactivés.",
  );
}

export default stripe;