import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { supabase } from '@/shared/infrastructure/supabase';

interface SavedCampaignsContextType {
  savedIds: string[];
  toggle: (id: string) => void;
  isSaved: (id: string) => boolean;
}

const SavedCampaignsContext = createContext<SavedCampaignsContextType | null>(null);

export function SavedCampaignsProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id ?? null;
      userIdRef.current = uid;
      if (uid) loadSaved(uid);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      userIdRef.current = uid;
      if (uid) {
        loadSaved(uid);
      } else {
        setSavedIds([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadSaved(uid: string) {
    const { data } = await supabase
      .from('profiles')
      .select('saved_campaign_ids')
      .eq('id', uid)
      .maybeSingle();
    if (data?.saved_campaign_ids) {
      setSavedIds(data.saved_campaign_ids);
    }
  }

  async function persistSaved(uid: string, newIds: string[]) {
    await supabase
      .from('profiles')
      .update({ saved_campaign_ids: newIds })
      .eq('id', uid);
  }

  const toggle = (id: string) => {
    const uid = userIdRef.current;
    if (!uid) return;
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id];
      persistSaved(uid, next);
      return next;
    });
  };

  const isSaved = (id: string) => savedIds.includes(id);

  return (
    <SavedCampaignsContext.Provider value={{ savedIds, toggle, isSaved }}>
      {children}
    </SavedCampaignsContext.Provider>
  );
}

export function useSavedCampaigns() {
  const ctx = useContext(SavedCampaignsContext);
  if (!ctx) throw new Error('useSavedCampaigns must be used within SavedCampaignsProvider');
  return ctx;
}
