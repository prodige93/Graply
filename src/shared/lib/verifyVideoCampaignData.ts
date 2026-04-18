import { supabase } from '@/shared/infrastructure/supabase';
import {
  getCreatorCampaigns,
  getPendingApplications,
  getSubmittedVideos,
} from '@/shared/lib/useCreatorCampaigns';
import { campaigns as staticCampaigns, sponsoredCampaigns } from '@/shared/data/campaignsData';

const allStaticPool = [...staticCampaigns, ...sponsoredCampaigns];

export interface VerifyVideoCampaignItem {
  id: string;
  name: string;
  brand: string;
  photo: string;
  platforms: string[];
  pendingCount: number;
  source: 'saved' | 'accepted' | 'submitted';
}

export async function loadVerifyVideoCampaignBuckets(): Promise<{
  accepted: VerifyVideoCampaignItem[];
  saved: VerifyVideoCampaignItem[];
  submitted: VerifyVideoCampaignItem[];
}> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const localActive = getCreatorCampaigns().filter((c) => c.status === 'active');
    const localAccepted = getPendingApplications()
      .filter((a) => a.status === 'accepted')
      .map((a) => ({
        id: a.id,
        name: a.name,
        brand: a.brand,
        photo: a.photo,
        platforms: a.platforms,
        pendingCount: 0,
        source: 'accepted' as const,
      }));

    const activeItems: VerifyVideoCampaignItem[] = localActive.map((c) => ({
      id: c.id,
      name: c.name,
      brand: c.brand,
      photo: c.photo,
      platforms: c.platforms,
      pendingCount: 0,
      source: 'accepted' as const,
    }));

    const seenAccepted = new Set(activeItems.map((c) => c.id));
    const deduped = [...activeItems, ...localAccepted.filter((a) => !seenAccepted.has(a.id))];

    const localVideos = getSubmittedVideos();
    const seenAll = new Set(deduped.map((c) => c.id));
    const localSubmitted: VerifyVideoCampaignItem[] = [];
    const seenSubmitted = new Set<string>();
    for (const v of localVideos) {
      if (!seenAll.has(v.campaignId) && !seenSubmitted.has(v.campaignId)) {
        seenSubmitted.add(v.campaignId);
        const staticC = allStaticPool.find((c) => c.id === v.campaignId);
        localSubmitted.push({
          id: v.campaignId,
          name: v.campaignName,
          brand: v.brand,
          photo: staticC?.image ?? v.campaignPhoto,
          platforms: staticC?.socials ?? [],
          pendingCount: 0,
          source: 'submitted' as const,
        });
      }
    }

    return { accepted: deduped, saved: [], submitted: localSubmitted };
  }

  const [appsResult, savedResult, allVideosResult] = await Promise.all([
    supabase
      .from('campaign_applications')
      .select('campaign_id, campaigns(id, name, photo_url, platforms, user_id)')
      .eq('user_id', user.id)
      .eq('status', 'accepted'),
    supabase
      .from('profiles')
      .select('saved_campaign_ids')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('video_submissions')
      .select('campaign_id, campaign_name, brand, campaign_photo')
      .eq('user_id', user.id),
  ]);

  const pendingCounts: Record<string, number> = {};
  if (allVideosResult.data) {
    allVideosResult.data.forEach((row) => {
      pendingCounts[row.campaign_id] = (pendingCounts[row.campaign_id] ?? 0) + 1;
    });
  }

  const acceptedItems: VerifyVideoCampaignItem[] = ((appsResult.data ?? []) as unknown as Array<{
    campaign_id: string;
    campaigns: { id: string; name: string; photo_url: string; platforms: string[]; user_id: string } | null;
  }>)
    .filter((a) => a.campaigns)
    .map((a) => {
      const c = a.campaigns!;
      return {
        id: c.id,
        name: c.name,
        brand: '',
        photo: c.photo_url ?? '',
        platforms: c.platforms ?? [],
        pendingCount: pendingCounts[c.id] ?? 0,
        source: 'accepted' as const,
      };
    });

  const savedIds: string[] = savedResult.data?.saved_campaign_ids ?? [];
  const acceptedIds = new Set(acceptedItems.map((c) => c.id));

  let savedItems: VerifyVideoCampaignItem[] = [];
  if (savedIds.length > 0) {
    const { data: dbSaved } = await supabase
      .from('campaigns')
      .select('id, name, photo_url, platforms')
      .in('id', savedIds);

    const dbSavedItems: VerifyVideoCampaignItem[] = (dbSaved ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      brand: '',
      photo: c.photo_url ?? '',
      platforms: c.platforms ?? [],
      pendingCount: pendingCounts[c.id] ?? 0,
      source: 'saved' as const,
    }));

    const staticSavedItems: VerifyVideoCampaignItem[] = allStaticPool
      .filter((c) => savedIds.includes(c.id))
      .map((c) => ({
        id: c.id,
        name: c.title,
        brand: c.brand,
        photo: c.image,
        platforms: c.socials ?? [],
        pendingCount: pendingCounts[c.id] ?? 0,
        source: 'saved' as const,
      }));

    const dbIds = new Set(dbSavedItems.map((c) => c.id));
    const combined = [...dbSavedItems, ...staticSavedItems.filter((c) => !dbIds.has(c.id))];
    savedItems = combined.filter((c) => !acceptedIds.has(c.id));
  }

  const allKnownIds = new Set([...acceptedIds, ...savedIds]);
  const submittedSeenIds = new Set<string>();
  const submittedItems: VerifyVideoCampaignItem[] = [];

  (allVideosResult.data ?? []).forEach((row) => {
    const cid = row.campaign_id;
    if (!allKnownIds.has(cid) && !submittedSeenIds.has(cid)) {
      submittedSeenIds.add(cid);
      const staticC = allStaticPool.find((s) => s.id === cid);
      submittedItems.push({
        id: cid,
        name: row.campaign_name ?? staticC?.title ?? cid,
        brand: row.brand ?? '',
        photo: row.campaign_photo ?? staticC?.image ?? '',
        platforms: staticC?.socials ?? [],
        pendingCount: pendingCounts[cid] ?? 0,
        source: 'submitted' as const,
      });
    }
  });

  return {
    accepted: acceptedItems,
    saved: savedItems,
    submitted: submittedItems,
  };
}
