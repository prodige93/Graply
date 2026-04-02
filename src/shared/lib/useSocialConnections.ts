import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/shared/infrastructure/supabase';

export type DashboardSocialPlatform = 'instagram' | 'tiktok' | 'youtube';

const PLATFORMS: DashboardSocialPlatform[] = ['instagram', 'tiktok', 'youtube'];

export function useSocialConnections() {
  const [usernames, setUsernames] = useState<Partial<Record<DashboardSocialPlatform, string | null>>>({});
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('social_connections')
      .select('platform, platform_username')
      .in('platform', PLATFORMS);

    if (error) {
      setUsernames({});
      setLoading(false);
      return;
    }

    const next: Partial<Record<DashboardSocialPlatform, string | null>> = {};
    for (const row of data || []) {
      const p = row.platform as DashboardSocialPlatform;
      if (PLATFORMS.includes(p)) {
        next[p] = row.platform_username ?? null;
      }
    }
    setUsernames(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  function isConnected(platform: DashboardSocialPlatform): boolean {
    return platform in usernames;
  }

  function displayUsername(platform: DashboardSocialPlatform): string | null {
    const u = usernames[platform];
    if (u == null || u === '') return null;
    return u.startsWith('@') ? u : `@${u}`;
  }

  return { usernames, loading, refetch, isConnected, displayUsername };
}
