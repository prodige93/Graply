import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import type { CampaignData } from '../CampaignCard';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';

const platformIconMapSaved: Record<string, string> = {
  instagram: instagramIcon,
  tiktok: tiktokIcon,
  youtube: youtubeIcon,
};

const glassCard = {
  background: 'rgba(10,10,15,1)',
  border: '1px solid rgba(255,255,255,0.18)',
  boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.13), inset 0 -1px 0 rgba(0,0,0,0.5)',
};

export default function SavedCampaignCard({ campaign, onRemove }: { campaign: CampaignData; onRemove: () => void }) {
  const navigate = useNavigate();

  return (
    <button
      onMouseEnter={() => {
        void import('@/creator/pages/CampaignDetailPage.tsx');
      }}
      onClick={() => navigate(`/campagne/${campaign.id}`, { state: { from: '/mes-campagnes' } })}
      className="w-full rounded-2xl overflow-hidden text-left transition-all duration-200 hover:scale-[1.003] relative group"
      style={glassCard}
    >
      <div className="flex items-stretch">
        <div className="relative w-28 sm:w-36 shrink-0">
          <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent 20%, rgba(10,10,15,1) 100%)' }} />
        </div>
        <div className="flex-1 px-4 py-4 flex flex-col gap-2 min-w-0">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest mb-0.5">{campaign.brand}</p>
            <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">{campaign.title}</h3>
          </div>
          <div className="flex items-center" style={{ gap: 0 }}>
            {campaign.socials.filter((p) => platformIconMapSaved[p]).map((p, i, arr) => (
              <div key={p} style={{
                width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(20,20,28,0.72)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
                marginLeft: i === 0 ? 0 : -7, zIndex: arr.length - i, position: 'relative',
              }}>
                <img src={platformIconMapSaved[p]} alt={p} style={{ width: 10, height: 10, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.8 }} />
              </div>
            ))}
          </div>
          <div className="flex items-center" style={{ gap: 0 }}>
            {campaign.tags.filter((t) => ['ugc', 'clipping'].includes(t.toLowerCase())).map((tag, i, arr) => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-[9px] font-semibold"
                style={{
                  ...(tag.toLowerCase() === 'ugc' ? { background: 'linear-gradient(135deg, rgba(255,100,200,0.35) 0%, rgba(255,0,180,0.18) 50%, rgba(200,0,150,0.28) 100%)', border: '1px solid rgba(255,130,210,0.55)', color: '#ffffff', backdropFilter: 'blur(12px)', boxShadow: 'inset 0 1px 0 rgba(255,200,240,0.3), 0 0 10px rgba(255,0,180,0.2)', textShadow: '0 0 8px rgba(255,150,220,0.6)', outline: '2px solid rgba(10,10,15,1)' } : { background: 'rgba(57,31,154,0.25)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(57,31,154,0.5)', color: '#ffffff', boxShadow: 'inset 0 1px 0 rgba(167,139,250,0.2)', outline: '2px solid rgba(10,10,15,1)' }),
                  marginLeft: i === 0 ? 0 : -6,
                  zIndex: arr.length + 1 - i,
                  position: 'relative' as const,
                }}
              >{tag}</span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full" style={{ background: 'linear-gradient(145deg, rgba(177,188,255,0.22) 0%, rgba(177,188,255,0.08) 50%, rgba(120,133,255,0.18) 100%)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(177,188,255,0.45)', boxShadow: '0 1px 0 rgba(255,255,255,0.35) inset, 0 -1px 0 rgba(120,133,255,0.2) inset, 0 2px 8px rgba(177,188,255,0.15)' }}>
              <span className="text-[10px] font-bold text-white">{campaign.ratePerView}</span>
              <span className="text-[8px] font-medium text-white/50">/1K</span>
            </div>
            <span className="text-white/20 text-[9px]">.</span>
            <span className="text-[10px] font-bold text-white/70">{campaign.budget}</span>
          </div>
        </div>
      </div>
      <div
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); onRemove(); }}
        className="absolute top-2.5 left-2.5 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer hover:bg-white/[0.14] hover:border-white/25 hover:shadow-[0_4px_20px_rgba(255,255,255,0.08)]"
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
        }}
      >
        <Trash2 className="w-3.5 h-3.5 text-white/70" />
      </div>
    </button>
  );
}
