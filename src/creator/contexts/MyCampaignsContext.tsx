import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '@/shared/infrastructure/supabase';
import {
  mapSupabaseCampaign,
  enrichCampaignsWithProfiles,
  formatFirstPlatformPer1000Label,
  normalizeStringArray,
  type SupabaseCampaign,
} from '@/shared/lib/mapSupabaseCampaign';
import type { CampaignData } from '@/creator/components/CampaignCard';
import type { PendingApplication } from '@/shared/lib/useCreatorCampaigns';

interface MyCampaignsContextValue {
  activeCampaigns: CampaignData[];
  pausedCampaigns: CampaignData[];
  pendingApplications: PendingApplication[];
  loading: boolean;
  /** Recharge les campagnes / candidatures. `silent`: pas de reset `loading` (évite un flash au retour sur Mes campagnes). */
  refresh: (options?: { silent?: boolean }) => Promise<void>;
}

const MyCampaignsContext = createContext<MyCampaignsContextValue | null>(null);

function formatAppliedAt(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function firstPlatformRateLabel(c: SupabaseCampaign): string {
  return formatFirstPlatformPer1000Label(c.platforms, c.platform_budgets);
}

export function MyCampaignsProvider({ children }: { children: ReactNode }) {
  const [activeCampaigns, setActiveCampaigns] = useState<CampaignData[]>([]);
  const [pausedCampaigns, setPausedCampaigns] = useState<CampaignData[]>([]);
  const [pendingApplications, setPendingApplications] = useState<PendingApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent === true;
    if (!silent) setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setActiveCampaigns([]);
      setPausedCampaigns([]);
      setPendingApplications([]);
      setLoading(false);
      return;
    }

    const [acceptedRes, pendingRes] = await Promise.all([
      supabase
        .from('campaign_applications')
        .select('id, campaigns(*)')
        .eq('user_id', user.id)
        .eq('status', 'accepted'),
      supabase
        .from('campaign_applications')
        .select('id, created_at, campaigns(*)')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
    ]);

    type JoinRow = { id: string; created_at?: string; campaigns: SupabaseCampaign | null };

    const acceptedRows = ((acceptedRes.data ?? []) as JoinRow[]).filter((r) => r.campaigns);
    const seenCampaign = new Set<string>();
    const acceptedCampaignsRaw: SupabaseCampaign[] = [];
    for (const row of acceptedRows) {
      const c = row.campaigns!;
      if (seenCampaign.has(c.id)) continue;
      if (c.status !== 'published' && c.status !== 'paused') continue;
      seenCampaign.add(c.id);
      acceptedCampaignsRaw.push(c);
    }

    const enrichedAccepted = await enrichCampaignsWithProfiles(acceptedCampaignsRaw);
    const published = enrichedAccepted.filter((c) => c.status === 'published');
    const paused = enrichedAccepted.filter((c) => c.status === 'paused');
    setActiveCampaigns(published.map(mapSupabaseCampaign));
    setPausedCampaigns(paused.map(mapSupabaseCampaign));

    const pendingRows = ((pendingRes.data ?? []) as JoinRow[]).filter((r) => r.campaigns);
    const pendingCampaignsRaw = pendingRows.map((r) => r.campaigns!);
    const uniquePendingById = [...new Map(pendingCampaignsRaw.map((c) => [c.id, c])).values()];
    const enrichedPending = await enrichCampaignsWithProfiles(uniquePendingById);
    const pendingMap = new Map(enrichedPending.map((c) => [c.id, c]));

    const pendingApps: PendingApplication[] = pendingRows.map((row) => {
      const base = row.campaigns!;
      const c = pendingMap.get(base.id) ?? base;
      const profile = c.profiles;
      const brand = profile?.display_name || profile?.username || '';
      const brandLogo =
        profile?.avatar_url ||
        'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100';
      const socials = normalizeStringArray(c.platforms);
      return {
        id: row.id,
        name: c.name ?? '',
        brand,
        brandLogo,
        photo: c.photo_url || '',
        thumb: c.photo_url || '',
        platforms: socials,
        category: c.content_type || 'UGC',
        ratePerK: firstPlatformRateLabel(c),
        appliedAt: formatAppliedAt(row.created_at ?? new Date().toISOString()),
        applicantsCount: 0,
        status: 'pending' as const,
      };
    });
    setPendingApplications(pendingApps);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session?.user) {
        await refresh();
      } else {
        setActiveCampaigns([]);
        setPausedCampaigns([]);
        setPendingApplications([]);
        setLoading(false);
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void refresh();
      } else {
        setActiveCampaigns([]);
        setPausedCampaigns([]);
        setPendingApplications([]);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [refresh]);

  /** Quand l’entreprise accepte/refuse, le créateur revoit les listes à jour (retour onglet / autre fenêtre). */
  useEffect(() => {
    let debounce: ReturnType<typeof setTimeout> | undefined;
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(() => {
        void supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) void refresh({ silent: true });
        });
      }, 400);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      if (debounce) clearTimeout(debounce);
    };
  }, [refresh]);

  return (
    <MyCampaignsContext.Provider
      value={{ activeCampaigns, pausedCampaigns, pendingApplications, loading, refresh }}
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
