import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight, Trash2 } from 'lucide-react';
import { supabase } from '@/shared/infrastructure/supabase';
import { getCreatorCampaigns, getPendingApplications, getSubmittedVideos, removeCreatorCampaign, removeApplication, removeSubmittedVideo } from '@/shared/lib/useCreatorCampaigns';
import { campaigns as staticCampaigns, sponsoredCampaigns } from '@/shared/data/campaignsData';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';

const platformIconMap: Record<string, string> = {
  instagram: instagramIcon,
  tiktok: tiktokIcon,
  youtube: youtubeIcon,
};

const allStaticPool = [...staticCampaigns, ...sponsoredCampaigns];

interface CampaignItem {
  id: string;
  name: string;
  brand: string;
  photo: string;
  platforms: string[];
  pendingCount: number;
  source: 'saved' | 'accepted' | 'submitted';
}

interface Props {
  onClose: () => void;
  hidePendingBadges?: boolean;
}

export default function VerifyVideoModal({ onClose, hidePendingBadges = false }: Props) {
  const navigate = useNavigate();
  const [savedCampaigns, setSavedCampaigns] = useState<CampaignItem[]>([]);
  const [acceptedCampaigns, setAcceptedCampaigns] = useState<CampaignItem[]>([]);
  const [submittedCampaigns, setSubmittedCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
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

        const activeItems: CampaignItem[] = localActive.map((c) => ({
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
        const localSubmitted: CampaignItem[] = [];
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

        setAcceptedCampaigns(deduped);
        setSavedCampaigns([]);
        setSubmittedCampaigns(localSubmitted);
        setLoading(false);
        return;
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

      const acceptedItems: CampaignItem[] = ((appsResult.data ?? []) as unknown as Array<{
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

      let savedItems: CampaignItem[] = [];
      if (savedIds.length > 0) {
        const { data: dbSaved } = await supabase
          .from('campaigns')
          .select('id, name, photo_url, platforms')
          .in('id', savedIds);

        const dbSavedItems: CampaignItem[] = (dbSaved ?? []).map((c) => ({
          id: c.id,
          name: c.name,
          brand: '',
          photo: c.photo_url ?? '',
          platforms: c.platforms ?? [],
          pendingCount: pendingCounts[c.id] ?? 0,
          source: 'saved' as const,
        }));

        const staticSavedItems: CampaignItem[] = allStaticPool
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
      const submittedItems: CampaignItem[] = [];

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

      setAcceptedCampaigns(acceptedItems);
      setSavedCampaigns(savedItems);
      setSubmittedCampaigns(submittedItems);
      setLoading(false);
    })();
  }, []);

  const handleSelect = (id: string) => {
    onClose();
    navigate(`/campagne/${id}/verification`);
  };

  const handleRemove = async (campaign: CampaignItem) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      if (campaign.source === 'saved') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('saved_campaign_ids')
          .eq('id', user.id)
          .maybeSingle();
        const current: string[] = profile?.saved_campaign_ids ?? [];
        await supabase
          .from('profiles')
          .update({ saved_campaign_ids: current.filter((id) => id !== campaign.id) })
          .eq('id', user.id);
      } else if (campaign.source === 'accepted') {
        await supabase
          .from('campaign_applications')
          .delete()
          .eq('user_id', user.id)
          .eq('campaign_id', campaign.id);
      } else if (campaign.source === 'submitted') {
        await supabase
          .from('video_submissions')
          .delete()
          .eq('user_id', user.id)
          .eq('campaign_id', campaign.id);
      }
    } else {
      if (campaign.source === 'accepted') {
        removeCreatorCampaign(campaign.id);
        removeApplication(campaign.id);
      } else if (campaign.source === 'submitted') {
        const videos = getSubmittedVideos().filter((v) => v.campaignId === campaign.id);
        videos.forEach((v) => removeSubmittedVideo(v.id));
      }
    }

    setSavedCampaigns((prev) => prev.filter((c) => c.id !== campaign.id));
    setAcceptedCampaigns((prev) => prev.filter((c) => c.id !== campaign.id));
    setSubmittedCampaigns((prev) => prev.filter((c) => c.id !== campaign.id));
  };

  const allCampaigns = [
    ...acceptedCampaigns,
    ...savedCampaigns,
    ...submittedCampaigns,
  ].filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i);

  const isEmpty = !loading && allCampaigns.length === 0;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.055)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.9)',
        }}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <h2 className="text-base font-bold text-white">Verifier ma video</h2>
            <p className="text-xs text-white/40 mt-0.5">Selectionne la campagne concernee</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        <div className="px-4 py-3 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white/70 animate-spin" />
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <p className="text-sm text-white/30 text-center">Aucune campagne active.<br />Rejoins ou enregistre une campagne pour soumettre tes videos.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {allCampaigns.map((c) => (
                <CampaignRow
                  key={c.id}
                  campaign={c}
                  hidePendingBadges={hidePendingBadges}
                  onSelect={handleSelect}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </div>

        <div className="hidden sm:block h-5" />
        <div className="block sm:hidden" style={{ height: 'calc(5rem + env(safe-area-inset-bottom))' }} />
      </div>
    </div>
  );
}

function CampaignRow({ campaign, hidePendingBadges, onSelect, onRemove }: {
  campaign: CampaignItem;
  hidePendingBadges: boolean;
  onSelect: (id: string) => void;
  onRemove: (campaign: CampaignItem) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(campaign);
        }}
        className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(12px)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.border = '1px solid rgba(255,255,255,0.25)';
          const icon = e.currentTarget.querySelector('svg');
          if (icon) icon.style.color = 'rgba(160,160,160,1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          e.currentTarget.style.border = '1px solid rgba(255,255,255,0.15)';
          const icon = e.currentTarget.querySelector('svg');
          if (icon) icon.style.color = '';
        }}
      >
        <Trash2 className="w-3.5 h-3.5 text-white/40" />
      </button>
      <button
        onClick={() => onSelect(campaign.id)}
        className="flex-1 flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-left group hover:scale-[1.01] active:scale-[0.98]"
        style={{
          background: 'rgba(255,255,255,0.055)',
          border: '1px solid rgba(255,255,255,0.10)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.2)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.10)'; }}
      >
        <img
          src={campaign.photo}
          alt={campaign.name}
          className="w-11 h-11 rounded-xl object-cover shrink-0"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{campaign.name}</p>
          <div className="flex items-center gap-1.5 mt-1">
            {campaign.platforms.map((p) =>
              platformIconMap[p] ? (
                <img key={p} src={platformIconMap[p]} alt={p} className="w-3.5 h-3.5 social-icon opacity-50" />
              ) : null
            )}
          </div>
        </div>
        {!hidePendingBadges && campaign.pendingCount > 0 && (
          <span
            className="text-[9px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
            style={{ background: 'rgba(255,166,114,0.12)', color: '#FFA672', border: '1px solid rgba(255,166,114,0.25)' }}
          >
            video en attente
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
      </button>
    </div>
  );
}
