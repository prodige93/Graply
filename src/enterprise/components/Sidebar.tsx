import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, MessageCircle, User, Search, Settings, Home, Bookmark, X, Megaphone, AlertTriangle, Users, CheckCircle, Plus } from 'lucide-react';
import { useProfile } from '@/shared/lib/useProfile';
import SearchOverlay from './SearchOverlay';
import jentrepriseIcon from '@/shared/assets/badge-enterprise-verified.png';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';
import globeIcon from '@/shared/assets/globe.svg';
import hourglassIcon from '@/shared/assets/hourglass-filled.svg';
import barChartIcon from '@/shared/assets/bar-chart.svg';

interface Notification {
  id: string;
  type: 'campaign' | 'creator' | 'review' | 'alert';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  { id: '1', type: 'campaign', title: 'Campagne validée', message: 'Votre campagne "Summer Vibes" a été approuvée.', time: 'il y a 5min', read: false },
  { id: '2', type: 'creator', title: 'Nouveau créateur', message: 'InfluencerX a rejoint votre campagne.', time: 'il y a 20min', read: false },
  { id: '3', type: 'review', title: 'Avis reçu', message: 'Vous avez reçu un nouvel avis 5 étoiles.', time: 'il y a 1h', read: false },
  { id: '4', type: 'alert', title: 'Budget presque atteint', message: 'Il reste moins de 10% du budget sur "Tech Launch".', time: 'il y a 3h', read: true },
  { id: '5', type: 'campaign', title: 'Vidéo soumise', message: 'Une vidéo a été soumise pour validation sur "Beauty x2".', time: 'il y a 5h', read: true },
];

const notifTypeConfig: Record<Notification['type'], React.ReactNode> = {
  campaign: <Megaphone className="w-5 h-5 text-white" />,
  creator: <Users className="w-5 h-5 text-white" />,
  review: <CheckCircle className="w-5 h-5 text-white" />,
  alert: <AlertTriangle className="w-5 h-5 text-white" />,
};

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.055)',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  border: '1px solid rgba(255,255,255,0.18)',
  boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.13), inset 0 -1px 0 rgba(0,0,0,0.5)',
};

type ActivePage = 'home' | 'mes-campagnes' | 'validation-videos' | 'dashboard' | 'messagerie' | 'mon-compte' | 'parametres' | 'enregistre';

interface SidebarProps {
  activePage?: ActivePage;
}

