/** Règles « Page Entreprise » (PDF) — création de campagne */

export const MIN_CAMPAIGN_BUDGET_EUR = 300;
export const MIN_PER_1000_VIEWS_EUR = 1;
export const MIN_SINGLE_PAYMENT_EUR = 1;

export function parseMoneyEuros(s: string): number {
  return parseFloat(String(s).replace(/[^0-9.]/g, '')) || 0;
}

export type PlatformBudgetRow = { amount: string; per1000: string; min: string; max: string };

export function validateRewardRow(
  pb: PlatformBudgetRow | undefined,
  opts: { platformBudgetEur: number; campaignTotalEur: number; isSinglePlatform: boolean },
): { ok: boolean; reason?: string } {
  if (!pb) return { ok: false, reason: 'Récompense incomplète.' };
  const per1000 = parseMoneyEuros(pb.per1000);
  const minPay = parseMoneyEuros(pb.min);
  const maxPay = parseMoneyEuros(pb.max);
  if (per1000 < MIN_PER_1000_VIEWS_EUR) {
    return { ok: false, reason: `Le tarif pour 1 000 vues doit être d’au moins ${MIN_PER_1000_VIEWS_EUR} €.` };
  }
  if (minPay < MIN_SINGLE_PAYMENT_EUR) {
    return { ok: false, reason: `Le paiement minimum doit être d’au moins ${MIN_SINGLE_PAYMENT_EUR} €.` };
  }
  const cap = opts.isSinglePlatform ? opts.campaignTotalEur : opts.platformBudgetEur;
  if (maxPay > cap) {
    return { ok: false, reason: 'Le paiement maximum ne peut pas dépasser le budget alloué à cette plateforme (ni le budget total si une seule plateforme).' };
  }
  return { ok: true };
}
