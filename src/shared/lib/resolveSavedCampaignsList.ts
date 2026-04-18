import { supabase } from '@/shared/infrastructure/supabase';
import { campaigns, sponsoredCampaigns } from '@/shared/data/campaignsData';
import {
  mapSupabaseCampaign,
  enrichCampaignsWithProfiles,
  CAMPAIGN_DB_SELECT_COLUMNS,
} from '@/shared/lib/mapSupabaseCampaign';
import type { CampaignData } from '@/creator/components/CampaignCard';
import type { SupabaseCampaign } from '@/shared/lib/mapSupabaseCampaign';

const staticPool = [...campaigns, ...sponsoredCampaigns];

const inFlight = new Map<string, Promise<CampaignData[]>>();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function cacheKey(ids: string[]): string {
  return [...new Set(ids.map((s) => String(s).trim().toLowerCase()))].sort().join('\0');
}

/** UUID uniques (ordre conservé) pour la requête `campaigns`. Les autres ids viennent du pool statique. */
function uniqueCampaignUuids(rawIds: string[]): string[] {
  const seen = new Set<string>();
  const uuids: string[] = [];
  for (const raw of rawIds) {
    const s = String(raw).trim();
    if (!s || !UUID_RE.test(s)) continue;
    const k = s.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    uuids.push(s);
  }
  return uuids;
}

async function fetchCampaignRowsFromDb(uuids: string[]): Promise<SupabaseCampaign[]> {
  if (uuids.length === 0) return [];

  const { data, error } = await supabase.from('campaigns').select(CAMPAIGN_DB_SELECT_COLUMNS).in('id', uuids);
  const initial = (data ?? []) as SupabaseCampaign[];
  const byId = new Map(initial.map((r) => [String(r.id).toLowerCase(), r as SupabaseCampaign]));

  const needFallback = Boolean(error) || initial.length < uuids.length;
  if (needFallback) {
    if (error) {
      console.warn('[resolveSavedCampaignsList] batch .in failed, fallback per id', error.message);
    }
    for (const id of uuids) {
      const k = id.toLowerCase();
      if (byId.has(k)) continue;
      const { data: one, error: oneErr } = await supabase
        .from('campaigns')
        .select(CAMPAIGN_DB_SELECT_COLUMNS)
        .eq('id', id)
        .maybeSingle();
      if (oneErr) {
        console.warn('[resolveSavedCampaignsList] single fetch failed', id, oneErr.message);
        continue;
      }
      if (one) byId.set(String(one.id).toLowerCase(), one as SupabaseCampaign);
    }
  }

  return uuids.map((id) => byId.get(id.toLowerCase())).filter(Boolean) as SupabaseCampaign[];
}

async function fetchResolvedList(savedIds: string[]): Promise<CampaignData[]> {
  if (savedIds.length === 0) return [];

  const uuids = uniqueCampaignUuids(savedIds);

  const dbRows = await fetchCampaignRowsFromDb(uuids);
  const enriched = await enrichCampaignsWithProfiles(dbRows);
  const idToCard = new Map(
    enriched.map((c) => [String(c.id).toLowerCase(), mapSupabaseCampaign(c as SupabaseCampaign)]),
  );

  const fromDbOrdered = uuids.map((id) => idToCard.get(id.toLowerCase())).filter(Boolean) as CampaignData[];

  const dbIdSet = new Set(fromDbOrdered.map((c) => c.id.toLowerCase()));
  const savedLower = new Set(savedIds.map((s) => String(s).trim().toLowerCase()));
  const fromStatic = staticPool.filter(
    (c) => savedLower.has(c.id.toLowerCase()) && !dbIdSet.has(c.id.toLowerCase()),
  );

  return [...fromDbOrdered, ...fromStatic];
}

/**
 * Campagnes correspondant aux IDs sauvegardés : base Supabase (UUID), puis entrées statiques.
 */
export function resolveSavedCampaignsList(savedIds: string[]): Promise<CampaignData[]> {
  if (savedIds.length === 0) return Promise.resolve([]);

  const key = cacheKey(savedIds);
  let p = inFlight.get(key);
  if (!p) {
    p = fetchResolvedList(savedIds).finally(() => {
      queueMicrotask(() => inFlight.delete(key));
    });
    inFlight.set(key, p);
  }
  return p;
}

/** Préchargement au survol du menu (même promesse dédupliquée que la page). */
export function prefetchSavedCampaignsList(savedIds: string[]): void {
  if (savedIds.length === 0) return;
  void resolveSavedCampaignsList(savedIds);
}

/** Même clé que `normId` côté contexte enregistré (UUID / ids statiques). */
export function normSavedCampaignId(id: string): string {
  return String(id).trim().toLowerCase();
}

/**
 * Ordonne comme `savedIds` : priorité aux données résolues (Supabase + statique),
 * sinon aperçu enregistré au moment du bookmark (pour ne jamais perdre l’affichage).
 * Générique pour réutiliser côté app créateur et app entreprise (même forme de carte).
 */
export function mergeSavedCampaignsInOrder<T extends { id: string }>(
  savedIds: string[],
  resolved: T[],
  previews: Record<string, T | undefined>,
): T[] {
  const byResolved = new Map(resolved.map((c) => [normSavedCampaignId(c.id), c]));
  return savedIds
    .map((raw) => {
      const k = normSavedCampaignId(raw);
      return byResolved.get(k) ?? previews[k];
    })
    .filter((c): c is T => c != null);
}
