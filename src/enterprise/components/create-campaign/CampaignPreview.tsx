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
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.13), inset 0 -1px 0 rgba(0,0,0,0.5)',
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
            <div className="flex items-center ml-auto shrink-0" style={{ gap: 0 }}>
              {platforms.filter((p) => PLATFORM_ICONS[p]).map((p, i, arr) => (
                <div key={p} style={{
                  width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(20,20,28,0.72)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
                  marginLeft: i === 0 ? 0 : -7, zIndex: arr.length - i, position: 'relative' as const,
                }}>
                  <img src={PLATFORM_ICONS[p]} alt={p} style={{ width: 10, height: 10, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.8 }} />
                </div>
              ))}
            </div>
          </div>

          <h3 className="text-[13px] font-bold text-white leading-snug mb-2.5 line-clamp-2 min-h-[36px]">
            {name || 'Nom de votre campagne'}
          </h3>

          <div className="flex items-center mb-3 min-h-[22px]" style={{ gap: 0 }}>
            {contentType && (
              <span
                className="px-2.5 py-0.5 rounded-full text-[9px] font-semibold tracking-wide"
                style={{
                  ...(contentType.toLowerCase() === 'ugc'
                    ? { background: 'linear-gradient(135deg, rgba(255,100,200,0.35) 0%, rgba(255,0,180,0.18) 50%, rgba(200,0,150,0.28) 100%)', border: '1px solid rgba(255,130,210,0.55)', color: '#ffffff', backdropFilter: 'blur(12px)', boxShadow: 'inset 0 1px 0 rgba(255,200,240,0.3), 0 0 10px rgba(255,0,180,0.2)', textShadow: '0 0 8px rgba(255,150,220,0.6)' }
                    : { background: 'rgba(57,31,154,0.25)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(57,31,154,0.5)', color: '#ffffff', boxShadow: 'inset 0 1px 0 rgba(167,139,250,0.2)' }),
                  outline: '2px solid rgba(10,10,15,1)',
                  zIndex: categories.length + 1,
                  position: 'relative' as const,
                }}
              >
                {contentType}
              </span>
            )}
            {categories.map((cat, i, arr) => (
              <span
                key={cat}
                className="px-2.5 py-0.5 rounded-full text-[9px] font-semibold tracking-wide"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.2)',
                  outline: '2px solid rgba(10,10,15,1)',
                  marginLeft: -6,
                  zIndex: arr.length - i,
                  position: 'relative' as const,
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
              {avgPer1000 > 0 && (
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
                  <span className="text-[10px] font-bold text-white">
                    {avgPer1000 % 1 === 0 ? avgPer1000.toFixed(0) : avgPer1000.toFixed(2)}EUR
                  </span>
                  <span className="text-[9px] font-medium text-white/40">/K</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
