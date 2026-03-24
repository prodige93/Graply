import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, CheckCircle, Megaphone, AlertTriangle, Users, Clock, X, Trash2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';

interface Notification {
  id: string;
  type: 'published' | 'approved' | 'rejected' | 'creator_joined' | 'milestone';
  title: string;
  message: string;
  campaignName?: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: 'c1',
    type: 'approved',
    title: 'Vidéo approuvée',
    message: 'Votre vidéo pour la campagne "Bose QuietComfort" a été approuvée. Vos gains ont été crédités.',
    campaignName: 'Bose QuietComfort',
    time: 'Il y a 5 minutes',
    read: false,
  },
  {
    id: 'c2',
    type: 'milestone',
    title: 'Nouveau paiement',
    message: 'Vous avez reçu 24,50€ pour vos vues sur la campagne "Red Bull Extreme Clips".',
    campaignName: 'Red Bull Extreme Clips',
    time: 'Il y a 30 minutes',
    read: false,
  },
  {
    id: 'c3',
    type: 'published',
    title: 'Nouvelle campagne disponible',
    message: '"iPhone 17 Launch" correspond à votre profil. Postulez avant le 30 mars pour ne pas manquer cette opportunité.',
    campaignName: 'iPhone 17 Launch',
    time: 'Il y a 2 heures',
    read: false,
  },
  {
    id: 'c4',
    type: 'rejected',
    title: 'Vidéo refusée',
    message: 'Votre vidéo pour "Fanta Summer UGC Challenge" a été refusée. La musique de fond n\'était pas autorisée.',
    campaignName: 'Fanta Summer UGC',
    time: 'Il y a 4 heures',
    read: true,
  },
  {
    id: 'c5',
    type: 'approved',
    title: 'Candidature acceptée',
    message: 'Votre candidature pour la campagne "WHOOP Athlete Clipping" a été acceptée. Vous pouvez maintenant soumettre votre vidéo.',
    campaignName: 'WHOOP Athlete Clipping',
    time: 'Il y a 1 jour',
    read: true,
  },
  {
    id: 'c6',
    type: 'milestone',
    title: 'Objectif de vues atteint',
    message: 'Félicitations ! Votre vidéo pour "Stake.com Clipping" a dépassé les 100K vues.',
    campaignName: 'Stake.com Clipping',
    time: 'Il y a 2 jours',
    read: true,
  },
  {
    id: 'c7',
    type: 'published',
    title: 'Rappel de campagne',
    message: 'La campagne "Samsung Galaxy S25 Ultra" se termine dans 3 jours. Soumettez votre vidéo rapidement.',
    campaignName: 'Samsung Galaxy S25 Ultra',
    time: 'Il y a 3 jours',
    read: true,
  },
];

const typeConfig: Record<Notification['type'], { Icon: React.ElementType }> = {
  published: { Icon: Megaphone },
  approved: { Icon: CheckCircle },
  rejected: { Icon: AlertTriangle },
  creator_joined: { Icon: Users },
  milestone: { Icon: Bell },
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [showClearBtn, setShowClearBtn] = useState(false);
  const clearBtnRef = useRef<HTMLButtonElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!showClearBtn) return;
    function handleClickOutside(e: MouseEvent) {
      if (clearBtnRef.current && !clearBtnRef.current.contains(e.target as Node)) {
        setShowClearBtn(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showClearBtn]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="h-screen text-white flex overflow-hidden" style={{ backgroundColor: '#050404' }}>
      <Sidebar
        activePage="home"
        onOpenSearch={() => {}}
      />
      <div className="flex-1 overflow-y-auto pb-24 lg:pb-10">
      <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-white/10 shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl lg:text-2xl font-bold text-white">Notifications</h1>
            <p className="text-sm text-white/40 mt-0.5">
              {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est a jour'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {notifications.length > 0 && (
              <>
                {showClearBtn ? (
                  <button
                    ref={clearBtnRef}
                    onClick={() => {
                      setNotifications([]);
                      setShowClearBtn(false);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 hover:scale-[1.03] active:scale-95"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: 'rgba(255,255,255,0.6)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Effacer
                  </button>
                ) : (
                  <button
                    onClick={() => setShowClearBtn(true)}
                    className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
                    }}
                  >
                    <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.6)' }} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-200"
            style={{
              background: filter === 'all' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
              border: filter === 'all' ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.06)',
              color: filter === 'all' ? '#fff' : 'rgba(255,255,255,0.4)',
            }}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilter('unread')}
            className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-200 flex items-center gap-2"
            style={{
              background: filter === 'unread' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
              border: filter === 'unread' ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.06)',
              color: filter === 'unread' ? '#fff' : 'rgba(255,255,255,0.4)',
            }}
          >
            Non lues
            {unreadCount > 0 && (
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ backgroundColor: '#FF4B4B', color: '#fff' }}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Bell className="w-10 h-10 text-white/10 mb-3" />
              <p className="text-sm text-white/30 font-medium">Aucune notification</p>
              <p className="text-xs text-white/15 mt-1">
                {filter === 'unread' ? 'Toutes vos notifications sont lues' : 'Vous n\'avez pas encore de notifications'}
              </p>
            </div>
          ) : (
            filtered.map((notif) => {
              const { Icon } = typeConfig[notif.type];
              return (
                <button
                  key={notif.id}
                  onClick={() => markRead(notif.id)}
                  className="w-full text-left rounded-2xl p-4 transition-all duration-200 group hover:scale-[1.005]"
                  style={{
                    background: notif.read
                      ? 'rgba(30,28,28,0.45)'
                      : 'rgba(40,38,38,0.6)',
                    border: `1px solid ${notif.read ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.14)'}`,
                    backdropFilter: 'blur(28px)',
                    WebkitBackdropFilter: 'blur(28px)',
                    boxShadow: notif.read
                      ? '0 2px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
                      : '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="flex gap-3.5">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        background: 'rgba(255,255,255,0.07)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                      }}
                    >
                      <Icon className="notif-icon text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{notif.title}</p>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-white/45 mt-1 leading-relaxed">{notif.message}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Clock className="w-3 h-3 text-white/20" />
                        <span className="text-[11px] text-white/25 font-medium">{notif.time}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
