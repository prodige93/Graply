import { supabase } from '@/shared/infrastructure/supabase';

function backendBase(): string {
  const b = import.meta.env.VITE_BACKEND_URL?.trim();
  if (b) return b.replace(/\/$/, '');
  // Build prod sans VITE_BACKEND_URL : même origine que le site (ex. reverse-proxy /api → Express)
  if (typeof window !== 'undefined' && import.meta.env.PROD) {
    return window.location.origin;
  }
  return 'http://localhost:3300';
}

/**
 * Redirige vers Stripe Checkout pour une campagne en `pending_checkout`.
 * Lance une erreur si la session ne peut pas être créée.
 */
export async function startEnterpriseCampaignCheckout(campaignId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) {
    throw new Error('Session expirée. Reconnectez-vous.');
  }

  const res = await fetch(`${backendBase()}/api/enterprise-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ campaignId }),
  });

  const j = (await res.json()) as { url?: string; error?: string };
  if (!res.ok) {
    throw new Error(j.error || 'Impossible de démarrer le paiement.');
  }
  if (!j.url) {
    throw new Error('Réponse serveur invalide.');
  }
  window.location.href = j.url;
}

export async function fetchEnterpriseCheckoutSessionStatus(sessionId: string): Promise<{
  payment_status: string | null;
  status: string | null;
  campaign_id: string | null;
  amount_total: number | null;
}> {
  const res = await fetch(
    `${backendBase()}/api/enterprise-checkout/session?session_id=${encodeURIComponent(sessionId)}`,
  );
  const j = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error((j.error as string) || 'Erreur session');
  }
  return {
    payment_status: (j.payment_status as string) ?? null,
    status: (j.status as string) ?? null,
    campaign_id: (j.campaign_id as string) ?? null,
    amount_total: typeof j.amount_total === 'number' ? j.amount_total : null,
  };
}
