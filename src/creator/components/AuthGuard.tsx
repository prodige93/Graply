import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '@/shared/infrastructure/supabase';
import AppShellFallback from '@/shared/components/AppShellFallback';

export default function AuthGuard() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthenticated(!!data.session);
      setChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (checking) return <AppShellFallback />;
  if (!authenticated) return <Navigate to="/connexion" replace />;
  return <Outlet />;
}
