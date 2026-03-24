import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '@/shared/infrastructure/supabase';
import { mapSupabaseCampaign } from '@/shared/lib/mapSupabaseCampaign';
import type { CampaignData } from '@/creator/components/CampaignCard';

interface MyCampaignsContextValue {
  activeCampaigns: CampaignData[];
  pausedCampaigns: CampaignData[];
  loading: boolean;
  refresh: () => void;
}

const MyCampaignsContext = createContext<MyCampaignsContextValue | null>(null);

export function MyCampaignsProvider({ children }: { children: ReactNode }) {
  const [activeCampaigns, setActiveCampaigns] = useState<CampaignData[]>([]);
  const [pausedCampaigns, setPausedCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    const [pubResult, pausedResult] = await Promise.all([
      supabase.from('campaigns').select('*, profiles(username, display_name, avatar_url)').eq('status', 'published').order('created_at', { ascending: false }),
      supabase.from('campaigns').select('*, profiles(username, display_name, avatar_url)').eq('status', 'paused').order('created_at', { ascending: false }),
    ]);
    setActiveCampaigns((pubResult.data ?? []).map(mapSupabaseCampaign));
    setPausedCampaigns((pausedResult.data ?? []).map(mapSupabaseCampaign));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return (
    <MyCampaignsContext.Provider value={{ activeCampaigns, pausedCampaigns, loading, refresh: fetchCampaigns }}>
      {children}
    </MyCampaignsContext.Provider>
  );
}

export function useMyCampaigns() {
  const ctx = useContext(MyCampaignsContext);
  if (!ctx) throw new Error('useMyCampaigns must be used within MyCampaignsProvider');
  return ctx;
}
