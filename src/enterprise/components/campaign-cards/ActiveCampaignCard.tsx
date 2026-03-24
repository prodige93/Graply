import { useState, useEffect } from 'react';
import { Megaphone, ChevronRight, Users, Trash2 } from 'lucide-react';
import { useEnterpriseNavigate } from '@/enterprise/lib/useEnterpriseNavigate';
import { supabase } from '@/shared/infrastructure/supabase';
import GrapeLoader from '../GrapeLoader';
import type { Campaign } from '@/enterprise/contexts/MyCampaignsContext';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';

const platformIcons: Record<string, string> = {
  instagram: instagramIcon,
  youtube: youtubeIcon,
  tiktok: tiktokIcon,
};

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'A l\'instant';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days}j`;
  const weeks = Math.floor(days / 7);
  return `il y a ${weeks} sem`;
}

const glassCard: React.CSSProperties = {
  background: 'rgba(10,10,15,1)',
  border: '1px solid rgba(255,255,255,0.10)',
  boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.04)',
};

interface ActiveCampaignCardProps {
  campaign: Campaign;
  onDelete?: (id: string) => Promise<void>;
}

export default function ActiveCampaignCard({ campaign, onDelete }: ActiveCampaignCardProps) {
  const navigate = useEnterpriseNavigate();
  const [creatorCount, setCreatorCount] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const totalBudget = parseFloat(campaign.budget.replace(/[^0-9.]/g, '')) || 0;
  const budgetLabel = totalBudget > 0 ? `$${totalBudget.toLocaleString()}` : campaign.budget;
  const contentType = campaign.content_type || '';

  useEffect(() => {
    supabase
      .from('campaign_applications')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', campaign.id)
      .eq('status', 'accepted')
      .then(({ count }) => {
        setCreatorCount(count ?? 0);
      });
  }, [campaign.id]);

  const contentBadgeStyle =
    contentType.toLowerCase() === 'ugc'
      ? { background: 'rgba(255,0,217,0.1)', border: '1px solid rgba(255,0,217,0.25)', color: '#FF00D9' }
      : { background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', color: '#a78bfa' };

  const onNavigate = () => navigate(`/ma-campagne/${campaign.id}`);

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    await onDelete(campaign.id);
    setDeleting(false);
    setConfirmOpen(false);
  };

  return (
    <>
      <div className="relative group">
        <button
          onClick={onNavigate}
          className="w-full rounded-2xl overflow-hidden text-left transition-all duration-200 hover:scale-[1.005] flex flex-col"
          style={glassCard}
        >
          <div className="flex lg:flex-col items-stretch">
            <div className="relative w-28 sm:w-36 lg:w-full shrink-0 lg:h-36">
              {campaign.photo_url ? (
                <img src={campaign.photo_url} alt={campaign.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full min-h-[112px] lg:min-h-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                  <Megaphone className="w-8 h-8 text-white/15" />
                </div>
              )}
              <div className="absolute inset-0 lg:hidden" style={{ background: 'linear-gradient(90deg, transparent 20%, rgba(10,10,15,1) 100%)' }} />
              <div className="absolute inset-0 hidden lg:block" style={{ background: 'linear-gradient(180deg, transparent 20%, rgba(10,10,15,1) 100%)' }} />
              <div className="hidden lg:flex absolute top-2.5 right-2.5 items-center gap-1.5">
                {campaign.platforms.map((p) =>
                  platformIcons[p] ? (
                    <span key={p} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
                      <img src={platformIcons[p]} alt={p} className="w-3.5 h-3.5 brightness-0 invert opacity-80" />
                    </span>
                  ) : null
                )}
              </div>
              {onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmOpen(true); }}
                  className="absolute top-2.5 left-2.5 w-8 h-8 lg:w-9 lg:h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 z-10"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                >
                  <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white/50" />
                </button>
              )}
            </div>

            <div className="flex-1 px-4 py-4 flex flex-col gap-2 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest mb-0.5">
                    {campaign.categories[0] || 'Campagne'}
                  </p>
                  <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">{campaign.name}</h3>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors shrink-0 mt-0.5" />
              </div>

              <div className="flex items-center gap-2 lg:hidden">
                {campaign.platforms.map((p) =>
                  platformIcons[p] ? <img key={p} src={platformIcons[p]} alt={p} className="w-3.5 h-3.5 brightness-0 invert opacity-50" /> : null
                )}
                {contentType && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold" style={contentBadgeStyle}>
                    {contentType}
                  </span>
                )}
                <span className="text-[10px] text-white/30 ml-auto">{timeAgo(campaign.created_at)}</span>
              </div>

              <div className="hidden lg:flex items-center gap-2">
                {contentType && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold" style={contentBadgeStyle}>
                    {contentType}
                  </span>
                )}
                <span className="text-[10px] text-white/30 ml-auto">{timeAgo(campaign.created_at)}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-1">
                <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-sm font-black text-white">{creatorCount}</p>
                  <p className="text-[9px] text-white/30 mt-0.5">Créateur</p>
                </div>
                <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-sm font-black text-white">{formatViews(0)}</p>
                  <p className="text-[9px] text-white/30 mt-0.5">Vues</p>
                </div>
                <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-sm font-black text-white">0</p>
                  <p className="text-[9px] text-white/30 mt-0.5">Videos</p>
                </div>
              </div>

              <div className="mt-2 px-0.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-black text-white">
                    $0 <span className="text-white/30 font-normal">/ {budgetLabel}</span>
                  </span>
                  <span className="text-[9px] font-bold text-white/50">0%</span>
                </div>
                <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                    style={{
                      width: '0%',
                      background: 'rgba(255,255,255,0.85)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => !deleting && setConfirmOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm mx-4 rounded-2xl p-6"
            style={{
              background: '#141212',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: 'rgba(239,68,68,0.06)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(239,68,68,0.18)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Supprimer cette campagne ?</h3>
                <p className="text-xs text-white/40 mt-0.5">Campagne en cours</p>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-2 leading-relaxed">
              Voulez-vous vraiment supprimer votre campagne <span className="font-semibold text-white/80">"{campaign.name}"</span> ?
            </p>
            <p className="text-xs text-white/30 mb-4 leading-relaxed">
              Tous les createurs ayant postule ou soumis une video seront notifies de la suppression. Cette action est irreversible.
            </p>
            {totalBudget > 0 && (
              <div
                className="flex items-start gap-3 rounded-xl px-4 py-3 mb-4"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <span className="text-white text-[10px] font-bold">$</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/70">Remboursement du budget restant</p>
                  <p className="text-xs text-white/40 mt-0.5 leading-relaxed">
                    Le montant restant de <span className="font-semibold text-white/70">${totalBudget.toLocaleString()}</span> sera rembourse sur votre compte dans un delai de <span className="font-semibold text-white/70">14 jours</span>.
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:text-white transition-colors disabled:opacity-40"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 active:scale-[0.96] disabled:opacity-50"
                style={{ background: '#ef4444', color: '#fff' }}
              >
                {deleting ? <GrapeLoader size="sm" /> : null}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
