import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, ChevronRight, Users } from 'lucide-react';
import { supabase } from '@/shared/infrastructure/supabase';
interface Campaign {
  id: string;
  name: string;
  description: string;
  photo_url: string | null;
  budget: string;
  content_type: string;
  categories: string[];
  platforms: string[];
  platform_budgets: Record<string, { amount: string; per1000: string; min: string; max: string }>;
  status: string;
  created_at: string;
  user_id?: string | null;
}
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

export default function ActiveCampaignCard({ campaign }: { campaign: Campaign }) {
  const navigate = useNavigate();
  const [creatorCount, setCreatorCount] = useState(0);
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
      ? { background: 'linear-gradient(135deg, rgba(255,100,200,0.35) 0%, rgba(255,0,180,0.18) 50%, rgba(200,0,150,0.28) 100%)', border: '1px solid rgba(255,130,210,0.55)', color: '#ffffff', backdropFilter: 'blur(12px)', boxShadow: 'inset 0 1px 0 rgba(255,200,240,0.3), 0 0 10px rgba(255,0,180,0.2)', textShadow: '0 0 8px rgba(255,150,220,0.6)' }
      : { background: 'rgba(57,31,154,0.25)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(57,31,154,0.5)', color: '#ffffff', boxShadow: 'inset 0 1px 0 rgba(167,139,250,0.2)' };

  const onNavigate = () => navigate(`/ma-campagne/${campaign.id}`);

  return (
    <button
      onClick={onNavigate}
      className="w-full group rounded-2xl overflow-hidden text-left transition-all duration-200 hover:scale-[1.005] flex flex-col"
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
          <div className="hidden lg:flex absolute top-2.5 right-2.5 items-center" style={{ gap: 0 }}>
            {campaign.platforms.filter((p: string) => platformIcons[p]).map((p: string, i: number, arr: string[]) => (
              <div
                key={p}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(20,20,28,0.72)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
                  marginLeft: i === 0 ? 0 : -8,
                  zIndex: arr.length - i,
                  position: 'relative',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = 'translateY(-3px) scale(1.15)';
                  el.style.boxShadow = '0 6px 20px rgba(255,255,255,0.15), 0 2px 10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)';
                  el.style.zIndex = '99';
                  el.style.background = 'rgba(40,40,55,0.88)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = 'translateY(0) scale(1)';
                  el.style.boxShadow = '0 2px 10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)';
                  el.style.zIndex = String(arr.length - i);
                  el.style.background = 'rgba(20,20,28,0.72)';
                }}
              >
                <img src={platformIcons[p]} alt={p} style={{ width: 11, height: 11, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
              </div>
            ))}
          </div>
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
            <div className="flex items-center" style={{ gap: 0 }}>
              {campaign.platforms.filter((p: string) => platformIcons[p]).map((p: string, i: number, arr: string[]) => (
                <div
                  key={p}
                  style={{
                    width: 22,
                    height: 22,
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
                    position: 'relative',
                  }}
                >
                  <img src={platformIcons[p]} alt={p} style={{ width: 10, height: 10, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.8 }} />
                </div>
              ))}
            </div>
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
              <p className="text-[9px] text-white/30 mt-0.5">Createur</p>
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
  );
}
