import { useState, useEffect, useMemo, useCallback, useId } from 'react';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { CampaignData } from '@/creator/components/CampaignCard';
import { supabase } from '@/shared/infrastructure/supabase';
import {
  mapSupabaseCampaign,
  enrichCampaignsWithProfiles,
  type SupabaseCampaign,
} from '@/shared/lib/mapSupabaseCampaign';

type RowMeta = { campaign: CampaignData; createdAtMs: number };

function toMetaList(enriched: (SupabaseCampaign & { profiles?: SupabaseCampaign['profiles'] })[]): RowMeta[] {
  return enriched.map((r) => ({
    campaign: mapSupabaseCampaign(r),
    createdAtMs: new Date(r.created_at ?? 0).getTime(),
  }));
}

function sortMetaDesc(rows: RowMeta[]): RowMeta[] {
  return [...rows].sort((a, b) => b.createdAtMs - a.createdAtMs);
}

/** Liste des campagnes publiées + mise à jour instantanée (Supabase Realtime). */
export function usePublishedCampaignsFeed(): CampaignData[] {
  const [rows, setRows] = useState<RowMeta[]>([]);
  const channelSuffix = useId().replace(/:/g, '');

  const loadPublished = useCallback(async () => {
    const { data } = await supabase
      .from('campaigns')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });
    if (!data) return;
    const enriched = await enrichCampaignsWithProfiles(data as SupabaseCampaign[]);
    setRows(sortMetaDesc(toMetaList(enriched as SupabaseCampaign[])));
  }, []);

  const applyRealtimePayload = useCallback(
    async (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      if (payload.eventType === 'DELETE') {
        const id = (payload.old as { id?: string } | null)?.id;
        if (id) setRows((prev) => prev.filter((r) => r.campaign.id !== id));
        return;
      }

      const raw = payload.new as unknown as SupabaseCampaign | null;
      if (!raw?.id) return;

      if (raw.status !== 'published') {
        setRows((prev) => prev.filter((r) => r.campaign.id !== raw.id));
        return;
      }

      const hasCoreFields =
        typeof raw.name === 'string' &&
        typeof raw.budget === 'string' &&
        typeof raw.content_type === 'string' &&
        typeof raw.information === 'string';

      let row: SupabaseCampaign = raw;
      if (!hasCoreFields) {
        const { data: full, error } = await supabase.from('campaigns').select('*').eq('id', raw.id).maybeSingle();
        if (error || !full) {
          await loadPublished();
          return;
        }
        row = full as SupabaseCampaign;
        if (row.status !== 'published') {
          setRows((prev) => prev.filter((r) => r.campaign.id !== row.id));
          return;
        }
      }

      const [enriched] = await enrichCampaignsWithProfiles([row]);
      const mapped = mapSupabaseCampaign(enriched as SupabaseCampaign);
      const createdAtMs = new Date(row.created_at ?? 0).getTime();
      setRows((prev) => {
        const rest = prev.filter((r) => r.campaign.id !== mapped.id);
        return sortMetaDesc([...rest, { campaign: mapped, createdAtMs }]);
      });
    },
    [loadPublished],
  );

  useEffect(() => {
    void loadPublished();

    const channel = supabase
      .channel(`published-campaigns-feed-${channelSuffix}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'campaigns' },
        (payload) => {
          void applyRealtimePayload(payload);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadPublished, applyRealtimePayload, channelSuffix]);

  return useMemo(() => rows.map((r) => r.campaign), [rows]);
}
