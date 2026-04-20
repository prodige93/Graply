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
  pendingCheckout: Campaign[];
  pausedCampaigns: Campaign[];
  completedCampaigns: Campaign[];
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
  const [pendingCheckout, setPendingCheckout] = useState<Campaign[]>([]);
  const [pausedCampaigns, setPausedCampaigns] = useState<Campaign[]>([]);
  const [completedCampaigns, setCompletedCampaigns] = useState<Campaign[]>([]);
  const [drafts, setDrafts] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async (uid?: string) => {
    const effectiveUid = uid ?? userId;
    if (!effectiveUid) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCampaigns([]);
        setPendingCheckout([]);
        setPausedCampaigns([]);
        setDrafts([]);
        setLoading(false);
        return;
      }
      setUserId(user.id);
      return fetchCampaigns(user.id);
    }
    setLoading(true);
    const [pubResult, pausedResult, completedResult, draftResult] = await Promise.all([
      supabase.from('campaigns').select('*').eq('status', 'published').eq('user_id', effectiveUid).order('created_at', { ascending: false }),
      supabase.from('campaigns').select('*').eq('status', 'pending_checkout').eq('user_id', effectiveUid).order('created_at', { ascending: false }),
      supabase.from('campaigns').select('*').eq('status', 'paused').eq('user_id', effectiveUid).order('created_at', { ascending: false }),
      supabase.from('campaigns').select('*').eq('status', 'completed').eq('user_id', effectiveUid).order('created_at', { ascending: false }),
      supabase.from('campaigns').select('*').eq('status', 'draft').eq('user_id', effectiveUid).order('created_at', { ascending: false }),
    ]);
    const TEMP_COMPLETED_ID = 'd0a10000-ca23-4192-9b89-5058412c0ea0';
    const allPub = pubResult.data ?? [];
    const tempCompleted = allPub.filter((c) => c.id === TEMP_COMPLETED_ID);
    const realPub = allPub.filter((c) => c.id !== TEMP_COMPLETED_ID);
    setCampaigns(realPub);
    setPausedCampaigns(pausedResult.data ?? []);
    setCompletedCampaigns([...tempCompleted.map((c) => ({ ...c, status: 'completed' })), ...(completedResult.data ?? [])]);
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
    setPendingCheckout((prev) => prev.filter((d) => d.id !== id));
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
    setCompletedCampaigns((prev) => prev.filter((c) => c.id !== id));
  }, [campaigns, pausedCampaigns]);

  const updateCampaignStatus = useCallback((id: string, status: string) => {
    const removeFrom = (setter: React.Dispatch<React.SetStateAction<Campaign[]>>) => {
      let found: Campaign | undefined;
      setter((prev) => {
        found = prev.find((c) => c.id === id);
        return found ? prev.filter((c) => c.id !== id) : prev;
      });
      return found;
    };

    const addTo = (setter: React.Dispatch<React.SetStateAction<Campaign[]>>, campaign: Campaign, newStatus: string) => {
      setter((cur) => [{ ...campaign, status: newStatus }, ...cur]);
    };

    const allSetters = [setCampaigns, setPausedCampaigns, setCompletedCampaigns];
    let campaign: Campaign | undefined;
    for (const setter of allSetters) {
      campaign = removeFrom(setter);
      if (campaign) break;
    }
    if (!campaign) return;

    if (status === 'published') addTo(setCampaigns, campaign, 'published');
    else if (status === 'paused') addTo(setPausedCampaigns, campaign, 'paused');
    else if (status === 'completed') addTo(setCompletedCampaigns, campaign, 'completed');
  }, []);

  return (
    <MyCampaignsContext.Provider value={{ campaigns, pausedCampaigns, completedCampaigns, drafts, loading, refresh: fetchCampaigns, deleteDraft, deleteActiveCampaign, updateCampaignStatus }}>
      {children}
    </MyCampaignsContext.Provider>
  );
}

export function useMyCampaigns() {
  const ctx = useContext(MyCampaignsContext);
  if (!ctx) throw new Error('useMyCampaigns must be used within MyCampaignsProvider');
  return ctx;
}
