import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '@/shared/infrastructure/supabase';
import { mapSupabaseCampaign, enrichCampaignsWithProfiles, type SupabaseCampaign } from '@/shared/lib/mapSupabaseCampaign';
import type { CampaignData } from '@/creator/components/CampaignCard';
import type { PendingApplication } from '@/shared/lib/useCreatorCampaigns';

interface MyCampaignsContextValue {
  activeCampaigns: CampaignData[];
  pausedCampaigns: CampaignData[];
  pendingApplications: PendingApplication[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const MyCampaignsContext = createContext<MyCampaignsContextValue | null>(null);

function campaignFromRow(row: {
  campaigns: SupabaseCampaign | SupabaseCampaign[] | null;
}): SupabaseCampaign | null {
  const c = row.campaigns;
  if (!c) return null;
  return Array.isArray(c) ? (c[0] ?? null) : c;
}

function mapPendingApplication(
  row: { id: string; created_at: string },
  c: SupabaseCampaign,
): PendingApplication {
  const mapped = mapSupabaseCampaign(c);
  const date = new Date(row.created_at);
  const formatted = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  return {
    id: row.id,
    name: c.name,
    brand: mapped.brand,
    brandLogo: mapped.brandLogo,
    photo: mapped.image,
    thumb: mapped.image,
    platforms: mapped.socials,
    category: mapped.contentType,
    ratePerK: mapped.ratePerView,
    appliedAt: formatted,
    applicantsCount: 0,
    status: 'pending',
  };
}

export function MyCampaignsProvider({ children }: { children: ReactNode }) {
  const [activeCampaigns, setActiveCampaigns] = useState<CampaignData[]>([]);
  const [pausedCampaigns, setPausedCampaigns] = useState<CampaignData[]>([]);
  const [pendingApplications, setPendingApplications] = useState<PendingApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setActiveCampaigns([]);
      setPausedCampaigns([]);
      setPendingApplications([]);
      setLoading(false);
      return;
    }

    const { data: apps, error } = await supabase
      .from('campaign_applications')
      .select(`
        id,
        status,
        created_at,
        campaigns (*)
      `)
      .eq('user_id', user.id);

    if (error || !apps?.length) {
      setActiveCampaigns([]);
      setPausedCampaigns([]);
      setPendingApplications([]);
      setLoading(false);
      return;
    }

    const rawCampaigns: SupabaseCampaign[] = [];
    for (const row of apps as Array<{ id: string; status: string; created_at: string; campaigns: SupabaseCampaign | SupabaseCampaign[] | null }>) {
      const c = campaignFromRow(row);
      if (c) rawCampaigns.push(c);
    }

    const uniqueById = [...new Map(rawCampaigns.map((c) => [c.id, c])).values()];
    const enriched = await enrichCampaignsWithProfiles(uniqueById);
    const enrichedById = new Map(enriched.map((c) => [c.id, c]));

    const activeRows: SupabaseCampaign[] = [];
    const pausedRows: SupabaseCampaign[] = [];
    const pendingList: PendingApplication[] = [];

    for (const row of apps as Array<{ id: string; status: string; created_at: string; campaigns: SupabaseCampaign | SupabaseCampaign[] | null }>) {
      const base = campaignFromRow(row);
      if (!base) continue;
      const c = enrichedById.get(base.id);
      if (!c) continue;

      if (row.status === 'pending') {
        pendingList.push(mapPendingApplication(row, c as SupabaseCampaign));
        continue;
      }

      if (row.status !== 'accepted') continue;

      if (c.status === 'published') activeRows.push(c as SupabaseCampaign);
      else if (c.status === 'paused') pausedRows.push(c as SupabaseCampaign);
    }

    const activeUnique = [...new Map(activeRows.map((c) => [c.id, c])).values()];
    const pausedUnique = [...new Map(pausedRows.map((c) => [c.id, c])).values()];

    setActiveCampaigns(activeUnique.map((c) => mapSupabaseCampaign(c)));
    setPausedCampaigns(pausedUnique.map((c) => mapSupabaseCampaign(c)));
    setPendingApplications(pendingList);
    setLoading(false);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) void fetchCampaigns();
      else {
        setActiveCampaigns([]);
        setPausedCampaigns([]);
        setPendingApplications([]);
        setLoading(false);
      }
    });
    void fetchCampaigns();
    return () => { subscription.unsubscribe(); };
  }, [fetchCampaigns]);

  return (
    <MyCampaignsContext.Provider
      value={{
        activeCampaigns,
        pausedCampaigns,
        pendingApplications,
        loading,
        refresh: fetchCampaigns,
      }}
    >
      {children}
    </MyCampaignsContext.Provider>
  );
}

export function useMyCampaigns() {
  const ctx = useContext(MyCampaignsContext);
  if (!ctx) throw new Error('useMyCampaigns must be used within MyCampaignsProvider');
  return ctx;
}
