import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useEnterpriseNavigate } from '@/enterprise/lib/useEnterpriseNavigate';
import { ArrowLeft, Globe, Megaphone, Users, Bell, MessageCircle, Check, MoreVertical, Flag, ShieldBan, X } from 'lucide-react';
import { enterprises, campaigns, sponsoredCampaigns } from '@/shared/data/campaignsData';
import CampaignCard from '../components/CampaignCard';
import jentrepriseIcon from '@/shared/assets/badge-enterprise-verified.png';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';

const platformIcons: Record<string, string> = {
  instagram: instagramIcon,
  youtube: youtubeIcon,
  tiktok: tiktokIcon,
};

export default function EnterprisePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useEnterpriseNavigate();
  const [bellActive, setBellActive] = useState(false);
  const [bellAnimating, setBellAnimating] = useState(false);
  const [showBellToast, setShowBellToast] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [modal, setModal] = useState<{ type: 'report' | 'block' } | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const desktopMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const insideMobile = mobileMenuRef.current?.contains(target);
      const insideDesktop = desktopMenuRef.current?.contains(target);
      if (!insideMobile && !insideDesktop) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleBellClick() {
    const next = !bellActive;
    setBellActive(next);
    setBellAnimating(true);
    setTimeout(() => setBellAnimating(false), 700);
    setShowBellToast(true);
    setTimeout(() => setShowBellToast(false), 2000);
  }

  const enterprise = enterprises.find((e) => e.id === id);

  const enterpriseCampaigns = useMemo(() => {
    if (!enterprise) return [];
    const all = [...sponsoredCampaigns, ...campaigns];
    return all.filter((c) => c.brand.toLowerCase() === enterprise.name.toLowerCase());
  }, [enterprise]);

  if (!enterprise) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white" style={{ backgroundColor: '#050404' }}>
        <p className="text-xl font-semibold mb-4">Entreprise introuvable</p>
        <button
          onClick={() => navigate('/campagnes')}
          className="px-6 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
        >
          Retour aux campagnes
        </button>
      </div>
    );
  }

  return (
    <div className="text-white" style={{ backgroundColor: '#050404' }}>
      <div className="relative h-64 lg:h-80 overflow-hidden">
        <img
          src={enterprise.banner}
          alt={enterprise.name}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, transparent 60%, rgba(5,4,4,0.5) 75%, rgba(5,4,4,0.88) 88%, rgba(5,4,4,1) 100%)'
          }}
        />
        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="absolute top-6 right-6 z-10 lg:hidden" ref={mobileMenuRef}>
          <button
            onClick={() => setShowMenu((p) => !p)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-white" />
          </button>
          {showMenu && (
            <div
              className="absolute right-0 top-12 w-52 rounded-2xl py-1.5 z-50 overflow-hidden"
              style={{
                background: 'rgba(30, 28, 28, 0.55)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              <button
                onClick={() => { setShowMenu(false); setModal({ type: 'report' }); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.06] transition-colors"
              >
                <Flag className="w-4 h-4 text-white" />
                <span className="text-sm text-white">Signaler</span>
              </button>
              <button
                onClick={() => { setShowMenu(false); setModal({ type: 'block' }); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.06] transition-colors"
              >
                <ShieldBan className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">Bloquer cet utilisateur</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-20 relative z-10 pb-16">
        <div className="flex items-end gap-5 mb-8">
          <div
            className="w-24 h-24 rounded-2xl overflow-hidden shrink-0"
            style={{ border: '3px solid #1D1C1C', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
          >
            <img
              src={enterprise.logo}
              alt={enterprise.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-white">{enterprise.name}</h1>
              {enterprise.verified && (
                <img src={jentrepriseIcon} alt="Verified" className="w-[29px] h-[29px]" />
              )}
            </div>
            <div className="flex items-center gap-2.5 mt-3 lg:hidden">
              <button
                onClick={() => navigate(`/messagerie?dm=${enterprise.id}`)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:brightness-110 active:scale-[0.96]"
                style={{ background: '#fff', color: '#000' }}
              >
                <MessageCircle className="w-4 h-4" />
                Message
              </button>
              <button
                onClick={handleBellClick}
                className="relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 active:scale-[0.85]"
                style={{
                  background: bellActive ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.06)',
                  border: bellActive ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Bell
                  className="w-[16px] h-[16px] transition-all duration-300"
                  style={{
                    color: bellActive ? '#fff' : 'rgba(255,255,255,0.5)',
                    animation: bellAnimating ? 'bellRing 0.7s ease-in-out' : 'none',
                  }}
                  fill={bellActive ? '#fff' : 'none'}
                />
                {bellAnimating && (
                  <span
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{ animation: 'bellPulse 0.6s ease-out forwards', border: '2px solid rgba(255,255,255,0.4)' }}
                  />
                )}
              </button>
            </div>
          </div>
        </div>

        <p className="text-sm text-white leading-relaxed max-w-2xl mb-3">
          {enterprise.description}
        </p>
        <a
          href={`https://${enterprise.website}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors mb-8"
        >
          <Globe className="w-3.5 h-3.5" />
          {enterprise.website}
        </a>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">{enterpriseCampaigns.length}</span>
              <span className="text-sm text-white/40">campagnes</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">{enterprise.stats.totalCreators}</span>
              <span className="text-sm text-white/40">createurs</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2.5">
            <button
              onClick={handleBellClick}
              className="relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 active:scale-[0.85]"
              style={{
                background: bellActive ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.06)',
                border: bellActive ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Bell
                className="w-[16px] h-[16px] transition-all duration-300"
                style={{
                  color: bellActive ? '#fff' : 'rgba(255,255,255,0.5)',
                  animation: bellAnimating ? 'bellRing 0.7s ease-in-out' : 'none',
                }}
                fill={bellActive ? '#fff' : 'none'}
              />
              {bellAnimating && (
                <span
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ animation: 'bellPulse 0.6s ease-out forwards', border: '2px solid rgba(255,255,255,0.4)' }}
                />
              )}
            </button>
            <button
              onClick={() => navigate(`/messagerie?dm=${enterprise.id}`)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:brightness-110 active:scale-[0.96]"
              style={{ background: '#fff', color: '#000' }}
            >
              <MessageCircle className="w-4 h-4" />
              Message
            </button>
          <div className="relative" ref={desktopMenuRef}>
            <button
              onClick={() => setShowMenu((p) => !p)}
              className="flex items-center justify-center w-10 h-10 rounded-full transition-colors"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <MoreVertical className="w-5 h-5 text-white" />
            </button>
            {showMenu && (
              <div
                className="absolute right-0 top-12 w-52 rounded-2xl py-1.5 z-50 overflow-hidden"
                style={{
                  background: 'rgba(30, 28, 28, 0.55)',
                  backdropFilter: 'blur(28px)',
                  WebkitBackdropFilter: 'blur(28px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
                }}
              >
                <button
                  onClick={() => { setShowMenu(false); setModal({ type: 'report' }); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.06] transition-colors"
                >
                  <Flag className="w-4 h-4 text-white" />
                  <span className="text-sm text-white">Signaler</span>
                </button>
                <button
                  onClick={() => { setShowMenu(false); setModal({ type: 'block' }); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.06] transition-colors"
                >
                  <ShieldBan className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400">Bloquer cet utilisateur</span>
                </button>
              </div>
            )}
          </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-8">
          {enterprise.categories.map((cat) => (
            <span
              key={cat}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            >
              {cat}
            </span>
          ))}
          <div className="flex items-center gap-2 sm:ml-auto">
            {Object.entries(enterprise.socials).map(([platform, handle]) => (
              <div
                key={platform}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {platformIcons[platform] && <img src={platformIcons[platform]} alt={platform} className="w-4 h-4 social-icon" />}
                <span className="text-xs text-white font-medium">{handle}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-5">Campagnes actives</h2>
          {enterpriseCampaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Megaphone className="w-10 h-10 text-white/10 mb-3" />
              <p className="text-sm text-white/30">Aucune campagne active</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {enterpriseCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} data={campaign} />
              ))}
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div
            className="relative w-full max-w-sm mx-4 rounded-2xl p-6"
            style={{
              background: 'rgba(30, 28, 28, 0.75)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <button
              onClick={() => setModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/40" />
            </button>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{
                background: modal.type === 'block' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                border: `1px solid ${modal.type === 'block' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
              }}
            >
              {modal.type === 'block'
                ? <ShieldBan className="w-5 h-5 text-red-400" />
                : <Flag className="w-5 h-5 text-amber-400" />}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {modal.type === 'block' ? `Bloquer ${enterprise.name}` : `Signaler ${enterprise.name}`}
            </h3>
            <p className="text-sm text-white/40 leading-relaxed mb-6">
              {modal.type === 'block'
                ? 'Vous ne verrez plus les campagnes ni le profil de cette entreprise. Cette action peut etre annulee.'
                : 'Nous examinerons votre signalement dans les plus brefs delais. Merci de nous aider a maintenir la qualite de la plateforme.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/60 transition-colors hover:bg-white/[0.06]"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Annuler
              </button>
              <button
                onClick={() => setModal(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
                style={{
                  background: modal.type === 'block' ? '#dc2626' : '#d97706',
                  color: '#fff',
                }}
              >
                {modal.type === 'block' ? 'Bloquer' : 'Signaler'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl transition-all duration-500"
        style={{
          background: 'rgba(30,30,30,0.95)',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(16px)',
          opacity: showBellToast ? 1 : 0,
          transform: showBellToast ? 'translate(-50%, 0)' : 'translate(-50%, 20px)',
          pointerEvents: showBellToast ? 'auto' : 'none',
        }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: bellActive ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.08)',
            border: bellActive ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {bellActive ? (
            <Check className="w-4 h-4" style={{ color: '#22c55e' }} />
          ) : (
            <Bell className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">
            {bellActive ? 'Notifications activees' : 'Notifications desactivees'}
          </p>
          <p className="text-[11px] text-white/40">
            {bellActive
              ? `Vous serez notifie des nouveautes de ${enterprise?.name}`
              : `Vous ne recevrez plus de notifications de ${enterprise?.name}`}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bellRing {
          0% { transform: rotate(0deg); }
          15% { transform: rotate(14deg); }
          30% { transform: rotate(-12deg); }
          45% { transform: rotate(10deg); }
          60% { transform: rotate(-8deg); }
          75% { transform: rotate(4deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes bellPulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

