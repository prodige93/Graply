import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';
import verifiedIcon from '@/shared/assets/badge-enterprise-verified.png';
import bookmarkIcon from '@/shared/assets/bookmark-filled.svg';
import { enterprises } from '@/shared/data/campaignsData';
import { useSavedCampaigns } from '@/creator/contexts/SavedCampaignsContext';

export interface CampaignData {
  id: string;
  image: string;
  tags: string[];
  timeAgo: string;
  title: string;
  description: string;
  brand: string;
  verified: boolean;
  socials: ('youtube' | 'tiktok' | 'instagram')[];
  earned: string;
  budget: string;
  ratePerView: string;
  progress: number;
  approval: string;
  views: string;
  creators: string;
  brandLogo: string;
  category: string;
  contentType: string;
  applicants: number;
  ratesPerPlatform: { platform: 'youtube' | 'tiktok' | 'instagram'; rate: string }[];
  topCreators: { name: string; avatar: string; views: string; earned: string; platform: 'youtube' | 'tiktok' | 'instagram' }[];
  platformStats: { platform: 'youtube' | 'tiktok' | 'instagram'; views: string; earned: string }[];
  chartData: { label: string; views: number; earned: number }[];
  isPublic?: boolean;
  rules?: string[];
  documents?: { name: string; size: string; type: string }[];
}

const socialIcons: Record<string, JSX.Element> = {
  youtube: (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.9 31.9 0 0 0 0 12a31.9 31.9 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.9 31.9 0 0 0 24 12a31.9 31.9 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
    </svg>
  ),
  tiktok: (
    <img src={tiktokIcon} alt="TikTok" className="w-4 h-4 social-icon" />
  ),
  instagram: (
    <img src={instagramIcon} alt="Instagram" className="w-4 h-4 social-icon" />
  ),
};

export default function CampaignCard({ data, from }: { data: CampaignData; from?: string }) {
  const navigate = useNavigate();
  const { toggle, isSaved } = useSavedCampaigns();
  const saved = isSaved(data.id);

  const enterpriseId = enterprises.find(
    (e) => e.name.toLowerCase() === data.brand.toLowerCase()
  )?.id;

  const handleBrandClick = (e: React.MouseEvent) => {
    if (enterpriseId) {
      e.stopPropagation();
      navigate(`/entreprise/${enterpriseId}`);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle(data.id);
  };

  return (
    <div
      onClick={() => navigate(`/campagne/${data.id}`, { state: { from: from ?? '/campagnes' } })}
      className="rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.04] hover:-translate-y-1 group h-full flex flex-col cursor-pointer relative"
      style={{
        background: 'rgba(10,10,15,1)',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.04)',
      }}
    >
      <div className="absolute inset-0 z-20 hidden lg:flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}>
        <span
          className="px-8 py-3 rounded-xl text-sm font-bold tracking-wide uppercase"
          style={{
            background: '#FFFFFF',
            color: '#000',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.12)',
          }}
        >
          Rejoindre
        </span>
      </div>
      <div className="relative h-36 overflow-hidden">
        {from === '/enregistre' ? (
          <button
            onClick={handleSave}
            className="absolute top-2.5 left-2.5 z-30 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 pointer-events-auto group/trash"
            style={{
              background: 'rgba(10,10,12,0.65)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)';
              (e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(255,255,255,0.3)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(255,255,255,0.15)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(10,10,12,0.65)';
              (e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(255,255,255,0.18)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 10px rgba(0,0,0,0.4)';
            }}
          >
            <Trash2 className="w-3.5 h-3.5 text-white/70 group-hover/trash:text-white transition-colors duration-200" />
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="absolute top-2.5 left-2.5 z-30 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 pointer-events-auto group/bk"
            style={{
              background: saved ? 'rgba(255,255,255,0.95)' : 'rgba(10,10,12,0.65)',
              backdropFilter: 'blur(10px)',
              border: saved ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
            }}
            onMouseEnter={(e) => {
              if (!saved) {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)';
                (e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(255,255,255,0.3)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(255,255,255,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!saved) {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(10,10,12,0.65)';
                (e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(255,255,255,0.18)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 10px rgba(0,0,0,0.4)';
              }
            }}
          >
            <img
              src={bookmarkIcon}
              alt="Enregistrer"
              className="w-4 h-4 transition-all duration-200 group-hover/bk:scale-110"
              style={{ filter: saved ? 'invert(1)' : 'brightness(0) invert(1)' }}
            />
          </button>
        )}
        <img
          src={data.image}
          alt={data.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, transparent 20%, rgba(10,10,15,1) 100%)',
          }}
        />
      </div>

      <div className="px-4 pt-3 pb-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2.5">
          <img
            src={data.brandLogo}
            alt={data.brand}
            className={`w-6 h-6 rounded-full object-cover shrink-0 ${enterpriseId ? 'cursor-pointer hover:ring-1 hover:ring-white/30 transition-all' : ''}`}
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            onClick={handleBrandClick}
          />
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span
              className={`text-[12px] font-semibold text-white truncate ${enterpriseId ? 'cursor-pointer hover:text-white/80 transition-colors' : ''}`}
              onClick={handleBrandClick}
            >
              {data.brand}
            </span>
            {data.verified && (
              <img src={verifiedIcon} alt="Verified" className="w-5 h-5 shrink-0" />
            )}
            <span className="text-[10px] text-white/30 shrink-0">· {data.timeAgo}</span>
          </div>
          <div className="flex items-center gap-1 ml-auto shrink-0 text-white">
            {data.socials.map((s) => (
              <span key={s} className="opacity-100">{socialIcons[s]}</span>
            ))}
          </div>
        </div>

        <h3 className="text-[13px] font-bold text-white leading-snug mb-2.5 line-clamp-2">
          {data.title}
        </h3>

        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {data.tags.map((tag) => {
            const lower = tag.toLowerCase();
            let tagStyle: React.CSSProperties;
            if (lower === 'clipping') {
              tagStyle = {
                background: 'rgba(57,31,154,0.15)',
                border: '1px solid rgba(57,31,154,0.35)',
                color: '#a78bfa',
              };
            } else if (lower === 'ugc') {
              tagStyle = {
                background: 'rgba(255,0,217,0.15)',
                border: '1px solid rgba(255,0,217,0.35)',
                color: '#FF00D9',
              };
            } else {
              tagStyle = {
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#ffffff',
              };
            }
            return (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-full text-[9px] font-semibold tracking-wide"
                style={tagStyle}
              >
                {tag}
              </span>
            );
          })}
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 fill-current text-white/40">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm5 6a5 5 0 0 0-10 0h10z" />
            </svg>
            <span className="text-[9px] font-semibold text-white">{data.creators}</span>
          </div>
        </div>

        <div className="flex-1" />

        <div className="w-full h-1 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${data.progress}%`,
              background: 'rgba(255,255,255,0.9)',
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-[13px] font-bold text-white">{data.earned}</span>
            <span className="text-[10px] text-white/25 font-medium">/{data.budget}</span>
          </div>

          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full"
            style={{
              background: 'rgba(251,146,60,0.18)',
              border: '1px solid rgba(251,146,60,0.35)',
            }}
          >
            <span className="text-[10px] font-bold text-white">{data.ratePerView}</span>
            <span className="text-[9px] font-medium text-white/50">/1K</span>
          </div>
        </div>
      </div>
    </div>
  );
}
