import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '@/shared/infrastructure/supabase';

interface SavedCampaignsContextValue {
  savedIds: string[];
  toggle: (id: string) => void;
  isSaved: (id: string) => boolean;
}

const SavedCampaignsContext = createContext<SavedCampaignsContextValue | null>(null);

export function SavedCampaignsProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id ?? null;
      setUserId(uid);
      if (uid) loadSaved(uid);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
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
      .select('enterprise_saved_campaign_ids')
      .eq('id', uid)
      .maybeSingle();
    if (data?.enterprise_saved_campaign_ids) {
      setSavedIds(data.enterprise_saved_campaign_ids);
    }
  }

  async function persistSaved(newIds: string[]) {
    if (!userId) return;
    await supabase
      .from('profiles')
      .update({ enterprise_saved_campaign_ids: newIds })
      .eq('id', userId);
  }

  const toggle = (id: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      persistSaved(next);
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
