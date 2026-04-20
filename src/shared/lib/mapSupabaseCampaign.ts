import type { CampaignData } from '@/creator/components/CampaignCard';
import { supabase } from '@/shared/infrastructure/supabase';

/** Colonnes nécessaires à `mapSupabaseCampaign` (évite `select('*')` inutilement lourd). */
export const CAMPAIGN_DB_SELECT_COLUMNS =
  'id, name, description, photo_url, budget, content_type, categories, platforms, platform_budgets, information, rules, require_application, is_public, status, created_at, user_id';

/** Normalise `platforms` / tableaux venant du JSON Postgres (tableau, null, ou chaîne JSON). */
export function normalizeStringArray(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((p): p is string => typeof p === 'string');
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed.filter((p): p is string => typeof p === 'string') : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** Tarif / 1k vues de la première plateforme (Instagram, TikTok, YouTube). */
export function formatFirstPlatformPer1000Label(
  platforms: unknown,
  platform_budgets: Record<string, { per1000?: string }> | null | undefined,
): string {
  const socials = normalizeStringArray(platforms).filter(
    (p): p is 'youtube' | 'tiktok' | 'instagram' => ['youtube', 'tiktok', 'instagram'].includes(p),
  );
  const first = socials[0];
  const pb = first ? platform_budgets?.[first] : undefined;
  return pb?.per1000 ? `$${pb.per1000}` : '';
}

export interface SupabaseCampaign {
  id: string;
  name: string | null;
  description: string | null;
  photo_url: string | null;
  budget: string | null;
  content_type: string | null;
  categories: string[] | null;
  platforms: string[] | null;
  platform_budgets: Record<string, { amount?: string; per1000?: string; min?: string; max?: string }> | null;
  information: string;
  rules: string[] | null;
  require_application?: boolean;
  /** false = campagne privée (candidature / hors flux « vérifier ma vidéo » public) */
  is_public?: boolean | null;
  status: string;
  created_at: string | null;
  user_id?: string | null;
  profiles?: { username: string | null; display_name: string | null; avatar_url: string | null } | null;
}

export async function enrichCampaignsWithProfiles<T extends { user_id?: string | null }>(
  campaigns: T[],
): Promise<(T & { profiles?: { username: string | null; display_name: string | null; avatar_url: string | null } | null })[]> {
  const userIds = [...new Set(campaigns.map((c) => c.user_id).filter(Boolean))] as string[];
  if (userIds.length === 0) return campaigns;

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .in('id', userIds);

  const profileMap = new Map(
    (profiles ?? []).map((p: { id: string; username: string | null; display_name: string | null; avatar_url: string | null }) => [p.id, p]),
  );

  return campaigns.map((c) => ({
    ...c,
    profiles: c.user_id ? profileMap.get(c.user_id) ?? null : null,
  }));
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export function mapSupabaseCampaign(c: SupabaseCampaign): CampaignData {
  const platformList = normalizeStringArray(c.platforms);
  const socials = platformList.filter(
    (p): p is 'youtube' | 'tiktok' | 'instagram' => ['youtube', 'tiktok', 'instagram'].includes(p)
  );

  const tags: string[] = [];
  if (c.content_type) tags.push(c.content_type);
  const categoryArr = Array.isArray(c.categories) ? c.categories : [];
  if (categoryArr.length) tags.push(categoryArr[0]);

  const budgetNum = parseFloat(String(c.budget ?? '').replace(/[^0-9.]/g, '')) || 0;

  const ratesPerPlatform = socials.map((p) => {
    const pb = c.platform_budgets?.[p];
    return {
      platform: p,
      rate: pb?.per1000 ? `$${pb.per1000}` : '$0.00',
    };
  });

  const profile = c.profiles;
  const brand = profile?.display_name || profile?.username || 'Mon entreprise';
  const brandLogo = profile?.avatar_url || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100';

  return {
    id: c.id,
    image: c.photo_url || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags,
    timeAgo: getTimeAgo(c.created_at ?? new Date().toISOString()),
    title: c.name?.trim() ? c.name : 'Campagne',
    description: c.description || '',
    brand,
    brandLogo,
    verified: false,
    socials,
    earned: '$0.00',
    budget: `$${budgetNum.toLocaleString('en-US')}`,
    ratePerView: ratesPerPlatform[0]?.rate || '$0.00',
    progress: 0,
    approval: '0%',
    views: '0',
    creators: '0',
    category: categoryArr[0] || '',
    contentType: c.content_type || 'UGC',
    applicants: 0,
    ratesPerPlatform,
    topCreators: [],
    platformStats: socials.map((p) => ({ platform: p, views: '0', earned: '$0.00' })),
    chartData: [],
    isPublic:
      typeof c.is_public === 'boolean'
        ? c.is_public
        : !(c.require_application ?? false),
    requireApplication: c.require_application ?? false,
    rules: c.rules ?? undefined,
    ownerUserId: c.user_id ?? null,
  };
}
