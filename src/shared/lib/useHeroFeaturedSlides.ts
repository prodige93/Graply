import { useState, useEffect } from 'react';
import { supabase } from '@/shared/infrastructure/supabase';
import {
  FALLBACK_HERO_SLIDES,
  mapCampaignRowsToHeroSlides,
  type HeroFeaturedSlide,
} from '@/shared/lib/homeHeroFeatured';

export function useHeroFeaturedSlides() {
  const [slides, setSlides] = useState<HeroFeaturedSlide[]>(FALLBACK_HERO_SLIDES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name, description, photo_url, budget, created_at')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(12);

      if (cancelled) return;

      if (error || !data?.length) {
        setSlides(FALLBACK_HERO_SLIDES);
        setLoading(false);
        return;
      }

      const mapped = mapCampaignRowsToHeroSlides(data);
      setSlides(mapped.length ? mapped : FALLBACK_HERO_SLIDES);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { slides, loading };
}
