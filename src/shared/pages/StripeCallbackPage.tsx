import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/shared/infrastructure/supabase';

export default function StripeCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      setStatus('error');
      setErrorMsg(errorDescription || 'Connexion Stripe annulée.');
      return;
    }

    if (!code) {
      setStatus('error');
      setErrorMsg('Aucun code d\'autorisation reçu de Stripe.');
      return;
    }

    async function exchangeCode(authCode: string) {
      const { data, error: rpcError } = await supabase.rpc('exchange_stripe_code', {
        auth_code: authCode,
      });

      if (rpcError) {
        setStatus('error');
        setErrorMsg(rpcError.message || 'Erreur lors de la connexion du compte Stripe.');
        return;
      }

      setStatus('success');

      const { data: userData } = await supabase.auth.getUser();
      const role = userData?.user?.user_metadata?.role;
      const settingsPath = role === 'enterprise' ? '/app-entreprise/parametres' : '/parametres';

      setTimeout(() => {
        navigate(settingsPath, { state: { stripeConnected: true, stripeAccountId: data?.stripe_account_id } });
      }, 2000);
    }

    exchangeCode(code);
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#050404' }}>
      <div className="text-center max-w-sm mx-4">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-2 border-white/20 border-t-white/70 rounded-full animate-spin mx-auto mb-6" />
            <h1 className="text-xl font-bold text-white mb-2">Connexion en cours...</h1>
            <p className="text-sm text-white/40">Liaison de ton compte Stripe</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 13L9 17L19 7" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Compte Stripe connecté</h1>
            <p className="text-sm text-white/40">Redirection vers les paramètres...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Erreur de connexion</h1>
            <p className="text-sm text-white/40 mb-6">{errorMsg}</p>
            <button
              onClick={() => navigate('/parametres')}
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-black transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: '#fff' }}
            >
              Retour aux paramètres
            </button>
          </>
        )}
      </div>
    </div>
  );
}
