import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '@/shared/infrastructure/supabase';

export interface Campaign {
  id: string;
  name: string;
  description: string;
  photo_url: string | null;
  budget: string;
  content_type: string;
  categories: string[];
  platforms: string[];
  platform_budgets: Record<string, { amount: string; per1000: string; min: string; max: string }>;
  status: string;
  created_at: string;
  user_id?: string | null;
}

interface MyCampaignsContextValue {
  campaigns: Campaign[];
  pausedCampaigns: Campaign[];
  drafts: Campaign[];
  loading: boolean;
  refresh: () => Promise<void>;
  deleteDraft: (id: string) => void;
  deleteActiveCampaign: (id: string) => Promise<void>;
  updateCampaignStatus: (id: string, status: string) => void;
}

const MyCampaignsContext = createContext<MyCampaignsContextValue | null>(null);

export function MyCampaignsProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pausedCampaigns, setPausedCampaigns] = useState<Campaign[]>([]);
  const [drafts, setDrafts] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async (uid?: string) => {
    const effectiveUid = uid ?? userId;
    if (!effectiveUid) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCampaigns([]);
        setPausedCampaigns([]);
        setDrafts([]);
        setLoading(false);
        return;
      }
      setUserId(user.id);
      return fetchCampaigns(user.id);
    }
    setLoading(true);
    const [pubResult, pausedResult, draftResult] = await Promise.all([
      supabase.from('campaigns').select('*').eq('status', 'published').eq('user_id', effectiveUid).order('created_at', { ascending: false }),
      supabase.from('campaigns').select('*').eq('status', 'paused').eq('user_id', effectiveUid).order('created_at', { ascending: false }),
      supabase.from('campaigns').select('*').eq('status', 'draft').eq('user_id', effectiveUid).order('created_at', { ascending: false }),
    ]);
    setCampaigns(pubResult.data ?? []);
    setPausedCampaigns(pausedResult.data ?? []);
    if (draftResult.data) setDrafts(draftResult.data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          setUserId(session.user.id);
          await fetchCampaigns(session.user.id);
        }
      })();
    });
    fetchCampaigns();
    return () => { subscription.unsubscribe(); };
  }, []);

  const deleteDraft = useCallback((id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const deleteActiveCampaign = useCallback(async (id: string) => {
    const campaignToDelete = [...campaigns, ...pausedCampaigns].find((c) => c.id === id);
    if (!campaignToDelete) return;

    const [applicantsResult, submissionsResult] = await Promise.all([
      supabase.from('campaign_applications').select('user_id').eq('campaign_id', id),
      supabase.from('video_submissions').select('user_id').eq('campaign_id', id),
    ]);

    const applicantIds = (applicantsResult.data ?? []).map((r: { user_id: string }) => r.user_id);
    const submitterIds = (submissionsResult.data ?? []).map((r: { user_id: string }) => r.user_id);
    const allUserIds = [...new Set([...applicantIds, ...submitterIds])];

    if (allUserIds.length > 0) {
      const notifications = allUserIds.map((uid) => ({
        user_id: uid,
        type: 'campaign_deleted',
        title: 'Campagne supprimee',
        message: `La campagne "${campaignToDelete.name}" a ete supprimee par l'auteur.`,
      }));
      await supabase.from('notifications').insert(notifications);
    }

    await supabase.from('campaign_applications').delete().eq('campaign_id', id);
    await supabase.from('campaigns').delete().eq('id', id);

    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    setPausedCampaigns((prev) => prev.filter((c) => c.id !== id));
  }, [campaigns, pausedCampaigns]);

  const updateCampaignStatus = useCallback((id: string, status: string) => {
    if (status === 'published') {
      setPausedCampaigns((prev) => {
        const found = prev.find((c) => c.id === id);
        if (found) {
          setCampaigns((cur) => [{ ...found, status: 'published' }, ...cur]);
          return prev.filter((c) => c.id !== id);
        }
        return prev;
      });
    } else if (status === 'paused') {
      setCampaigns((prev) => {
        const found = prev.find((c) => c.id === id);
        if (found) {
          setPausedCampaigns((cur) => [{ ...found, status: 'paused' }, ...cur]);
          return prev.filter((c) => c.id !== id);
        }
        return prev;
      });
    }
  }, []);

  return (
    <MyCampaignsContext.Provider value={{ campaigns, pausedCampaigns, drafts, loading, refresh: fetchCampaigns, deleteDraft, deleteActiveCampaign, updateCampaignStatus }}>
      {children}
    </MyCampaignsContext.Provider>
  );
}

export function useMyCampaigns() {
  const ctx = useContext(MyCampaignsContext);
  if (!ctx) throw new Error('useMyCampaigns must be used within MyCampaignsProvider');
  return ctx;
}
