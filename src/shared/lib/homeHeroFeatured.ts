import iphone17Img from '@/shared/assets/hero-slide-iphone17.jpeg';
import bo7Img from '@/shared/assets/hero-slide-bo7.jpeg';

/** Carrousel d’accueil / Mon compte / liste campagnes : au plus 5 visuels (doc interne). */
export const MAX_HERO_FEATURED_SLIDES = 5;

const PLACEHOLDER = 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200';

export type HeroFeaturedSlide = {
  /** Clé stable React */
  key: string;
  /** UUID campagne Supabase, ou null pour les slides de secours */
  campaignId: string | null;
  title: string;
  line2: string;
  imageUrl: string;
};

export const FALLBACK_HERO_SLIDES: HeroFeaturedSlide[] = [
  {
    key: 'fallback-iphone',
    campaignId: null,
    title: 'iPhone 17',
    line2: 'Nouvelle collection',
    imageUrl: iphone17Img,
  },
  {
    key: 'fallback-bo7',
    campaignId: null,
    title: 'Black Ops 7',
    line2: 'Campagne exclusive',
    imageUrl: bo7Img,
  },
].slice(0, MAX_HERO_FEATURED_SLIDES);

function parseBudgetNum(budget: string): number {
  return parseFloat(String(budget).replace(/[^0-9.]/g, '')) || 0;
}

function line2FromRow(description: string | null, budget: string): string {
  const d = (description || '').trim();
  if (d.length > 0) return d.length > 90 ? `${d.slice(0, 87)}…` : d;
  return `Budget ${budget}`;
}

export function mapCampaignRowsToHeroSlides(
  rows: { id: string; name: string; description: string | null; photo_url: string | null; budget: string }[],
): HeroFeaturedSlide[] {
  const sorted = [...rows].sort((a, b) => {
    const db = parseBudgetNum(b.budget) - parseBudgetNum(a.budget);
    if (db !== 0) return db;
    return 0;
  });
  return sorted.slice(0, MAX_HERO_FEATURED_SLIDES).map((c) => ({
    key: c.id,
    campaignId: c.id,
    title: c.name,
    line2: line2FromRow(c.description, c.budget),
    imageUrl: c.photo_url && c.photo_url.length > 0 ? c.photo_url : PLACEHOLDER,
  }));
}
