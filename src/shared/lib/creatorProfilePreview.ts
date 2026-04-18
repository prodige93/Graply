import { supabase } from '@/shared/infrastructure/supabase';

export type CreatorProfilePreviewStats = {
  approved_videos: number;
  campaigns_with_approved_video: number;
};

export type CreatorProfilePreview = {
  found: true;
  is_public: boolean;
  messaging_enabled: boolean;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  banner_url: string | null;
  content_tags: string[];
  website: string;
  created_at: string;
  instagram_handle: string;
  tiktok_handle: string;
  youtube_handle: string;
  clip_views_total: number;
  stats: CreatorProfilePreviewStats;
};

export type CreatorProfilePreviewResult = { found: false } | CreatorProfilePreview;

function parsePreview(data: unknown): CreatorProfilePreviewResult {
  if (!data || typeof data !== 'object') return { found: false };
  const o = data as Record<string, unknown>;
  if (o.found === false) return { found: false };
  const tags = o.content_tags;
  const content_tags = Array.isArray(tags) ? tags.map(String) : [];
  const stats = (o.stats && typeof o.stats === 'object' ? o.stats : {}) as Record<string, unknown>;
  return {
    found: true,
    is_public: Boolean(o.is_public),
    messaging_enabled: o.messaging_enabled !== false,
    username: String(o.username ?? ''),
    display_name: String(o.display_name ?? ''),
    bio: String(o.bio ?? ''),
    avatar_url: (o.avatar_url as string | null) ?? null,
    banner_url: (o.banner_url as string | null) ?? null,
    content_tags,
    website: String(o.website ?? ''),
    created_at: String(o.created_at ?? ''),
    instagram_handle: String(o.instagram_handle ?? ''),
    tiktok_handle: String(o.tiktok_handle ?? ''),
    youtube_handle: String(o.youtube_handle ?? ''),
    clip_views_total: Number(o.clip_views_total) || 0,
    stats: {
      approved_videos: Number(stats.approved_videos) || 0,
      campaigns_with_approved_video: Number(stats.campaigns_with_approved_video) || 0,
    },
  };
}

export async function fetchCreatorProfilePreview(username: string): Promise<CreatorProfilePreviewResult> {
  const { data, error } = await supabase.rpc('get_creator_profile_preview', { p_username: username });
  if (error) {
    console.warn('get_creator_profile_preview', error.message);
    return { found: false };
  }
  return parsePreview(data);
}
