import { useEffect, useState } from 'react';
import { ChevronRight, Trash2 } from 'lucide-react';
import { supabase } from '@/shared/infrastructure/supabase';
import {
  getSubmittedVideos,
  removeCreatorCampaign,
  removeApplication,
  removeSubmittedVideo,
} from '@/shared/lib/useCreatorCampaigns';
import {
  loadVerifyVideoCampaignBuckets,
  type VerifyVideoCampaignItem,
} from '@/shared/lib/verifyVideoCampaignData';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';

const platformIconMap: Record<string, string> = {
  instagram: instagramIcon,
  tiktok: tiktokIcon,
  youtube: youtubeIcon,
};

type Props = {
  onPickCampaign: (campaignId: string) => void;
  hidePendingBadges?: boolean;
  showSectionTitles?: boolean;
};

export default function VerifyVideoCampaignPicker({
  onPickCampaign,
  hidePendingBadges = false,
  showSectionTitles = false,
}: Props) {
  const [acceptedCampaigns, setAcceptedCampaigns] = useState<VerifyVideoCampaignItem[]>([]);
  const [savedCampaigns, setSavedCampaigns] = useState<VerifyVideoCampaignItem[]>([]);
  const [submittedCampaigns, setSubmittedCampaigns] = useState<VerifyVideoCampaignItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const buckets = await loadVerifyVideoCampaignBuckets();
    setAcceptedCampaigns(buckets.accepted);
    setSavedCampaigns(buckets.saved);
    setSubmittedCampaigns(buckets.submitted);
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  const handleRemove = async (campaign: VerifyVideoCampaignItem) => {
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

  const allCampaigns = [...acceptedCampaigns, ...savedCampaigns, ...submittedCampaigns].filter(
    (c, i, arr) => arr.findIndex((x) => x.id === c.id) === i,
  );

  const isEmpty = !loading && allCampaigns.length === 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white/70 animate-spin" />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <p className="text-sm text-white/30 text-center">
          Aucune campagne éligible.
          <br />
          Enregistre une campagne, postule (campagne privée) ou soumets une vidéo pour la lier ici.
        </p>
      </div>
    );
  }

  if (showSectionTitles) {
    return (
      <div className="space-y-8">
        <BucketBlock
          title="Candidature acceptée"
          subtitle="Campagnes privées où tu es accepté"
          items={acceptedCampaigns}
          hidePendingBadges={hidePendingBadges}
          onSelect={onPickCampaign}
          onRemove={handleRemove}
        />
        <BucketBlock
          title="Enregistrées"
          subtitle="Campagnes sauvegardées"
          items={savedCampaigns}
          hidePendingBadges={hidePendingBadges}
          onSelect={onPickCampaign}
          onRemove={handleRemove}
        />
        <BucketBlock
          title="Vidéo déjà envoyée"
          subtitle="Autres campagnes avec au moins une soumission"
          items={submittedCampaigns}
          hidePendingBadges={hidePendingBadges}
          onSelect={onPickCampaign}
          onRemove={handleRemove}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {allCampaigns.map((c) => (
        <CampaignRow
          key={c.id}
          campaign={c}
          hidePendingBadges={hidePendingBadges}
          onSelect={onPickCampaign}
          onRemove={handleRemove}
        />
      ))}
    </div>
  );
}

function BucketBlock({
  title,
  subtitle,
  items,
  hidePendingBadges,
  onSelect,
  onRemove,
}: {
  title: string;
  subtitle: string;
  items: VerifyVideoCampaignItem[];
  hidePendingBadges: boolean;
  onSelect: (id: string) => void;
  onRemove: (c: VerifyVideoCampaignItem) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-0.5">{title}</h3>
      <p className="text-[11px] text-white/30 mb-3">{subtitle}</p>
      <div className="space-y-2">
        {items.map((c) => (
          <CampaignRow
            key={c.id}
            campaign={c}
            hidePendingBadges={hidePendingBadges}
            onSelect={onSelect}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}

function CampaignRow({
  campaign,
  hidePendingBadges,
  onSelect,
  onRemove,
}: {
  campaign: VerifyVideoCampaignItem;
  hidePendingBadges: boolean;
  onSelect: (id: string) => void;
  onRemove: (c: VerifyVideoCampaignItem) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
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
      >
        <Trash2 className="w-3.5 h-3.5 text-white/40" />
      </button>
      <button
        type="button"
        onClick={() => onSelect(campaign.id)}
        className="flex-1 flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-left group hover:scale-[1.01] active:scale-[0.98]"
        style={{
          background: 'rgba(255,255,255,0.055)',
          border: '1px solid rgba(255,255,255,0.10)',
        }}
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
              ) : null,
            )}
          </div>
        </div>
        {!hidePendingBadges && campaign.pendingCount > 0 && (
          <span
            className="text-[9px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
            style={{ background: 'rgba(255,166,114,0.12)', color: '#FFA672', border: '1px solid rgba(255,166,114,0.25)' }}
          >
            vidéo en attente
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
      </button>
    </div>
  );
}
