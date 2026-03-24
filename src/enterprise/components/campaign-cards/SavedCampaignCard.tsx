import { Trash2 } from 'lucide-react';
import { useEnterpriseNavigate } from '@/enterprise/lib/useEnterpriseNavigate';
import type { CampaignData } from '../CampaignCard';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';

const platformIconMapSaved: Record<string, string> = {
  instagram: instagramIcon,
  tiktok: tiktokIcon,
  youtube: youtubeIcon,
};

export default function SavedCampaignCard({ campaign, onRemove }: { campaign: CampaignData; onRemove: () => void }) {
  const navigate = useEnterpriseNavigate();

  return (
    <div
      onClick={() => navigate(`/campagne/${campaign.id}`, { state: { from: '/mes-campagnes' } })}
      className="rounded-2xl overflow-hidden cursor-pointer relative"
      style={{
        background: 'rgba(10,10,15,1)',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.04)',
      }}
    >
      <div className="flex items-stretch h-[150px]">
        <div className="relative w-28 shrink-0 h-full">
          <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent 20%, rgba(10,10,15,1) 100%)' }} />
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute top-2 left-2 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 z-10"
            style={{
              background: 'rgba(255,255,255,0.055)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            }}
          >
            <Trash2 className="w-3.5 h-3.5 text-white/70" />
          </button>
        </div>

        <div className="flex-1 px-4 py-3 flex flex-col justify-center gap-1.5 min-w-0">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest mb-0.5">{campaign.brand}</p>
            <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">{campaign.title}</h3>
          </div>

          <div className="flex items-center gap-1.5">
            {campaign.socials.map((p) =>
              platformIconMapSaved[p] ? (
                <img key={p} src={platformIconMapSaved[p]} alt={p} className="w-3.5 h-3.5 brightness-0 invert opacity-50" />
              ) : null
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {campaign.tags.filter((t) => ['ugc', 'clipping'].includes(t.toLowerCase())).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-[9px] font-semibold"
                style={
                  tag.toLowerCase() === 'ugc'
                    ? { background: 'rgba(255,0,217,0.1)', border: '1px solid rgba(255,0,217,0.25)', color: '#FF00D9' }
                    : { background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', color: '#a78bfa' }
                }
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-white">{campaign.ratePerView}<span className="text-[9px] text-white/30 font-medium">/K</span></span>
            <span className="text-white/20 text-[9px]">·</span>
            <span className="text-[11px] font-bold text-white/70">{campaign.budget}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
