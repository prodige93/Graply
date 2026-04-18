import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useEnterpriseNavigate } from '@/enterprise/lib/useEnterpriseNavigate';
import { fetchEnterpriseCheckoutSessionStatus } from '@/shared/lib/enterpriseCampaignCheckout';
import { supabase } from '@/shared/infrastructure/supabase';

export default function EnterpriseCampaignPaymentSuccessPage() {
  const navigate = useEnterpriseNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [message, setMessage] = useState('Vérification du paiement…');
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setMessage('Lien invalide.');
      return;
    }

    let cancelled = false;
    const poll = async () => {
      try {
        const stripeState = await fetchEnterpriseCheckoutSessionStatus(sessionId);
        if (cancelled) return;

        const sessionPaid =
          stripeState.status === 'complete' && stripeState.payment_status === 'paid';

        if (sessionPaid) {
          const campaignId = stripeState.campaign_id;
          if (campaignId) {
            for (let i = 0; i < 15; i++) {
              const { data } = await supabase
                .from('campaigns')
                .select('status')
                .eq('id', campaignId)
                .maybeSingle();
              if (data?.status === 'published') {
                setOk(true);
                setMessage('Paiement confirmé. Votre campagne est en ligne.');
                return;
              }
              await new Promise((r) => setTimeout(r, 800));
            }
          }
          setOk(true);
          setMessage(
            'Paiement reçu. La campagne sera visible sur l’accueil dans quelques instants (synchronisation).',
          );
          return;
        }

        setMessage('Paiement non finalisé ou session expirée.');
      } catch {
        if (!cancelled) setMessage('Impossible de confirmer le paiement. Vérifiez « Mes campagnes ».');
      }
    };

    void poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-white" style={{ background: '#050404' }}>
      <div className="max-w-md text-center space-y-4">
        {ok ? (
          <CheckCircle2 className="w-14 h-14 mx-auto text-emerald-400/90" />
        ) : (
          <Loader2 className="w-12 h-12 mx-auto text-white/40 animate-spin" />
        )}
        <h1 className="text-xl font-bold">Merci</h1>
        <p className="text-sm text-white/55 leading-relaxed">{message}</p>
        <button
          type="button"
          onClick={() => navigate('/mes-campagnes')}
          className="mt-4 px-6 py-3 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-95"
          style={{ background: '#A15EFF' }}
        >
          Mes campagnes
        </button>
      </div>
    </div>
  );
}
