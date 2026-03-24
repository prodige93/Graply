import { useState } from 'react';
import { useEnterpriseNavigate } from '@/enterprise/lib/useEnterpriseNavigate';
import { ArrowLeft, Bell, CheckCircle, Megaphone, AlertTriangle, Users, Clock, X, Trash2 } from 'lucide-react';

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
    id: 'n1',
    type: 'published',
    title: 'Campagne publiee',
    message: 'Votre campagne "iPhone 17 Launch" a ete publiee avec succes et est maintenant visible par les createurs.',
    campaignName: 'iPhone 17 Launch',
    time: 'Il y a 2 minutes',
    read: false,
  },
  {
    id: 'n2',
    type: 'creator_joined',
    title: 'Nouveau créateur',
    message: '@maxcreates a rejoint votre campagne "Nike Run Club" et a soumis une vidéo pour vérification.',
    campaignName: 'Nike Run Club',
    time: 'Il y a 15 minutes',
    read: false,
  },
  {
    id: 'n3',
    type: 'approved',
    title: 'Vidéo approuvée',
    message: 'La vidéo de @sarahvibes pour "Samsung Galaxy S25 Ultra" a été automatiquement approuvée.',
    campaignName: 'Samsung Galaxy S25 Ultra',
    time: 'Il y a 1 heure',
    read: false,
  },
  {
    id: 'n4',
    type: 'milestone',
    title: 'Objectif atteint',
    message: 'Votre campagne "Red Bull Extreme Clips" a depasse les 10M de vues ! Felicitations.',
    campaignName: 'Red Bull Extreme Clips',
    time: 'Il y a 3 heures',
    read: true,
  },
  {
    id: 'n5',
    type: 'rejected',
    title: 'Vidéo refusée',
    message: 'La vidéo de @techwithleo pour "Bose QuietComfort" ne respecte pas les règles. Le créateur a été notifié.',
    campaignName: 'Bose QuietComfort',
    time: 'Il y a 5 heures',
    read: true,
  },
  {
    id: 'n6',
    type: 'published',
    title: 'Campagne publiee',
    message: 'Votre campagne "WHOOP Athlete Clipping" est maintenant en ligne.',
    campaignName: 'WHOOP Athlete Clipping',
    time: 'Il y a 1 jour',
    read: true,
  },
  {
    id: 'n7',
    type: 'creator_joined',
    title: 'Nouveaux createurs',
    message: '12 nouveaux createurs ont rejoint "Fanta Summer UGC Challenge" cette semaine.',
    campaignName: 'Fanta Summer UGC',
    time: 'Il y a 2 jours',
    read: true,
  },
  {
    id: 'n8',
    type: 'milestone',
    title: 'Budget a 50%',
    message: 'Le budget de "Stake.com Official Clipping" est utilise a 81%. Pensez a le recharger si necessaire.',
    campaignName: 'Stake.com Clipping',
    time: 'Il y a 3 jours',
    read: true,
  },
];

const typeConfig: Record<Notification['type'], { icon: React.ReactNode }> = {
  published: {
    icon: <Megaphone className="w-4 h-4 text-white" />,
  },
  approved: {
    icon: <CheckCircle className="w-4 h-4 text-white" />,
  },
  rejected: {
    icon: <AlertTriangle className="w-4 h-4 text-white" />,
  },
  creator_joined: {
    icon: <Users className="w-4 h-4 text-white" />,
  },
  milestone: {
    icon: <Bell className="w-4 h-4 text-white" />,
  },
};

export default function NotificationsPage() {
  const navigate = useEnterpriseNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="text-white" style={{ backgroundColor: '#050404' }}>
      <div className="max-w-3xl mx-auto">
        <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-6 flex items-center gap-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex-1">
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-sm text-white/35 mt-0.5">
              {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est a jour'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-semibold transition-colors hover:text-white"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                Tout lire
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={() => setNotifications([])}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
              >
                <X className="w-4 h-4 text-white/50" />
              </button>
            )}
          </div>
        </div>
        <div className="px-4 sm:px-6 lg:px-8 pt-6">

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
              const config = typeConfig[notif.type];
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
                      {config.icon}
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
                    <button
                      onClick={(e) => deleteNotification(notif.id, e)}
                      className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/10"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white/50" />
                    </button>
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
