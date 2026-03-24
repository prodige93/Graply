import instagramIcon from '@/shared/assets/instagram-card.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';
import { Image } from 'lucide-react';

const PLATFORM_ICONS: Record<string, string> = {
  instagram: instagramIcon,
  youtube: youtubeIcon,
  tiktok: tiktokIcon,
};

interface PlatformBudget {
  amount: string;
  per1000: string;
  min: string;
  max: string;
}

interface PreviewProps {
  name: string;
  photoPreview: string | null;
  contentType: string;
  categories: string[];
  platforms: string[];
  budget: string;
  platformBudgets: Record<string, PlatformBudget>;
}

function parseNum(val: string): number {
  return parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
}

export default function CampaignPreview({ name, photoPreview, contentType, categories, platforms, budget, platformBudgets }: PreviewProps) {
  const totalBudget = parseNum(budget);

  const per1000Values = platforms
    .map((id) => parseNum(platformBudgets[id]?.per1000 || ''))
    .filter((v) => v > 0);
  const avgPer1000 = per1000Values.length > 0
    ? per1000Values.reduce((a, b) => a + b, 0) / per1000Values.length
    : 0;

  return (
    <div className="sticky top-10">
      <div className="flex items-center justify-center mb-8">
        <span
          className="px-5 py-2 rounded-xl text-xs font-semibold text-white uppercase tracking-widest"
          style={{ border: '1px solid rgba(255,255,255,0.2)' }}
        >
          Apercu
        </span>
      </div>
      <div
        className="rounded-2xl overflow-hidden transition-all duration-500"
        style={{
          background: 'rgba(10,10,15,1)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.04)',
        }}
      >
        <div className="relative h-44 overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
          {photoPreview ? (
            <img src={photoPreview} alt="Campaign" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image className="w-8 h-8 text-white/10" />
            </div>
          )}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, transparent 20%, rgba(10,10,15,1) 100%)' }}
          />
        </div>

        <div className="px-4 pt-3 pb-4">
          <div className="flex items-center gap-2 mb-2.5">
            <div
              className="w-6 h-6 rounded-full shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            />
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="text-[12px] font-semibold text-white/90 truncate">Votre marque</span>
              <span className="text-[10px] text-white/30 shrink-0">- maintenant</span>
            </div>
            <div className="flex items-center gap-1 ml-auto shrink-0">
              {platforms.map((p) => (
                <img key={p} src={PLATFORM_ICONS[p]} alt={p} className="w-4 h-4 social-icon" style={{ opacity: 0.8 }} />
              ))}
            </div>
          </div>

          <h3 className="text-[13px] font-bold text-white leading-snug mb-2.5 line-clamp-2 min-h-[36px]">
            {name || 'Nom de votre campagne'}
          </h3>

          <div className="flex flex-wrap items-center gap-1.5 mb-3 min-h-[22px]">
            {contentType && (
              <span
                className="px-2.5 py-0.5 rounded-full text-[9px] font-semibold tracking-wide"
                style={{
                  background: contentType.toLowerCase() === 'ugc' ? 'rgba(255,0,217,0.15)' : 'rgba(57,31,154,0.15)',
                  border: contentType.toLowerCase() === 'ugc' ? '1px solid rgba(255,0,217,0.35)' : '1px solid rgba(57,31,154,0.35)',
                  color: contentType.toLowerCase() === 'ugc' ? '#FF00D9' : '#a78bfa',
                }}
              >
                {contentType}
              </span>
            )}
            {categories.map((cat) => (
              <span
                key={cat}
                className="px-2.5 py-0.5 rounded-full text-[9px] font-semibold tracking-wide"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#ffffff',
                }}
              >
                {cat}
              </span>
            ))}
          </div>

          <div className="w-full h-1 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.08)' }} />

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-[13px] font-bold text-white">0 EUR</span>
              <span className="text-[10px] text-white/25 font-medium">/{totalBudget > 0 ? totalBudget.toLocaleString('fr-FR') : '---'} EUR</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 fill-current text-white/40">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm5 6a5 5 0 0 0-10 0h10z" />
                </svg>
                <span className="text-[10px] font-semibold text-white/60">0</span>
              </div>

              {avgPer1000 > 0 && (
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded-full"
                  style={{
                    background: 'rgba(251,146,60,0.18)',
                    border: '1px solid rgba(251,146,60,0.35)',
                  }}
                >
                  <span className="text-[10px] font-bold text-white">
                    {avgPer1000 % 1 === 0 ? avgPer1000.toFixed(0) : avgPer1000.toFixed(2)}EUR
                  </span>
                  <span className="text-[9px] font-medium text-white/50">/1K</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
