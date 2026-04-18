/**
 * Règles métier Graply (aligné brief produit) :
 * - G_brut = V × R / 1000
 * - Si G_brut < P_min → pas de paiement (pending)
 * - Sinon G = min(G_brut, P_max)
 * - Si B < G → pas de paiement du tout (budget_exhausted), pas de paiement partiel
 * - Sinon G_final = G ; statut capped si G = P_max (plafond atteint)
 */

export interface CampaignParams {
  ratePerKViews: number;
  minPayment: number;
  maxPayment: number;
  remainingBudget: number;
}

export type PayoutStatus = "pending" | "eligible" | "capped" | "budget_exhausted";

export interface PayoutResult {
  earning: number;
  status: PayoutStatus;
}

/** Seuil de vues équivalent à P_min : V_min = (P_min / R) × 1000 (info, pas utilisé dans le calcul direct). */
export function viewsForMinPayment(R: number, Pmin: number): number {
  if (R <= 0) return Infinity;
  return (Pmin / R) * 1000;
}

export function calculatePayout(views: number, c: CampaignParams): PayoutResult {
  const gross = (views * c.ratePerKViews) / 1000;

  if (gross < c.minPayment) {
    return { earning: 0, status: "pending" };
  }

  const capped = Math.min(gross, c.maxPayment);

  if (c.remainingBudget < capped) {
    return { earning: 0, status: "budget_exhausted" };
  }

  if (capped >= c.maxPayment) {
    return { earning: capped, status: "capped" };
  }

  return { earning: capped, status: "eligible" };
}
