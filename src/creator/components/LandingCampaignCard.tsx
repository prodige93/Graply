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
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.9 31.9 0 0 0 0 12a31.9 31.9 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.9 31.9 0 0 0 24 12a31.9 31.9 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M19.3 6.4a4.8 4.8 0 0 1-2.9-1.5A4.8 4.8 0 0 1 15.3 2h-3.4v13.5a2.9 2.9 0 0 1-2.9 2.7 2.9 2.9 0 0 1-2.9-2.9 2.9 2.9 0 0 1 2.9-2.9c.3 0 .6 0 .9.1V9a6.4 6.4 0 0 0-.9-.1 6.3 6.3 0 0 0-6.3 6.5 6.3 6.3 0 0 0 6.3 6.1 6.3 6.3 0 0 0 6.3-6.3V9.3a8.2 8.2 0 0 0 4.8 1.5V7.4a4.8 4.8 0 0 1-1.8-1z" />
    </svg>
  ),
  instagram: (
    <img src="/instagram.svg" alt="Instagram" className="w-5 h-5" />
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
          <div className="flex items-center gap-1.5 ml-auto shrink-0 text-white">
            {data.socials.map((s) => (
              <span key={s} className="opacity-90 hover:opacity-100 transition-opacity">{socialIcons[s]}</span>
            ))}
          </div>
        </div>

        <h3 className="text-[13px] sm:text-[15px] font-bold text-white leading-snug mb-3 sm:mb-4 line-clamp-2">
          {data.title}
        </h3>

        <div className="flex flex-wrap items-center gap-1.5">
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
                className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide"
                style={tagStyle}
              >
                {tag}
              </span>
            );
          })}
        </div>

        <div className="flex-1" />

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-baseline gap-1">
            <span className="text-[15px] font-bold text-white">{data.earned}</span>
            <span className="text-[11px] text-white/50 font-medium">/{data.budget}</span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <svg viewBox="0 0 16 16" className="w-3 h-3 fill-current text-white/40">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm5 6a5 5 0 0 0-10 0h10z" />
              </svg>
              <span className="text-[11px] font-semibold text-white">{data.creators}</span>
            </div>

            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(255,120,42,0.1)',
                border: '1px solid rgba(255,120,42,0.25)',
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
