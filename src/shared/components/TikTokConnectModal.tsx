import { useEffect, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import tiktokIcon from '@/shared/assets/tiktok.svg';

const TIKTOK_TERMS_URL = 'https://www.tiktok.com/legal/terms-of-service';
const TIKTOK_PRIVACY_URL = 'https://www.tiktok.com/legal/privacy-policy';

type Props = {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
};

export default function TikTokConnectModal({ open, onClose, onContinue }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (open) setAccepted(false);
  }, [open]);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tiktok-connect-title"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: '#121212',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 p-6 pb-4">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: '#000000' }}
            >
              <img src={tiktokIcon} alt="" className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h2 id="tiktok-connect-title" className="text-lg font-bold text-white leading-tight">
                Connecter TikTok
              </h2>
              <p className="text-sm text-white/45 mt-1">Redirection vers TikTok</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-5">
          <p className="text-sm text-white/80 leading-relaxed">
            Tu vas être redirigé vers TikTok pour connecter ton compte. En continuant, tu acceptes que tes données soient
            partagées conformément aux conditions de TikTok.
          </p>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="peer sr-only"
            />
            <span
              className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border border-black/25 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-white/35"
              aria-hidden
            >
              <Check
                strokeWidth={3}
                className={`h-3 w-3 text-black transition-opacity ${accepted ? 'opacity-100' : 'opacity-0'}`}
              />
            </span>
            <span className="text-sm text-white/85 leading-snug">
              J&apos;accepte les{' '}
              <a
                href={TIKTOK_TERMS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 text-white/90 hover:text-white"
                onClick={(e) => e.stopPropagation()}
              >
                Conditions d&apos;utilisation
              </a>{' '}
              et la{' '}
              <a
                href={TIKTOK_PRIVACY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 text-white/90 hover:text-white"
                onClick={(e) => e.stopPropagation()}
              >
                Politique de confidentialité
              </a>{' '}
              de TikTok.
            </span>
          </label>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold text-white transition-colors hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={!accepted}
              onClick={onContinue}
              className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
              style={{
                background: accepted ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              Continuer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
