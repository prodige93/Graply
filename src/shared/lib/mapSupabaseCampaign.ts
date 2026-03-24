import type { CampaignData } from '@/creator/components/CampaignCard';

interface SupabaseCampaign {
  id: string;
  name: string;
  description: string;
  photo_url: string | null;
  budget: string;
  content_type: string;
  categories: string[] | null;
  platforms: string[] | null;
  platform_budgets: Record<string, { amount?: string; per1000?: string; min?: string; max?: string }> | null;
  information: string;
  rules: string[] | null;
  status: string;
  created_at: string;
  profiles?: { username: string | null; display_name: string | null; avatar_url: string | null } | null;
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
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
  const socials = (c.platforms ?? []).filter(
    (p): p is 'youtube' | 'tiktok' | 'instagram' => ['youtube', 'tiktok', 'instagram'].includes(p)
  );

  const tags: string[] = [];
  if (c.content_type) tags.push(c.content_type);
  if (c.categories?.length) tags.push(c.categories[0]);

  const budgetNum = parseFloat(c.budget.replace(/[^0-9.]/g, '')) || 0;

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
    timeAgo: getTimeAgo(c.created_at),
    title: c.name,
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
    category: c.categories?.[0] || '',
    contentType: c.content_type || 'UGC',
    applicants: 0,
    ratesPerPlatform,
    topCreators: [],
    platformStats: socials.map((p) => ({ platform: p, views: '0', earned: '$0.00' })),
    chartData: [],
    isPublic: true,
    rules: c.rules ?? undefined,
  };
}
