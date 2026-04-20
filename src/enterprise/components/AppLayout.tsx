import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { supabase } from '@/shared/infrastructure/supabase';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import GrapeLoader from './GrapeLoader';
import EnterpriseRegistrationModal from './EnterpriseRegistrationModal';

type ActivePage = 'home' | 'mes-campagnes' | 'validation-videos' | 'dashboard' | 'messagerie' | 'mon-compte' | 'parametres' | 'enregistre';

function getActivePage(pathname: string): ActivePage | undefined {
  if (pathname === '/app-entreprise' || pathname === '/app-entreprise/') return 'home';
  if (pathname.startsWith('/app-entreprise/mes-campagnes') || pathname.startsWith('/app-entreprise/ma-campagne')) return 'mes-campagnes';
  if (pathname.startsWith('/app-entreprise/validation-videos')) return 'validation-videos';
  if (pathname.startsWith('/app-entreprise/dashboard')) return 'dashboard';
  if (pathname.startsWith('/app-entreprise/messagerie')) return 'messagerie';
  if (pathname.startsWith('/app-entreprise/mon-compte')) return 'mon-compte';
  if (
    pathname.startsWith('/app-entreprise/parametres') ||
    pathname.startsWith('/app-entreprise/privacy-policy') ||
    pathname.startsWith('/app-entreprise/terms-of-service') ||
    pathname.startsWith('/app-entreprise/stripe-data') ||
    pathname.startsWith('/app-entreprise/tiktok-data') ||
    pathname.startsWith('/app-entreprise/instagram-data') ||
    pathname.startsWith('/app-entreprise/youtube-data')
  ) {
    return 'parametres';
  }
  if (pathname.startsWith('/app-entreprise/enregistre')) return 'enregistre';
  return undefined;
}

export default function AppLayout() {
  const location = useLocation();
  const activePage = getActivePage(location.pathname);
  const [showRegistration, setShowRegistration] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    async function checkRegistration() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase
        .from('profiles')
        .select('company_registration_completed, role')
        .eq('id', user.id)
        .maybeSingle();
      if (data?.role === 'enterprise' && !data?.company_registration_completed) {
        setShowRegistration(true);
      }
    }
    checkRegistration();
  }, []);

  return (
    <div className="min-h-screen text-white flex" style={{ background: '#050404' }}>
      <Sidebar activePage={activePage} />
      <div className="flex-1 min-h-screen overflow-x-hidden flex flex-col relative" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 4rem)' }}>
        <Suspense
          fallback={(
            <div className="flex-1 flex items-center justify-center py-20 min-h-[40vh]">
              <GrapeLoader size="md" />
            </div>
          )}
        >
          <Outlet />
        </Suspense>
      </div>
      <MobileNav />
      {userId && (
        <EnterpriseRegistrationModal
          open={showRegistration}
          onClose={() => setShowRegistration(false)}
          onSuccess={() => setShowRegistration(false)}
          userId={userId}
        />
      )}
    </div>
  );
}
