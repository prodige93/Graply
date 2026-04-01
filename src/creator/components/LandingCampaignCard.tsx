import badgeEnterpriseVerified from '@/shared/assets/badge-enterprise-verified.png';

export interface LandingCampaignCardData {
  image: string;
  tags: string[];
  timeAgo: string;
  title: string;
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
  logo?: string;
}

const socialIcons: Record<string, JSX.Element> = {
  youtube: (
    <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.9 31.9 0 0 0 0 12a31.9 31.9 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.9 31.9 0 0 0 24 12a31.9 31.9 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
      <path d="M19.3 6.4a4.8 4.8 0 0 1-2.9-1.5A4.8 4.8 0 0 1 15.3 2h-3.4v13.5a2.9 2.9 0 0 1-2.9 2.7 2.9 2.9 0 0 1-2.9-2.9 2.9 2.9 0 0 1 2.9-2.9c.3 0 .6 0 .9.1V9a6.4 6.4 0 0 0-.9-.1 6.3 6.3 0 0 0-6.3 6.5 6.3 6.3 0 0 0 6.3 6.1 6.3 6.3 0 0 0 6.3-6.3V9.3a8.2 8.2 0 0 0 4.8 1.5V7.4a4.8 4.8 0 0 1-1.8-1z" />
    </svg>
  ),
  instagram: (
    <img src="/instagram.svg" alt="Instagram" className="w-3 h-3" />
  ),
};

export default function LandingCampaignCard({ data }: { data: LandingCampaignCardData }) {
  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 group h-full flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #141418 0%, #0c0c10 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
      }}
    >
      <div className="relative h-36 sm:h-48 overflow-hidden">
        <img
          src={data.image}
          alt={data.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, transparent 40%, rgba(10,10,15,0.6) 100%)',
          }}
        />
      </div>

      <div className="px-3 sm:px-5 pt-3 sm:pt-4 pb-4 sm:pb-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="text-white/60 text-[10px] font-bold">{data.brand.charAt(0)}</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="text-[13px] font-semibold text-white/90 truncate">{data.brand}</span>
            {data.verified && (
              <img src={badgeEnterpriseVerified} alt="Verified" className="shrink-0" style={{ width: '20.8px', height: '20.8px' }} />
            )}
            <span className="text-[11px] text-white/30 shrink-0">· {data.timeAgo}</span>
          </div>
          <div className="flex items-center ml-auto shrink-0" style={{ gap: 0 }}>
            {data.socials.filter((s) => socialIcons[s]).map((s, i, arr) => (
              <div
                key={s}
                className="flex items-center justify-center text-white"
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: 'rgba(20,20,28,0.72)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
                  marginLeft: i === 0 ? 0 : -8,
                  zIndex: arr.length - i,
                  position: 'relative',
                }}
              >
                {socialIcons[s]}
              </div>
            ))}
          </div>
        </div>

        <h3 className="text-[13px] sm:text-[15px] font-bold text-white leading-snug mb-3 sm:mb-4 line-clamp-2">
          {data.title}
        </h3>

        <div className="flex items-center" style={{ gap: 0 }}>
          {data.tags.map((tag, i, arr) => {
            const lower = tag.toLowerCase();
            let tagStyle: React.CSSProperties;
            const outline = '2px solid rgba(10,10,15,1)';
            if (lower === 'clipping') {
              tagStyle = {
                background: 'rgba(57,31,154,0.25)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(57,31,154,0.5)',
                color: '#ffffff',
                boxShadow: 'inset 0 1px 0 rgba(167,139,250,0.2)',
                outline,
              };
            } else if (lower === 'ugc') {
              tagStyle = {
                background: 'linear-gradient(135deg, rgba(255,100,200,0.35) 0%, rgba(255,0,180,0.18) 50%, rgba(200,0,150,0.28) 100%)',
                border: '1px solid rgba(255,130,210,0.55)',
                color: '#ffffff',
                backdropFilter: 'blur(12px)',
                boxShadow: 'inset 0 1px 0 rgba(255,200,240,0.3), 0 0 10px rgba(255,0,180,0.2)',
                textShadow: '0 0 8px rgba(255,150,220,0.6)',
                outline,
              };
            } else {
              tagStyle = {
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#ffffff',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.2)',
                outline,
              };
            }
            return (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide"
                style={{
                  ...tagStyle,
                  marginLeft: i === 0 ? 0 : -6,
                  zIndex: arr.length + 1 - i,
                  position: 'relative',
                }}
              >
                {tag}
              </span>
            );
          })}
          <div
            className="flex items-center gap-1 px-3 py-1 rounded-full"
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
            <svg viewBox="0 0 16 16" className="w-3 h-3 fill-current text-white/40">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm5 6a5 5 0 0 0-10 0h10z" />
            </svg>
            <span className="text-[10px] font-semibold text-white">{data.creators}</span>
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-baseline gap-1">
            <span className="text-[15px] font-bold text-white">{data.earned}</span>
            <span className="text-[11px] text-white/50 font-medium">/{data.budget}</span>
          </div>

          <div className="flex items-center gap-2">

            <div
              className="flex items-center gap-0.5 px-2 py-1 rounded-full"
              style={{
                background: 'linear-gradient(145deg, rgba(177,188,255,0.22) 0%, rgba(177,188,255,0.08) 50%, rgba(120,133,255,0.18) 100%)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(177,188,255,0.45)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.35) inset, 0 -1px 0 rgba(120,133,255,0.2) inset, 0 2px 8px rgba(177,188,255,0.15)',
              }}
            >
              <span className="text-[11px] font-bold text-white">{data.ratePerView}</span>
              <span className="text-[10px] font-medium text-white">/1K</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
