import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

type ActivePage = 'home' | 'mes-campagnes' | 'validation-videos' | 'dashboard' | 'messagerie' | 'mon-compte' | 'parametres' | 'enregistre';

function getActivePage(pathname: string): ActivePage | undefined {
  if (pathname === '/app-entreprise' || pathname === '/app-entreprise/') return 'home';
  if (pathname.startsWith('/app-entreprise/mes-campagnes') || pathname.startsWith('/app-entreprise/ma-campagne')) return 'mes-campagnes';
  if (pathname.startsWith('/app-entreprise/validation-videos')) return 'validation-videos';
  if (pathname.startsWith('/app-entreprise/dashboard')) return 'dashboard';
  if (pathname.startsWith('/app-entreprise/messagerie')) return 'messagerie';
  if (pathname.startsWith('/app-entreprise/mon-compte')) return 'mon-compte';
  if (pathname.startsWith('/app-entreprise/parametres')) return 'parametres';
  if (pathname.startsWith('/app-entreprise/enregistre')) return 'enregistre';
  return undefined;
}

export default function AppLayout() {
  const location = useLocation();
  const activePage = getActivePage(location.pathname);

  return (
    <div className="min-h-screen text-white flex" style={{ background: '#050404' }}>
      <Sidebar activePage={activePage} />
      <div className="flex-1 min-h-screen overflow-x-hidden flex flex-col relative" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 4rem)' }}>
        <Outlet />
      </div>
      <MobileNav />
    </div>
  );
}