export default function Sidebar({ activePage }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const go = (path: string) => navigate(`/app-entreprise${path}`);

  const handleCreatorMode = () => {
    const match = location.pathname.match(/^\/app-entreprise\/campagne\/(.+)$/);
    if (match) {
      navigate(`/campagne/${match[1]}`);
    } else {
      navigate('/home');
    }
  };
  const { profile } = useProfile();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNetwork, setActiveNetwork] = useState(0);
  const [fade, setFade] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

  const networks = [
    { icon: instagramIcon, alt: 'Instagram', value: '2,356,093', label: 'vues' },
    { icon: tiktokIcon, alt: 'TikTok', value: '5,842,710', label: 'vues' },
    { icon: youtubeIcon, alt: 'YouTube', value: '1,203,487', label: 'vues' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setActiveNetwork(prev => (prev + 1) % networks.length);
        setFade(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navBtn = (page: ActivePage, path: string, icon: React.ReactNode, label: string) => {
    const isActive = activePage === page;
    return (
      <button
        onClick={() => go(path)}
        className={`w-full text-left px-4 py-3.5 rounded-lg transition-colors text-white flex items-center gap-3 ${isActive ? 'bg-white/[0.08] font-medium' : 'hover:bg-white/[0.08]'}`}
      >
        {icon}
        {label}
      </button>
    );
  };

  const accountBtn = (page: ActivePage, path: string, icon: React.ReactNode, label: string) => {
    const isActive = activePage === page;
    return (
      <button
        onClick={() => go(path)}
        className={`w-full text-left px-4 py-3 rounded-lg transition-colors text-white flex items-center gap-3 ${isActive ? 'bg-white/[0.08] font-medium' : 'hover:bg-white/[0.06]'}`}
      >
        {icon}
        {label}
      </button>
    );
  };

  return (
    <>
      {searchOpen && (
        <SearchOverlay
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onClose={() => { setSearchOpen(false); setSearchQuery(''); }}
        />
      )}

      {notifOpen && (
        <div
          className="hidden lg:flex fixed inset-0 z-[200] flex-col"
          style={{
            background: 'rgba(5,4,4,0.65)',
            backdropFilter: 'blur(60px) saturate(180%)',
            WebkitBackdropFilter: 'blur(60px) saturate(180%)',
            animation: 'fadeInNotifFull 0.22s ease-out',
          }}
        >
          <style>{`@keyframes fadeInNotifFull { from { opacity:0; } to { opacity:1; } }`}</style>

          <div className="flex items-center gap-4 px-10 py-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">Notifications</h2>
              {unreadCount > 0 && (
                <p className="text-sm text-white/35 mt-0.5">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
              )}
            </div>
            {notifications.length > 0 && unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-2 text-sm font-bold text-white/50 hover:text-white/80 transition-colors px-3 py-1.5 rounded-xl hover:bg-white/[0.06]"
              >
                Tout lire
              </button>
            )}
            <button
              onClick={() => setNotifOpen(false)}
              className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:scale-105 active:scale-90"
              style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-10 pt-3">
            <div className="max-w-2xl mx-auto space-y-1">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32">
                  <Bell className="w-10 h-10 text-white/10 mb-4" />
                  <p className="text-base text-white/25">Aucune notification</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="flex items-center gap-4 px-4 py-4 rounded-2xl cursor-pointer group transition-colors"
                    style={{ background: notif.read ? 'transparent' : 'rgba(255,255,255,0.03)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = notif.read ? 'transparent' : 'rgba(255,255,255,0.03)')}
                    onClick={() => markRead(notif.id)}
                  >
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(255,255,255,0.07)' }}
                    >
                      {notifTypeConfig[notif.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold truncate ${notif.read ? 'text-white/60' : 'text-white'}`}>{notif.title}</p>
                        {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-white/35 truncate mt-0.5">{notif.message}</p>
                      <span className="text-[11px] text-white/20 font-medium">{notif.time}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setNotifications((prev) => prev.filter((n) => n.id !== notif.id)); }}
                      className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                    >
                      <X className="w-3.5 h-3.5 text-white/50" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <aside className="hidden lg:flex w-80 shrink-0 sticky top-0 h-screen relative" style={{ background: 'transparent', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <div
          className="flex-1 flex flex-col p-6 overflow-y-auto transition-all duration-300"
          style={{ filter: profileMenuOpen ? 'blur(6px) brightness(0.5)' : 'none' }}
        >
        <div className="space-y-6 flex-1">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  onClick={() => setProfileMenuOpen((v) => !v)}
                  className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-white/20 transition-all"
                  style={!profile?.avatar_url ? { background: 'linear-gradient(135deg, #f97316, #ec4899)' } : undefined}
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <span onClick={() => setProfileMenuOpen((v) => !v)} className="text-sm font-semibold text-white cursor-pointer hover:text-white/80 transition-colors">@{profile?.username || 'username'}</span>
                <img src={jentrepriseIcon} alt="Verified" className="w-[29px] h-[29px]" />
              </div>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: notifOpen ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.10)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
                }}
              >
                <Bell className="w-4 h-4 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2" style={{ borderColor: 'rgba(0,0,0,0.4)' }} />
                )}
              </button>
            </div>

            <div className="rounded-xl p-4" style={glassCard}>
              <nav className="space-y-1.5">
                {navBtn('home', '/', <Home className="w-5 h-5 text-white" />, 'Accueil')}

                {navBtn('mes-campagnes', '/mes-campagnes', <img src={globeIcon} alt="Globe" className="w-5 h-5" />, 'Mes campagnes')}

                {navBtn('validation-videos', '/validation-videos', <img src={hourglassIcon} alt="Validation" className="w-5 h-5" />, 'Validation')}
                {navBtn('dashboard', '/dashboard', <img src={barChartIcon} alt="Dashboard" className="w-5 h-5" />, 'Mon dashboard')}
                <button
                  onClick={() => { setSearchOpen(true); setSearchQuery(''); }}
                  className="w-full text-left px-4 py-3.5 rounded-lg hover:bg-white/[0.08] transition-colors text-white flex items-center gap-3"
                >
                  <Search className="w-5 h-5 text-white" />
                  Rechercher
                </button>
                {navBtn('messagerie', '/messagerie', <MessageCircle className="w-5 h-5 text-white" />, 'Messagerie')}
                {navBtn('enregistre', '/enregistre', <Bookmark className="w-5 h-5 text-white" />, 'Enregistré')}
              </nav>
            </div>

            <div className="rounded-xl p-2 mt-3" style={glassCard}>
              <div
                className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer"
                style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.3s ease' }}
              >
                <div className="flex items-center gap-3">
                  <img src={networks[activeNetwork].icon} alt={networks[activeNetwork].alt} className="w-5 h-5" />
                  <span className="text-white font-semibold">{networks[activeNetwork].value}</span>
                </div>
                <span className="text-white/40 text-sm">{networks[activeNetwork].label}</span>
              </div>
            </div>

            <div className="rounded-xl p-5 mt-3" style={glassCard}>
              <nav className="space-y-3">
                {accountBtn('mon-compte', '/mon-compte', <User className="w-5 h-5 text-white" />, 'Mon compte')}
                {accountBtn('parametres', '/parametres', <Settings className="w-5 h-5 text-white" />, 'Paramètres')}
              </nav>
            </div>
          </div>
        </div>

        <div className="space-y-3 mt-1">
          <button
            onClick={() => go('/creer-campagne')}
            className="group relative flex items-center justify-center py-2.5 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden w-full"
            style={{ background: '#A15EFF' }}
          >
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <span className="flex items-center gap-2 font-bold text-base relative z-10 text-white">
              <Plus className="w-4 h-4" />
              Créer ma campagne
            </span>
          </button>
          <button
            onClick={() => go('/campagnes')}
            className="group relative w-full flex items-center justify-center py-2.5 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.055)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.18)',
            }}
          >
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="font-bold text-base relative z-10 text-white">
              Voir les campagnes
            </span>
          </button>
        </div>
        </div>

        {profileMenuOpen && (
          <>
            <div
              className="absolute inset-0 z-[99]"
              onClick={() => setProfileMenuOpen(false)}
            />
            <div
              ref={profileMenuRef}
              className="absolute left-6 top-[68px] z-[100] rounded-2xl overflow-hidden"
              style={{
                width: 'calc(100% - 48px)',
                background: 'rgba(18, 16, 16, 0.7)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.14)',
                boxShadow: '0 16px 56px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
                animation: 'profileMenuIn 0.2s ease-out',
              }}
            >
              <style>{`@keyframes profileMenuIn { from { opacity:0; transform: translateY(-8px) scale(0.96); } to { opacity:1; transform: translateY(0) scale(1); } }`}</style>
              <button
                onClick={() => { setProfileMenuOpen(false); go('/profil'); }}
                className="w-full flex items-center gap-3 px-5 py-4 text-sm font-semibold text-white/85 hover:text-white transition-all duration-200"
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <User className="w-[18px] h-[18px] text-white/50" />
                Voir mon profil
              </button>
              <div className="h-px mx-4" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-sm font-semibold text-white/85">Postuler à une campagne</span>
                <button
                  onClick={() => { setProfileMenuOpen(false); handleCreatorMode(); }}
                  className="relative shrink-0 transition-all duration-300 active:scale-95"
                  style={{
                    width: '52px',
                    height: '28px',
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <span
                    className="absolute rounded-full transition-all duration-300"
                    style={{
                      width: '22px',
                      height: '22px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.4)',
                      left: '3px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                      transition: 'left 0.3s ease, background 0.3s ease',
                    }}
                  />
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
