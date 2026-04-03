import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/shared/infrastructure/supabase';
import { type SocialPlatform, getRpcName, getRedirectUriForExchange, parseOAuthPlatformFromState } from '@/shared/lib/socialOAuth';

const platformLabels: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
};

export default function SocialCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [connectedName, setConnectedName] = useState('');
  const [platformLabel, setPlatformLabel] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const stateRaw = searchParams.get('state');
    const state = parseOAuthPlatformFromState(stateRaw);
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description') || searchParams.get('error_reason') || '';

    if (error) {
      setStatus('error');
      setErrorMsg(errorDescription || 'Autorisation refusée.');
      return;
    }

    if (!state) {
      setStatus('error');
      setErrorMsg('Plateforme non reconnue.');
      return;
    }

    setPlatformLabel(platformLabels[state] || state);

    if (!code) {
      setStatus('error');
      setErrorMsg("Aucun code d'autorisation reçu.");
      return;
    }

    async function exchangeCode(platform: SocialPlatform, authCode: string) {
      const rpcName = getRpcName(platform);
      const redirectUri = getRedirectUriForExchange();

      const { data, error: rpcError } = await supabase.rpc(rpcName, {
        auth_code: authCode,
        redir_uri: redirectUri,
      });

      if (rpcError) {
        setStatus('error');
        setErrorMsg(rpcError.message || `Erreur de connexion ${platformLabels[platform]}.`);
        return;
      }

      setConnectedName(data?.username || '');
      setStatus('success');

      const { data: userData } = await supabase.auth.getUser();
      const role = userData?.user?.user_metadata?.role;
      const accountPath = role === 'enterprise' ? '/app-entreprise/mon-compte' : '/mon-compte';

      setTimeout(() => {
        navigate(accountPath, { replace: true, state: { fromSocialOAuth: true } });
      }, 600);
    }

    exchangeCode(state, code);
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#050404' }}>
      <div className="text-center max-w-sm mx-4">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-2 border-white/20 border-t-white/70 rounded-full animate-spin mx-auto mb-6" />
            <h1 className="text-xl font-bold text-white mb-2">Connexion {platformLabel}...</h1>
            <p className="text-sm text-white/40">Liaison de ton compte en cours</p>
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
            <h1 className="text-xl font-bold text-white mb-2">{platformLabel} connecté</h1>
            {connectedName && <p className="text-sm text-emerald-400 mb-2">{connectedName}</p>}
            <p className="text-sm text-white/40">Redirection en cours...</p>
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
            <h1 className="text-xl font-bold text-white mb-2">Erreur {platformLabel}</h1>
            <p className="text-sm text-white/40 mb-6">{errorMsg}</p>
            <button
              type="button"
              onClick={async () => {
                const { data: userData } = await supabase.auth.getUser();
                const role = userData?.user?.user_metadata?.role;
                navigate(role === 'enterprise' ? '/app-entreprise/mon-compte' : '/mon-compte');
              }}
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-black transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: '#fff' }}
            >
              Retour à mon compte
            </button>
          </>
        )}
      </div>
    </div>
  );
}
