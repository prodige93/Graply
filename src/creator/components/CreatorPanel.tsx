import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MessageCircle, Star, Eye, MoreVertical, Flag, ShieldBan, Check, User } from 'lucide-react';
import { mockCreatorsDetail } from '../pages/CreatorDetailPage';
import verifiedIcon from '@/shared/assets/badge-creator-verified.png';
import instagramIcon from '@/shared/assets/instagram-logo.svg';
import youtubeIcon from '@/shared/assets/youtube-symbol.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';
import instagramCardIcon from '@/shared/assets/instagram-card.svg';
import youtubeCardIcon from '@/shared/assets/youtube.svg';
import tiktokCardIcon from '@/shared/assets/tiktok.svg';

const platformIcons: Record<string, string> = {
  instagram: instagramIcon,
  youtube: youtubeIcon,
  tiktok: tiktokIcon,
};

const cardPlatformIcons: Record<string, string> = {
  instagram: instagramCardIcon,
  youtube: youtubeCardIcon,
  tiktok: tiktokCardIcon,
};

const platformLabels: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
};

interface DbProfile {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  display_name?: string;
}

interface CreatorPanelProps {
  creatorId?: string | null;
  dbProfile?: DbProfile | null;
  onClose: () => void;
}

export default function CreatorPanel({ creatorId, dbProfile, onClose }: CreatorPanelProps) {
  const navigate = useNavigate();
  const creator = creatorId ? mockCreatorsDetail.find((c) => c.id === creatorId) : null;

  const [showMenu, setShowMenu] = useState(false);
  const [modal, setModal] = useState<{ type: 'report' | 'block' } | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  function handleAction(type: 'report' | 'block') {
    setModal(null);
    setActionToast(type === 'report' ? 'Créateur signalé' : 'Créateur bloqué');
    setTimeout(() => setActionToast(null), 3000);
  }

  if (dbProfile && !creator) {
    return (
      <div className="flex-1 overflow-y-auto" style={{ background: '#050404' }}>
        <div className="max-w-2xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-10">
            <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Profil membre</span>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>

          <div className="flex flex-col items-center text-center py-12">
            <div
              className="w-28 h-28 rounded-full overflow-hidden flex items-center justify-center mb-5"
              style={!dbProfile.avatar_url ? { background: 'linear-gradient(135deg, #f97316, #ec4899)' } : { border: '3px solid rgba(255,255,255,0.08)' }}
            >
              {dbProfile.avatar_url ? (
                <img src={dbProfile.avatar_url} alt={dbProfile.username} className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">@{dbProfile.username}</h2>
            {dbProfile.display_name && (
              <p className="text-sm text-white/40 mb-4">{dbProfile.display_name}</p>
            )}
            {dbProfile.bio && (
              <p className="text-sm text-white/60 leading-relaxed max-w-sm">{dbProfile.bio}</p>
            )}
          </div>

          <div className="flex gap-3 max-w-xs mx-auto">
            <button
              onClick={() => navigate(`/messagerie?dm=${dbProfile.username}`)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 active:scale-[0.96]"
              style={{ background: '#fff', color: '#000' }}
            >
              <MessageCircle className="w-4 h-4" />
              Message
            </button>
            <button
              onClick={() => navigate(`/u/${dbProfile.username}`)}
              className="flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold transition-colors hover:bg-white/10"
              style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
            >
              Voir profil
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!creator) return null;

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: '#050404' }}>
      <div className="relative h-72 lg:h-80 overflow-hidden shrink-0">
        <img src={creator.banner} alt={creator.username} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050404] via-black/40 to-black/10" />
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/60 transition-colors"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-20 relative z-10 pb-16">
        <div className="flex items-end gap-5 mb-6">
          <div
            className="w-24 h-24 rounded-2xl overflow-hidden shrink-0"
            style={{ border: '3px solid #050404', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
          >
            <img src={creator.avatar} alt={creator.username} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0 pb-1 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-2xl font-bold text-white">@{creator.username}</h1>
                {creator.verified && <img src={verifiedIcon} alt="Verified" className="w-[29px] h-[29px]" />}
              </div>
              <p className="text-xs text-white/30">Membre depuis {creator.joinedDate}</p>
            </div>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu((p) => !p)}
                className="flex items-center justify-center w-9 h-9 rounded-full transition-colors"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <MoreVertical className="w-4 h-4 text-white" />
              </button>
              {showMenu && (
                <div
                  className="absolute right-0 top-11 w-52 rounded-xl py-1.5 z-50 overflow-hidden"
                  style={{
                    background: 'rgba(20,20,22,0.97)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                  }}
                >
                  <button onClick={() => { setShowMenu(false); setModal({ type: 'report' }); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.06] transition-colors">
                    <Flag className="w-4 h-4 text-white" />
                    <span className="text-sm text-white">Signaler</span>
                  </button>
                  <button onClick={() => { setShowMenu(false); setModal({ type: 'block' }); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.06] transition-colors">
                    <ShieldBan className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-400">Bloquer</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-sm text-white/70 leading-relaxed mb-5">{creator.bio}</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {creator.categories.map((cat) => {
            const lower = cat.toLowerCase();
            let tagStyle: React.CSSProperties;
            if (lower === 'clipping') {
              tagStyle = { background: 'rgba(57,31,154,0.15)', border: '1px solid rgba(57,31,154,0.35)', color: '#a78bfa' };
            } else if (lower === 'ugc') {
              tagStyle = { background: 'rgba(255,0,217,0.15)', border: '1px solid rgba(255,0,217,0.35)', color: '#FF00D9' };
            } else {
              tagStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' };
            }
            return (
              <span key={cat} className="px-3.5 py-1.5 rounded-full text-xs font-semibold" style={tagStyle}>
                {cat}
              </span>
            );
          })}
        </div>

        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(`/messagerie?dm=${creator.username}`)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:brightness-110 active:scale-[0.96]"
            style={{ background: '#fff', color: '#000' }}
          >
            <MessageCircle className="w-4 h-4" />
            Message
          </button>
          <button
            onClick={() => navigate(`/createur/${creator.id}`)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors hover:bg-white/10"
            style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
          >
            Voir profil complet
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Total vues</p>
            <p className="text-xl font-bold text-white">{creator.stats.totalViews}</p>
          </div>
          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Campagnes</p>
            <p className="text-xl font-bold text-white">{creator.stats.totalCampaigns}</p>
          </div>
          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-1 mb-1.5">
              <Star className="w-3 h-3" style={{ color: 'rgba(200,200,210,0.6)', fill: 'rgba(200,200,210,0.6)' }} />
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Note</p>
            </div>
            <p className="text-xl font-bold text-white">{creator.stats.avgRating}<span className="text-sm font-normal text-white/30">/5</span></p>
          </div>
        </div>

        <div className="rounded-2xl p-5 mb-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Plateformes</h3>
          <div className="space-y-2.5">
            {creator.platforms.map((p) => (
              <div
                key={p.platform}
                className="flex items-center gap-4 rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <img src={platformIcons[p.platform]} alt={p.platform} className="w-4.5 h-4.5 " style={{ width: '18px', height: '18px' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{platformLabels[p.platform]}</p>
                  <p className="text-xs text-white/35">{p.handle}</p>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">Vues</p>
                    <p className="text-sm font-bold text-white">{p.views}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">Abonnes</p>
                    <p className="text-sm font-bold text-white">{p.followers}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {creator.recentCampaigns.length > 0 && (
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Campagnes récentes</h3>
            <div className="space-y-2.5">
              {creator.recentCampaigns.map((camp) => (
                <div
                  key={camp.id}
                  onClick={() => navigate(`/campagne/${camp.id}`)}
                  className="flex items-center gap-4 rounded-xl px-4 py-3 cursor-pointer hover:bg-white/[0.03] transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <img src={camp.brandLogo} alt={camp.brand} className="w-10 h-10 rounded-lg object-cover shrink-0" style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{camp.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-white/35">{camp.brand}</span>
                      <img src={cardPlatformIcons[camp.platform]} alt="" className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-5 shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">Vues</p>
                      <p className="text-sm font-bold text-white">{camp.views}</p>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        background: camp.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${camp.status === 'active' ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.08)'}`,
                        color: camp.status === 'active' ? '#22c55e' : 'rgba(255,255,255,0.35)',
                      }}
                    >
                      {camp.status === 'active' ? 'Actif' : 'Termine'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div
            className="relative w-full max-w-sm mx-4 rounded-2xl p-6"
            style={{
              background: 'rgba(20,20,22,0.97)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
            }}
          >
            <button onClick={() => setModal(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
              <X className="w-4 h-4 text-white/40" />
            </button>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: modal.type === 'block' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${modal.type === 'block' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
              {modal.type === 'block' ? <ShieldBan className="w-5 h-5 text-red-400" /> : <Flag className="w-5 h-5 text-amber-400" />}
            </div>
            <h3 className="text-base font-bold text-white mb-2">{modal.type === 'report' ? 'Signaler ce créateur' : 'Bloquer ce créateur'}</h3>
            <p className="text-sm text-white/40 leading-relaxed mb-6">
              {modal.type === 'report'
                ? `@${creator.username} sera signalé à notre équipe de modération.`
                : `@${creator.username} sera bloqué et ne sera plus visible dans vos recherches.`}
            </p>
            <div className="flex items-center gap-3">
              <button onClick={() => setModal(null)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/60 transition-colors hover:bg-white/[0.06]" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Annuler</button>
              <button onClick={() => handleAction(modal.type)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.97]" style={{ background: modal.type === 'block' ? '#dc2626' : '#d97706' }}>
                {modal.type === 'report' ? 'Signaler' : 'Bloquer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl transition-all duration-500"
        style={{
          background: 'rgba(30,30,30,0.95)',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(16px)',
          opacity: actionToast ? 1 : 0,
          transform: actionToast ? 'translateY(0)' : 'translateY(20px)',
          pointerEvents: actionToast ? 'auto' : 'none',
        }}
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <Check className="w-4 h-4" style={{ color: '#22c55e' }} />
        </div>
        <p className="text-sm font-semibold text-white">{actionToast}</p>
      </div>
    </div>
  );
}
