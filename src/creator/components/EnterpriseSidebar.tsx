import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Megaphone, Users, CheckSquare, MessageCircle,
  Settings, Bell, X, User, ChevronRight, Search, BookMarked,
  ShieldCheck, ArrowLeft, CheckCircle, AlertTriangle
} from 'lucide-react';
import { useProfile } from '@/shared/lib/useProfile';
import jentrepriseIcon from '@/shared/assets/badge-enterprise-verified.png';
import barChartIcon from '@/shared/assets/bar-chart.svg';

interface Notification {
  id: string;
  type: 'published' | 'approved' | 'rejected' | 'creator_joined' | 'milestone';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  { id: 'n1', type: 'published', title: 'Campagne publiée', message: 'Votre campagne "iPhone 17 Launch" a été publiée avec succès.', time: 'Il y a 2 minutes', read: false },
  { id: 'n2', type: 'creator_joined', title: 'Nouveau créateur', message: '@maxcreates a rejoint votre campagne "Nike Run Club".', time: 'Il y a 15 minutes', read: false },
  { id: 'n3', type: 'approved', title: 'Vidéo approuvée', message: 'La vidéo de @sarahvibes pour "Samsung Galaxy S25 Ultra" a été approuvée.', time: 'Il y a 1 heure', read: false },
  { id: 'n4', type: 'milestone', title: 'Objectif atteint', message: '"Red Bull Extreme Clips" a dépassé les 10M de vues !', time: 'Il y a 3 heures', read: true },
  { id: 'n5', type: 'rejected', title: 'Vidéo refusée', message: 'La vidéo de @techwithleo pour "Bose QuietComfort" ne respecte pas les règles.', time: 'Il y a 5 heures', read: true },
];

const notifTypeConfig: Record<Notification['type'], React.ReactNode> = {
  published: <Megaphone className="w-4 h-4 text-white" />,
  approved: <CheckCircle className="w-4 h-4 text-white" />,
  rejected: <AlertTriangle className="w-4 h-4 text-white" />,
  creator_joined: <Users className="w-4 h-4 text-white" />,
  milestone: <Bell className="w-4 h-4 text-white" />,
};

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.055)',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  border: '1px solid rgba(255,255,255,0.18)',
  boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.13), inset 0 -1px 0 rgba(0,0,0,0.5)',
};

type EnterprisePage =
  | 'dashboard'
  | 'mes-campagnes'
  | 'recherche-createurs'
  | 'validation-videos'
  | 'messagerie'
  | 'profil'
  | 'mon-compte'
  | 'parametres'
  | 'certification';

interface EnterpriseSidebarProps {
  activePage?: EnterprisePage;
}

