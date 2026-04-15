import { useEffect, useRef } from 'react';
import { X, Loader2, ShieldAlert, Trash2 } from 'lucide-react';

type Props = {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteAccountModal({ open, loading, onClose, onConfirm }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && !loading) onClose(); };
    if (open) window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, loading, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[1400] flex items-end sm:items-center justify-center sm:p-4"
      style={{
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        animation: 'daFadeIn 0.2s ease',
      }}
      onClick={(e) => { if (e.target === overlayRef.current && !loading) onClose(); }}
    >
      <div
        className="w-full sm:max-w-[400px] flex flex-col overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, rgba(25,12,12,0.98) 0%, rgba(14,14,17,0.98) 100%)',
          border: '1px solid rgba(239,68,68,0.22)',
          boxShadow: '0 0 0 1px rgba(239,68,68,0.06), 0 32px 80px rgba(0,0,0,0.7)',
          borderRadius: '20px 20px 20px 20px',
          animation: 'daSlideUp 0.25s cubic-bezier(0.32,0.72,0,1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <div className="flex justify-end pt-4 pr-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/10 transition-colors disabled:opacity-30"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Icon + content */}
        <div className="px-7 pb-2 flex flex-col items-center text-center gap-4">
          {/* Danger icon */}
          <div
            className="relative flex items-center justify-center w-16 h-16 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(239,68,68,0.18) 0%, rgba(239,68,68,0.05) 70%)',
              border: '1px solid rgba(239,68,68,0.25)',
              boxShadow: '0 0 32px rgba(239,68,68,0.12)',
            }}
          >
            <ShieldAlert className="w-7 h-7 text-red-400" strokeWidth={1.5} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Supprimer mon compte</h2>
            <p className="text-xs text-red-400/80 font-medium mt-1 uppercase tracking-wider">Action irréversible</p>
          </div>

          <p className="text-sm text-white/55 leading-relaxed">
            Toutes tes données seront définitivement supprimées&nbsp;: profil, réseaux sociaux connectés, candidatures, vidéos synchronisées et notifications.
          </p>

          {/* Warning strip */}
          <div
            className="w-full rounded-xl px-4 py-3 flex items-start gap-2.5"
            style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)' }}
          >
            <span className="text-xs text-red-300/80 leading-relaxed">
              ⚠️&nbsp;Cette action est <strong className="text-red-300">permanente</strong>. Il ne sera pas possible de récupérer ton compte par la suite.
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="px-7 py-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            style={{
              background: loading
                ? 'rgba(239,68,68,0.5)'
                : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: '#fff',
              boxShadow: loading ? 'none' : '0 4px 24px rgba(220,38,38,0.35)',
            }}
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Trash2 className="w-4 h-4" />
            }
            {loading ? 'Suppression…' : 'Oui, supprimer définitivement'}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white/55 transition-colors hover:text-white/80 hover:bg-white/[0.05] disabled:opacity-40"
            style={{ border: '1px solid rgba(255,255,255,0.09)' }}
          >
            Annuler
          </button>
        </div>
      </div>

      <style>{`
        @keyframes daFadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes daSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
}
