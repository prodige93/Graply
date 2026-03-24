import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Megaphone, Users, CheckSquare, MessageCircle } from 'lucide-react';
import barChartIcon from '@/shared/assets/bar-chart.svg';

export default function EnterpriseMobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname.replace('/app-entreprise', '') || '/dashboard';

  const items = [
    { path: '/dashboard', icon: <img src={barChartIcon} alt="" className="w-5 h-5" />, label: 'Dashboard' },
    { path: '/mes-campagnes', icon: <Megaphone className="w-5 h-5" />, label: 'Campagnes' },
    { path: '/recherche-createurs', icon: <Users className="w-5 h-5" />, label: 'Créateurs' },
    { path: '/validation-videos', icon: <CheckSquare className="w-5 h-5" />, label: 'Validation' },
    { path: '/messagerie', icon: <MessageCircle className="w-5 h-5" />, label: 'Messages' },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2"
      style={{
        background: 'rgba(10,10,12,0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {items.map((item) => {
        const active = currentPath === item.path || currentPath.startsWith(item.path + '/');
        return (
          <button
            key={item.path}
            onClick={() => navigate(`/app-entreprise${item.path}`)}
            className="flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all duration-200"
            style={{ minWidth: '56px' }}
          >
            <span
              className="transition-all duration-200"
              style={{
                color: active ? '#A15EFF' : 'rgba(255,255,255,0.35)',
                filter: active ? 'drop-shadow(0 0 6px rgba(161,94,255,0.5))' : 'none',
              }}
            >
              {item.icon}
            </span>
            <span
              className="text-[9px] font-semibold uppercase tracking-wider transition-colors"
              style={{ color: active ? '#A15EFF' : 'rgba(255,255,255,0.25)' }}
            >
              {item.label}
            </span>
            {active && (
              <span
                className="absolute bottom-1 w-1 h-1 rounded-full"
                style={{ background: '#A15EFF' }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
