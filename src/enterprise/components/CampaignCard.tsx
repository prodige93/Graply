import { Trash2, Bookmark } from 'lucide-react';
import jentrepriseIcon from '@/shared/assets/badge-enterprise-verified.png';
import { enterprises } from '@/shared/data/campaignsData';
import { useSavedCampaigns } from '@/enterprise/contexts/SavedCampaignsContext';
import { useEnterpriseNavigate } from '@/enterprise/lib/useEnterpriseNavigate';

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
    <svg viewBox="0 0 27 27" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M25.3572 7.2225C25.2235 6.68859 24.9514 6.19939 24.5682 5.80433C24.1849 5.40927 23.7043 5.12233 23.1747 4.9725C21.2397 4.5 13.4997 4.5 13.4997 4.5C13.4997 4.5 5.75967 4.5 3.82467 5.0175C3.29507 5.16733 2.81439 5.45427 2.43118 5.84933C2.04797 6.24439 1.7758 6.73359 1.64217 7.2675C1.28803 9.23125 1.11481 11.2233 1.12467 13.2187C1.11204 15.2292 1.28528 17.2365 1.64217 19.215C1.7895 19.7323 2.06776 20.2029 2.45008 20.5813C2.8324 20.9597 3.30584 21.233 3.82467 21.375C5.75967 21.8925 13.4997 21.8925 13.4997 21.8925C13.4997 21.8925 21.2397 21.8925 23.1747 21.375C23.7043 21.2252 24.1849 20.9382 24.5682 20.5432C24.9514 20.1481 25.2235 19.6589 25.3572 19.125C25.7086 17.176 25.8818 15.1991 25.8747 13.2187C25.8873 11.2083 25.7141 9.20104 25.3572 7.2225Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.9688 16.8975L17.4375 13.2187L10.9688 9.53999V16.8975Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.3 6.4a4.8 4.8 0 0 1-2.9-1.5A4.8 4.8 0 0 1 15.3 2h-3.4v13.5a2.9 2.9 0 0 1-2.9 2.7 2.9 2.9 0 0 1-2.9-2.9 2.9 2.9 0 0 1 2.9-2.9c.3 0 .6 0 .9.1V9a6.4 6.4 0 0 0-.9-.1 6.3 6.3 0 0 0-6.3 6.5 6.3 6.3 0 0 0 6.3 6.1 6.3 6.3 0 0 0 6.3-6.3V9.3a8.2 8.2 0 0 0 4.8 1.5V7.4a4.8 4.8 0 0 1-1.8-1z"/>
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 27 27" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.125 2.25H7.875C4.7684 2.25 2.25 4.7684 2.25 7.875V19.125C2.25 22.2316 4.7684 24.75 7.875 24.75H19.125C22.2316 24.75 24.75 22.2316 24.75 19.125V7.875C24.75 4.7684 22.2316 2.25 19.125 2.25Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.0002 12.7913C18.139 13.7275 17.9791 14.6837 17.5431 15.5239C17.1072 16.364 16.4174 17.0453 15.572 17.4709C14.7265 17.8964 13.7684 18.0446 12.8339 17.8942C11.8994 17.7438 11.0361 17.3026 10.3669 16.6333C9.69757 15.964 9.25636 15.1007 9.10598 14.1662C8.95561 13.2317 9.10373 12.2736 9.52928 11.4282C9.95482 10.5827 10.6361 9.89296 11.4763 9.45703C12.3164 9.02109 13.2726 8.86117 14.2089 9C15.1639 9.14162 16.0481 9.58665 16.7308 10.2693C17.4135 10.952 17.8585 11.8362 18.0002 12.7913Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19.6875 7.3125H19.6988" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

export default function CampaignCard({ data, from }: { data: CampaignData; from?: string }) {
  const navigate = useEnterpriseNavigate();
  const { isSaved, toggle } = useSavedCampaigns();
  const saved = isSaved(data.id);
  const isSavedPage = from === '/enregistre';

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
      onClick={() => navigate(`/campagne/${data.id}`)}
      className="rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.04] hover:-translate-y-1 group h-full flex flex-col cursor-pointer relative"
      style={{
        background: 'rgba(10,10,15,1)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.06)',
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
        <img
          src={data.image}
          alt={data.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, transparent 55%, rgba(10,10,15,0.6) 72%, rgba(10,10,15,0.92) 86%, rgba(10,10,15,1) 100%)',
          }}
        />
        {isSavedPage ? (
          <button
            onClick={handleSave}
            className="absolute top-2.5 left-2.5 z-30 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 pointer-events-auto"
            style={{
              background: 'rgba(255,255,255,0.055)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.13), inset 0 -1px 0 rgba(0,0,0,0.5)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.055)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
            }}
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="absolute top-2.5 left-2.5 z-30 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 pointer-events-auto"
            style={{
              background: saved ? 'rgba(255,255,255,0.95)' : 'rgba(10,10,12,0.65)',
              backdropFilter: 'blur(10px)',
              border: saved ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 transition-all duration-200"
              fill={saved ? 'black' : 'none'}
              stroke={saved ? 'black' : 'white'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        )}
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
              <img src={jentrepriseIcon} alt="Verified" className="w-5 h-5 shrink-0" />
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

          <div className="flex items-center gap-1.5">
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 fill-current text-white/40">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm5 6a5 5 0 0 0-10 0h10z" />
              </svg>
              <span className="text-[10px] font-semibold text-white">{data.creators}</span>
            </div>

            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full"
              style={{
                background: 'rgba(255,120,42,0.1)',
                border: '1px solid rgba(255,120,42,0.25)',
              }}
            >
              <span className="text-[10px] font-bold text-white">{data.ratePerView}</span>
              <span className="text-[9px] font-medium text-white/40">/K</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
