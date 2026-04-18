import { useState, useEffect, useCallback } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { supabase } from '@/shared/infrastructure/supabase';

const glassInner = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
};

export default function MfaEnrollmentPanel() {
  const [loading, setLoading] = useState(true);
  const [factors, setFactors] = useState<{ id: string; status: string; friendly_name?: string }[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const refreshFactors = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.auth.mfa.listFactors();
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setFactors((data?.all || []).map((f) => ({ id: f.id, status: f.status, friendly_name: f.friendly_name })));
  }, []);

  useEffect(() => {
    void refreshFactors();
  }, [refreshFactors]);

  const verifiedTotp = factors.find((f) => f.status === 'verified');

  async function startEnroll() {
    setEnrolling(true);
    setError(null);
    setQr(null);
    setSecret(null);
    setFactorId(null);
    const { data, error: err } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Application d’authentification',
    });
    setEnrolling(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (data?.type === 'totp' && data.totp) {
      setFactorId(data.id);
      const raw = data.totp.qr_code;
      const src = raw.startsWith('data:') ? raw : `data:image/svg+xml;utf-8,${raw}`;
      setQr(src);
      setSecret(data.totp.secret ?? null);
    }
  }

  async function verifyEnroll() {
    if (!factorId || verifyCode.length < 6) return;
    setError(null);
    const challenge = await supabase.auth.mfa.challenge({ factorId });
    if (challenge.error || !challenge.data) {
      setError(challenge.error?.message || 'Challenge impossible');
      return;
    }
    const verify = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code: verifyCode.replace(/\s/g, ''),
    });
    if (verify.error) {
      setError(verify.error.message);
      return;
    }
    setFactorId(null);
    setQr(null);
    setSecret(null);
    setVerifyCode('');
    await refreshFactors();
  }

  async function unenroll(id: string) {
    setError(null);
    const { error: err } = await supabase.auth.mfa.unenroll({ factorId: id });
    if (err) {
      setError(err.message);
      return;
    }
    await refreshFactors();
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3 text-sm text-white/40">
        <Loader2 className="w-4 h-4 animate-spin" />
        Chargement de la sécurité du compte…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <Shield className="w-4 h-4 text-white/60" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Authentification à deux facteurs (A2F)</p>
          <p className="text-xs text-white/35 mt-1">
            Scanne le QR avec une appli TOTP, puis saisis le code à 6 chiffres pour activer l’A2F sur ce compte.
          </p>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-400/90 px-1">{error}</p>
      )}

      {verifiedTotp ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3" style={glassInner}>
          <span className="text-sm text-emerald-400/90">A2F activée ({verifiedTotp.friendly_name || 'TOTP'})</span>
          <button
            type="button"
            onClick={() => void unenroll(verifiedTotp.id)}
            className="text-xs font-semibold text-red-400/90 hover:text-red-300 transition-colors self-start sm:self-auto"
          >
            Désactiver
          </button>
        </div>
      ) : (
        <>
          {!factorId && (
            <button
              type="button"
              onClick={() => void startEnroll()}
              disabled={enrolling}
              className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 disabled:opacity-50"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
            >
              {enrolling ? 'Préparation…' : 'Configurer l’A2F (application TOTP)'}
            </button>
          )}

          {factorId && qr && (
            <div className="p-3 space-y-3" style={glassInner}>
              <p className="text-xs text-white/50">Scanne ce QR avec ton appli (Google Authenticator, 1Password, etc.)</p>
              <img src={qr} alt="QR code A2F" className="w-36 h-36 mx-auto bg-white rounded-lg p-1" />
              {secret && (
                <p className="text-[10px] text-white/30 break-all text-center font-mono">{secret}</p>
              )}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-white/40">Code à 6 chiffres</label>
                <input
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-sm text-white bg-transparent outline-none border-b border-white/20 focus:border-white/50 pb-1 max-w-[12rem]"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                />
                <button
                  type="button"
                  onClick={() => void verifyEnroll()}
                  disabled={verifyCode.length < 6}
                  className="mt-1 px-4 py-2 rounded-full text-xs font-bold disabled:opacity-40"
                  style={{ background: '#fff', color: '#000' }}
                >
                  Vérifier et activer
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