export default function EnterpriseSidebar({ activePage }: EnterpriseSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useProfile();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentPath = location.pathname.replace('/app-entreprise', '') || '/dashboard';

  const isActive = (page: EnterprisePage) => {
    if (activePage) return activePage === page;
    const map: Record<EnterprisePage, string> = {
      dashboard: '/dashboard',
      'mes-campagnes': '/mes-campagnes',
      'recherche-createurs': '/recherche-createurs',
      'validation-videos': '/validation-videos',
      messagerie: '/messagerie',
      profil: '/profil',
      'mon-compte': '/mon-compte',
      parametres: '/parametres',
      certification: '/certification',
    };
    return currentPath === map[page] || currentPath.startsWith(map[page] + '/');
  };

  const go = (path: string) => navigate(`/app-entreprise${path}`);

  const navBtn = (page: EnterprisePage, path: string, icon: React.ReactNode, label: string) => {
    const active = isActive(page);
    return (
      <button
        onClick={() => go(path)}
        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-150 text-white flex items-center gap-3 group ${active ? 'bg-white/[0.09] font-medium' : 'hover:bg-white/[0.06]'}`}
      >
        <span className={`transition-colors ${active ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
          {icon}
        </span>
        <span className={`text-sm ${active ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>{label}</span>
        {active && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#A15EFF' }} />
        )}
      </button>
    );
  };

  return (
    <>
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
            {notifications.length > 0 && (
              <button
                onClick={markAllRead}
                className="text-sm font-bold text-white/50 hover:text-white/80 transition-colors px-3 py-1.5 rounded-xl hover:bg-white/[0.06]"
              >
                Tout lire
              </button>
            )}
            <button
              onClick={() => setNotifOpen(false)}
              className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:scale-105"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
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
                      className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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

      <aside
        className="hidden lg:flex w-72 shrink-0 sticky top-0 h-screen flex-col relative"
        style={{ background: 'transparent', borderRight: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div
          className="flex-1 flex flex-col p-5 overflow-y-auto"
          style={{ filter: profileMenuOpen ? 'blur(6px) brightness(0.5)' : 'none', transition: 'filter 0.2s' }}
        >
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between mb-2">
              <div
                className="flex items-center gap-2.5 cursor-pointer"
                onClick={() => setProfileMenuOpen((v) => !v)}
              >
                <div
                  className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center"
                  style={!profile?.avatar_url ? { background: 'linear-gradient(135deg, #A15EFF, #7C3AED)' } : undefined}
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-white">@{profile?.username || 'username'}</span>
                    <img src={jentrepriseIcon} alt="Certified" className="w-[20px] h-[20px]" />
                  </div>
                  <span className="text-[10px] text-white/30 font-medium uppercase tracking-wider">Entreprise</span>
                </div>
              </div>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
                style={{
                  background: notifOpen ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.18)',
                }}
              >
                <Bell className="w-4 h-4 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2" style={{ borderColor: 'rgba(0,0,0,0.4)' }} />
                )}
              </button>
            </div>

            <div className="rounded-xl p-3" style={glassCard}>
              <p className="text-[9px] font-bold text-white/25 uppercase tracking-widest px-4 pb-1.5">Principal</p>
              <nav className="space-y-0.5">
                {navBtn('dashboard', '/dashboard', <img src={barChartIcon} alt="" className="w-5 h-5" />, 'Dashboard')}
                {navBtn('mes-campagnes', '/mes-campagnes', <Megaphone className="w-5 h-5" />, 'Mes campagnes')}
                {navBtn('recherche-createurs', '/recherche-createurs', <Users className="w-5 h-5" />, 'Recherche créateurs')}
                {navBtn('validation-videos', '/validation-videos', <CheckSquare className="w-5 h-5" />, 'Validation vidéos')}
                {navBtn('messagerie', '/messagerie', <MessageCircle className="w-5 h-5" />, 'Messagerie')}
              </nav>
            </div>

            <div className="rounded-xl p-3" style={glassCard}>
              <p className="text-[9px] font-bold text-white/25 uppercase tracking-widest px-4 pb-1.5">Compte</p>
              <nav className="space-y-0.5">
                {navBtn('profil', '/profil', <User className="w-5 h-5" />, 'Mon profil')}
                {navBtn('mon-compte', '/mon-compte', <Settings className="w-5 h-5" />, 'Mon compte')}
                {navBtn('parametres', '/parametres', <Settings className="w-5 h-5" />, 'Paramètres')}
                {navBtn('certification', '/certification', <ShieldCheck className="w-5 h-5" />, 'Certification')}
              </nav>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <button
              onClick={() => go('/mes-campagnes')}
              className="group relative flex items-center justify-center py-2.5 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden w-full"
              style={{ background: '#A15EFF' }}
            >
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <span className="font-bold text-sm relative z-10 text-white">Créer une campagne</span>
            </button>
            <button
              onClick={() => navigate('/home')}
              className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl w-full text-white/40 hover:text-white/70 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Mode créateur
            </button>
          </div>
        </div>

        {profileMenuOpen && (
          <>
            <div className="absolute inset-0 z-[99]" onClick={() => setProfileMenuOpen(false)} />
            <div
              ref={profileMenuRef}
              className="absolute left-5 top-[68px] z-[100] rounded-2xl overflow-hidden"
              style={{
                width: 'calc(100% - 40px)',
                background: 'rgba(18,16,16,0.7)',
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
              <button
                onClick={() => { setProfileMenuOpen(false); navigate('/home'); }}
                className="w-full flex items-center gap-3 px-5 py-4 text-sm font-semibold text-white/85 hover:text-white transition-all duration-200"
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <ArrowLeft className="w-[18px] h-[18px] text-white/50" />
                Passer en mode créateur
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
