import { useState, useEffect } from 'react';
import { Megaphone, Users, Trash2, RotateCcw } from 'lucide-react';
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
  from?: string;
}

export default function ActiveCampaignCard({ campaign, onDelete, from }: ActiveCampaignCardProps) {
  const navigate = useEnterpriseNavigate();
  const [creatorCount, setCreatorCount] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const totalBudget = parseFloat(campaign.budget.replace(/[^0-9.]/g, '')) || 0;
  const budgetLabel = totalBudget > 0 ? `$${totalBudget.toLocaleString()}` : campaign.budget;
  const contentType = campaign.content_type || '';
  const isCompleted = campaign.status === 'completed';

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
      ? { background: 'linear-gradient(135deg, rgba(255,100,200,0.35) 0%, rgba(255,0,180,0.18) 50%, rgba(200,0,150,0.28) 100%)', border: '1px solid rgba(255,130,210,0.55)', color: '#ffffff', backdropFilter: 'blur(12px)', boxShadow: 'inset 0 1px 0 rgba(255,200,240,0.3), 0 0 10px rgba(255,0,180,0.2)', textShadow: '0 0 8px rgba(255,150,220,0.6)' }
      : { background: 'rgba(57,31,154,0.25)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(57,31,154,0.5)', color: '#ffffff', boxShadow: 'inset 0 1px 0 rgba(167,139,250,0.2)' };

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
          onClick={isCompleted ? undefined : onNavigate}
          className={`w-full rounded-2xl overflow-hidden text-left transition-all duration-200 flex flex-col ${isCompleted ? 'cursor-default' : 'hover:scale-[1.005]'}`}
          style={glassCard}
        >
          <div className="flex lg:flex-col items-stretch">
            <div className="relative w-28 sm:w-36 lg:w-full shrink-0 lg:h-36">
              {campaign.photo_url ? (
                <img src={campaign.photo_url} alt={campaign.name} className="w-full h-full object-cover" style={isCompleted ? { filter: 'grayscale(100%)' } : undefined} />
              ) : (
                <div className="w-full h-full min-h-[112px] lg:min-h-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                  <Megaphone className="w-8 h-8 text-white/15" />
                </div>
              )}
              <div className="absolute inset-0 -right-px lg:hidden" style={{ background: 'linear-gradient(90deg, transparent 20%, rgba(10,10,15,1) 100%)' }} />
              <div className="absolute inset-0 -bottom-px hidden lg:block" style={{ background: 'linear-gradient(180deg, transparent 20%, rgba(10,10,15,1) 100%)' }} />
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

            <div className="flex-1 px-4 py-3 flex flex-col gap-2 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] text-white/30 shrink-0">{timeAgo(campaign.created_at)}</span>
                <div className="flex items-center ml-auto shrink-0" style={{ gap: 0 }}>
                  {campaign.platforms.filter((p) => platformIcons[p]).map((p, i, arr) => (
                    <div
                      key={p}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(20,20,28,0.72)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.18)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
                        marginLeft: i === 0 ? 0 : -7,
                        zIndex: arr.length - i,
                        position: 'relative' as const,
                      }}
                    >
                      <img src={platformIcons[p]} alt={p} style={{ width: 11, height: 11, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
                    </div>
                  ))}
                </div>
              </div>

              <h3 className="text-[13px] font-bold text-white leading-snug line-clamp-2">{campaign.name}</h3>

              <div className="flex items-center" style={{ gap: 0 }}>
                {(() => {
                  const tags: string[] = [];
                  if (contentType) tags.push(contentType);
                  campaign.categories.forEach((c) => { if (!tags.includes(c)) tags.push(c); });
                  const outline = '2px solid rgba(10,10,15,1)';
                  return tags.map((tag, i, arr) => {
                    const lower = tag.toLowerCase();
                    let tagStyle: React.CSSProperties;
                    if (lower === 'clipping') {
                      tagStyle = { background: 'rgba(57,31,154,0.25)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(57,31,154,0.5)', color: '#ffffff', boxShadow: 'inset 0 1px 0 rgba(167,139,250,0.2)', outline };
                    } else if (lower === 'ugc') {
                      tagStyle = { background: 'linear-gradient(135deg, rgba(255,100,200,0.35) 0%, rgba(255,0,180,0.18) 50%, rgba(200,0,150,0.28) 100%)', border: '1px solid rgba(255,130,210,0.55)', color: '#ffffff', backdropFilter: 'blur(12px)', boxShadow: 'inset 0 1px 0 rgba(255,200,240,0.3), 0 0 10px rgba(255,0,180,0.2)', textShadow: '0 0 8px rgba(255,150,220,0.6)', outline };
                    } else {
                      tagStyle = { background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.2)', outline };
                    }
                    return (
                      <span key={tag} className="px-2.5 py-0.5 rounded-full text-[9px] font-semibold tracking-wide" style={{ ...tagStyle, marginLeft: i === 0 ? 0 : -6, zIndex: arr.length + 1 - i, position: 'relative' }}>
                        {tag}
                      </span>
                    );
                  });
                })()}
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.2)',
                    outline: '2px solid rgba(10,10,15,1)',
                    marginLeft: -6,
                    zIndex: 0,
                    position: 'relative',
                  }}
                >
                  <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 fill-current text-white/40">
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm5 6a5 5 0 0 0-10 0h10z" />
                  </svg>
                  <span className="text-[9px] font-semibold text-white">{creatorCount}</span>
                </div>
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

              {isCompleted && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    navigate(`/modifier-campagne/${campaign.id}`, { state: { from: from || '/mes-campagnes', reactivate: true } });
                  }}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
                  style={{ background: '#fff', color: '#000' }}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Réactiver
                </button>
              )}
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
