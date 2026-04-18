/** Seuil d’exemple du document interne : pas de versement tant que les vues cumulées n’y sont pas atteintes. */
export const MIN_CLIP_VIEWS_FOR_PAYOUT = 5000;

/** Retraits « Retirer mes gains » : au plus une fois par semaine (PDF pré-lancement). */
export const WITHDRAWAL_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export function canWithdrawThisWeek(lastWithdrawalAt: string | null | undefined): boolean {
  if (!lastWithdrawalAt) return true;
  const t = new Date(lastWithdrawalAt).getTime();
  if (Number.isNaN(t)) return true;
  return Date.now() - t >= WITHDRAWAL_COOLDOWN_MS;
}

export function nextWithdrawalAvailableAt(lastWithdrawalAt: string | null | undefined): Date | null {
  if (!lastWithdrawalAt) return null;
  const t = new Date(lastWithdrawalAt).getTime();
  if (Number.isNaN(t)) return null;
  return new Date(t + WITHDRAWAL_COOLDOWN_MS);
}
