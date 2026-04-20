import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/shared/infrastructure/supabase';

export interface VideoSubmissionCampaign {
  campaignId: string;
  campaignName: string;
  brand: string;
  campaignPhoto: string;
  platform: string;
  status: string;
}

/**
 * Normalise une URL vidéo pour comparaison : enlève trailing slash,
 * query, fragments, protocole. Permet de matcher `instagram.com/reel/XYZ`
 * et `https://www.instagram.com/reel/XYZ/?utm_source=ig` à la même clé.
 */
function normalizeVideoUrl(raw: string | null | undefined): string {
  if (!raw) return '';
  try {
    const u = new URL(raw);
    return `${u.hostname.replace(/^www\./, '')}${u.pathname.replace(/\/$/, '')}`.toLowerCase();
  } catch {
    return raw.trim().toLowerCase();
  }
}

/**
 * Retourne un index campaignByVideoUrl + un helper `lookup(url)` pour retrouver
 * la campagne associée à une vidéo synchronisée (`instagram_videos.permalink`,
 * `tiktok_videos.share_url`, `youtube_videos.watch_url`) via la table
 * `video_submissions.video_url`.
 */
export function useVideoSubmissionsIndex() {
  const [byUrl, setByUrl] = useState<Map<string, VideoSubmissionCampaign>>(new Map());
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setByUrl(new Map());
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('video_submissions')
      .select('campaign_id, campaign_name, brand, campaign_photo, platform, video_url, status')
      .eq('user_id', user.id);
    if (error || !data) {
      setByUrl(new Map());
      setLoading(false);
      return;
    }
    const next = new Map<string, VideoSubmissionCampaign>();
    for (const row of data) {
      const key = normalizeVideoUrl(row.video_url as string | null);
      if (!key) continue;
      next.set(key, {
        campaignId: String(row.campaign_id ?? ''),
        campaignName: String(row.campaign_name ?? ''),
        brand: String(row.brand ?? ''),
        campaignPhoto: String(row.campaign_photo ?? ''),
        platform: String(row.platform ?? ''),
        status: String(row.status ?? ''),
      });
    }
    setByUrl(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const lookup = useCallback(
    (url: string | null | undefined): VideoSubmissionCampaign | null => {
      const key = normalizeVideoUrl(url);
      if (!key) return null;
      return byUrl.get(key) ?? null;
    },
    [byUrl],
  );

  return { lookup, loading, refetch };
}
