import { useState } from 'react';
import { CreditCard, Megaphone, Trash2 } from 'lucide-react';
import { useEnterpriseNavigate } from '@/enterprise/lib/useEnterpriseNavigate';
import type { Campaign } from '@/enterprise/contexts/MyCampaignsContext';
import { startEnterpriseCampaignCheckout } from '@/shared/lib/enterpriseCampaignCheckout';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';

const platformIcons: Record<string, string> = {
  instagram: instagramIcon,
  youtube: youtubeIcon,
  tiktok: tiktokIcon,
};

export default function PendingCheckoutCard({
  campaign,
  onDelete,
}: {
  campaign: Campaign;
  onDelete: (id: string) => void;
}) {
  const navigate = useEnterpriseNavigate();
  const [paying, setPaying] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setError(null);
    setPaying(true);
    try {
      await startEnterpriseCampaignCheckout(campaign.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
      setPaying(false);
    }
  };

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{
          background: 'rgba(10,10,15,1)',
          border: '1px solid rgba(161,94,255,0.35)',
          boxShadow: '0 8px 48px rgba(0,0,0,0.85)',
        }}
      >
        <div className="flex items-stretch min-h-[140px]">
          <div className="relative w-28 shrink-0">
            {campaign.photo_url ? (
              <img src={campaign.photo_url} alt={campaign.name} className="w-full h-full min-h-[140px] object-cover" />
            ) : (
              <div className="w-full h-full min-h-[140px] flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                <Megaphone className="w-8 h-8 text-white/15" />
              </div>
            )}
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="absolute top-2 left-2 w-8 h-8 rounded-xl flex items-center justify-center z-10"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <Trash2 className="w-3.5 h-3.5 text-white/50" />
            </button>
          </div>
          <div className="flex-1 px-4 py-3 flex flex-col justify-center gap-2 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              {campaign.platforms.map((p) =>
                platformIcons[p] ? <img key={p} src={platformIcons[p]} alt={p} className="w-4 h-4 opacity-70" /> : null,
              )}
            </div>
            <h3 className="text-sm font-bold text-white truncate">{campaign.name}</h3>
            <p className="text-[11px] text-amber-200/90 font-medium">En attente de paiement</p>
            <p className="text-xs text-white/40">{campaign.budget}</p>
            {error && <p className="text-[11px] text-red-400/90">{error}</p>}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                disabled={paying}
                onClick={handlePay}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-black disabled:opacity-50"
                style={{ background: '#A15EFF' }}
              >
                <CreditCard className="w-3.5 h-3.5" />
                {paying ? 'Redirection…' : 'Payer et publier'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/modifier-campagne/${campaign.id}`, { state: { from: '/mes-campagnes' } })}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white/70"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      </div>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6"
            style={{ background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-white/80 mb-4">Supprimer cette campagne en attente de paiement ?</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setConfirmOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm text-white/60">
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(campaign.id);
                  setConfirmOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-red-400"
                style={{ background: 'rgba(239,68,68,0.12)' }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
