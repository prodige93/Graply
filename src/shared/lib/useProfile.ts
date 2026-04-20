import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/shared/infrastructure/supabase';

/** @deprecated Utiliser `profile?.id` depuis `useProfile()` — l’id réel vient de l’utilisateur connecté. */
export const PROFILE_ID = '00000000-0000-0000-0000-000000000001';

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  banner_url: string | null;
  is_public: boolean;
  website: string;
  content_tags: string[];
  content_type: string[];
  messaging_enabled: boolean;
  hidden_stats: string[];
  hidden_campaigns: string[];
  instagram_handle: string;
  tiktok_handle: string;
  youtube_handle: string;
  stripe_account_id: string;
}

let cachedProfile: Profile | null = null;
let cachedUserId: string | null = null;
let fetchPromise: Promise<Profile | null> | null = null;
const listeners = new Set<(p: Profile | null) => void>();

function notifyListeners(p: Profile | null) {
  listeners.forEach((fn) => fn(p));
}

async function loadProfileForUser(userId: string): Promise<Profile | null> {
  let { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (!data) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id === userId) {
      const { error: ensureError } = await supabase.rpc('ensure_my_profile');
      if (ensureError) {
        console.error('ensure_my_profile', ensureError.message);
      }
      const again = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      data = again.data;
    }
  }

  cachedProfile = (data as Profile | null) ?? null;
  cachedUserId = userId;
  return (data as Profile | null) ?? null;
}

async function loadProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    cachedProfile = null;
    cachedUserId = null;
    return null;
  }
  return loadProfileForUser(user.id);
}

let authListenerStarted = false;

function ensureAuthProfileReload() {
  if (authListenerStarted) return;
  authListenerStarted = true;
  supabase.auth.onAuthStateChange(() => {
    fetchPromise = null;
    cachedProfile = null;
    fetchPromise = loadProfile();
    fetchPromise.then((d) => notifyListeners(d));
  });
}

export function prefetchProfile() {
  ensureAuthProfileReload();
  if (!fetchPromise) {
    fetchPromise = loadProfile();
  }
  return fetchPromise;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(cachedProfile);
  const [userId, setUserId] = useState<string | null>(cachedUserId);

  useEffect(() => {
    ensureAuthProfileReload();
    const handler = (p: Profile | null) => setProfile(p);
    listeners.add(handler);

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserId(null);
        setProfile(null);
        return;
      }
      setUserId(user.id);
      if (cachedUserId === user.id && cachedProfile) {
        setProfile(cachedProfile);
        return;
      }
      const p = await loadProfileForUser(user.id);
      setProfile(p);
      notifyListeners(p);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        cachedProfile = null;
        cachedUserId = null;
        fetchPromise = null;
        setUserId(null);
        setProfile(null);
        notifyListeners(null);
        return;
      }
      fetchPromise = null;
      loadProfileForUser(session.user.id).then((p) => {
        setUserId(session.user.id);
        setProfile(p);
        notifyListeners(p);
      });
    });

    return () => {
      listeners.delete(handler);
      sub.subscription.unsubscribe();
    };
  }, []);

  const updateProfile = useCallback((updates: Partial<Profile>) => {
    cachedProfile = cachedProfile ? { ...cachedProfile, ...updates } : null;
    notifyListeners(cachedProfile);
  }, []);

  const refetch = useCallback(async () => {
    fetchPromise = null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      cachedProfile = null;
      cachedUserId = null;
      notifyListeners(null);
      return null;
    }
    const data = await loadProfileForUser(user.id);
    notifyListeners(data);
    return data;
  }, []);

  return { profile, userId, updateProfile, refetch };
}
