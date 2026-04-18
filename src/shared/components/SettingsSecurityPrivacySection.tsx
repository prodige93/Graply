import { ChevronRight, Shield, FileText, UserX } from 'lucide-react';
import stripeIcon from '@/shared/assets/stripe-settings-icon.jpeg';
import instagramIcon from '@/shared/assets/instagram-logo.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';
import youtubeIcon from '@/shared/assets/youtube-symbol.svg';
import MfaEnrollmentPanel from '@/shared/components/MfaEnrollmentPanel';

const glassCard = {
  background: 'rgba(255,255,255,0.055)',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  border: '1px solid rgba(255,255,255,0.18)',
  boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.13), inset 0 -1px 0 rgba(0,0,0,0.5)',
};

type Props = {
  navigate: (path: string) => void;
  onDeleteAccount: () => void;
  deletingAccount: boolean;
};

export default function SettingsSecurityPrivacySection({ navigate, onDeleteAccount, deletingAccount }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-white/90 tracking-tight">Compte, confidentialité et données</h2>
        <p className="text-xs text-white/35 mt-1 max-w-xl">
          Politique, conditions d’utilisation, données liées aux intégrations et suppression du compte — regroupés ici.
        </p>
      </div>

      <div className="rounded-xl p-5 mb-2" style={glassCard}>
        <MfaEnrollmentPanel />
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => navigate('/privacy-policy')}
          className="rounded-xl p-4 flex items-center justify-between w-full text-left transition-colors hover:bg-white/[0.04]"
          style={glassCard}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <Shield className="w-4 h-4 text-white/60" />
            </div>
            <span className="text-sm font-semibold text-white">Politique de confidentialité</span>
          </div>
          <ChevronRight className="w-5 h-5 text-white/35 shrink-0" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => navigate('/terms-of-service')}
          className="rounded-xl p-4 flex items-center justify-between w-full text-left transition-colors hover:bg-white/[0.04]"
          style={glassCard}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <FileText className="w-4 h-4 text-white/60" />
            </div>
            <span className="text-sm font-semibold text-white">Conditions d’utilisation</span>
          </div>
          <ChevronRight className="w-5 h-5 text-white/35 shrink-0" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => navigate('/stripe-data')}
          className="rounded-xl p-4 flex items-center justify-between w-full text-left transition-colors hover:bg-white/[0.04]"
          style={glassCard}
        >
          <div className="flex items-center gap-3 min-w-0">
            <img src={stripeIcon} alt="Stripe" className="w-9 h-9 rounded-lg object-cover shrink-0" />
            <span className="text-sm font-semibold text-white">Données &amp; usage Stripe</span>
          </div>
          <ChevronRight className="w-5 h-5 text-white/35 shrink-0" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => navigate('/tiktok-data')}
          className="rounded-xl p-4 flex items-center justify-between w-full text-left transition-colors hover:bg-white/[0.04]"
          style={glassCard}
        >
          <div className="flex items-center gap-3 min-w-0">
            <img src={tiktokIcon} alt="TikTok" className="w-9 h-9 shrink-0" />
            <span className="text-sm font-semibold text-white">Données &amp; usage TikTok</span>
          </div>
          <ChevronRight className="w-5 h-5 text-white/35 shrink-0" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => navigate('/instagram-data')}
          className="rounded-xl p-4 flex items-center justify-between w-full text-left transition-colors hover:bg-white/[0.04]"
          style={glassCard}
        >
          <div className="flex items-center gap-3 min-w-0">
            <img src={instagramIcon} alt="Instagram" className="w-9 h-9 shrink-0" />
            <span className="text-sm font-semibold text-white">Données &amp; usage Instagram</span>
          </div>
          <ChevronRight className="w-5 h-5 text-white/35 shrink-0" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => navigate('/youtube-data')}
          className="rounded-xl p-4 flex items-center justify-between w-full text-left transition-colors hover:bg-white/[0.04]"
          style={glassCard}
        >
          <div className="flex items-center gap-3 min-w-0">
            <img src={youtubeIcon} alt="YouTube" className="w-9 h-9 shrink-0" />
            <span className="text-sm font-semibold text-white">Données &amp; usage YouTube</span>
          </div>
          <ChevronRight className="w-5 h-5 text-white/35 shrink-0" aria-hidden />
        </button>
      </div>

      <div className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ ...glassCard, borderColor: 'rgba(239,68,68,0.25)' }}>
        <div>
          <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Zone sensible</p>
          <p className="text-xs text-white/35 mt-0.5">Suppression définitive du compte et des données associées.</p>
        </div>
        <button
          type="button"
          onClick={onDeleteAccount}
          disabled={deletingAccount}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-red-500/10 active:scale-[0.97] disabled:opacity-40 shrink-0"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.35)',
          }}
        >
          <UserX className="w-4 h-4 text-red-400" />
          <span className="text-red-400">Supprimer mon compte</span>
        </button>
      </div>
    </div>
  );
}
