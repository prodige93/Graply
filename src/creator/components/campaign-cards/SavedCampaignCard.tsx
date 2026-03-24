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
          <div className="flex items-center gap-1.5">
            {campaign.socials.map((p) => platformIconMapSaved[p] ? (<img key={p} src={platformIconMapSaved[p]} alt={p} className="w-3 h-3 brightness-0 invert opacity-50" />) : null)}
          </div>
          <div className="flex items-center gap-1.5">
            {campaign.tags.filter((t) => ['ugc', 'clipping'].includes(t.toLowerCase())).map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-[9px] font-semibold"
                style={tag.toLowerCase() === 'ugc' ? { background: 'rgba(255,0,217,0.1)', border: '1px solid rgba(255,0,217,0.25)', color: '#FF00D9' } : { background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', color: '#a78bfa' }}
              >{tag}</span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-white">{campaign.ratePerView}<span className="text-[8px] text-white/30 font-medium">/1K</span></span>
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
