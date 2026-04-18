import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { supabase } from '@/shared/infrastructure/supabase';
import type { CampaignData } from '@/enterprise/components/CampaignCard';

/**
 * Liste « Enregistré » **entreprise uniquement** : colonne `profiles.enterprise_saved_campaign_ids`.
 * Ne pas mélanger avec `saved_campaign_ids` (app créateur) — deux flux séparés pour le même compte ou des comptes différents.
 */
function normId(id: string): string {
  return id.trim().toLowerCase();
}

function previewStorageKey(uid: string): string {
  return `graply_enterprise_saved_previews_${uid}`;
}

function readPreviewMap(uid: string): Record<string, CampaignData> {
  try {
    const raw = sessionStorage.getItem(previewStorageKey(uid));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, CampaignData>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writePreviewMap(uid: string, map: Record<string, CampaignData>) {
  try {
    sessionStorage.setItem(previewStorageKey(uid), JSON.stringify(map));
  } catch {
    /* quota / private mode */
  }
}

interface SavedCampaignsContextValue {
  savedIds: string[];
  previewById: Record<string, CampaignData>;
  toggle: (id: string, preview?: CampaignData) => void;
  isSaved: (id: string) => boolean;
  reload: () => Promise<void>;
}

const SavedCampaignsContext = createContext<SavedCampaignsContextValue | null>(null);

async function resolveUserId(existing: string | null): Promise<string | null> {
  if (existing) return existing;
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

export function SavedCampaignsProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [previewById, setPreviewById] = useState<Record<string, CampaignData>>({});
  const userIdRef = useRef<string | null>(null);

  const loadSaved = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('enterprise_saved_campaign_ids')
      .eq('id', uid)
      .maybeSingle();
    const next = data?.enterprise_saved_campaign_ids;
    const ids = Array.isArray(next) ? next.map((s) => String(s).trim()) : [];
    setSavedIds(ids);
    const stored = readPreviewMap(uid);
    setPreviewById((prev) => {
      const merged: Record<string, CampaignData> = {};
      for (const raw of ids) {
        const k = normId(raw);
        if (prev[k]) merged[k] = prev[k];
        else if (stored[k]) merged[k] = stored[k];
      }
      writePreviewMap(uid, merged);
      return merged;
    });
  }, []);

  const reload = useCallback(async () => {
    const uid = await resolveUserId(userIdRef.current);
    userIdRef.current = uid;
    if (uid) await loadSaved(uid);
    else {
      setSavedIds([]);
      setPreviewById({});
    }
  }, [loadSaved]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id ?? null;
      userIdRef.current = uid;
      if (uid) void loadSaved(uid);
      else {
        setSavedIds([]);
        setPreviewById({});
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      userIdRef.current = uid;
      if (uid) void loadSaved(uid);
      else {
        setSavedIds([]);
        setPreviewById({});
      }
    });

    return () => subscription.unsubscribe();
  }, [loadSaved]);

  async function persistSaved(uid: string, newIds: string[]) {
    const { error } = await supabase
      .from('profiles')
      .update({ enterprise_saved_campaign_ids: newIds })
      .eq('id', uid);
    if (error) {
      console.error('[Enterprise SavedCampaigns] persist failed', error);
      await loadSaved(uid);
    }
  }

  function syncPreviewStorage(uid: string, map: Record<string, CampaignData>) {
    writePreviewMap(uid, map);
  }

  const isSaved = useCallback(
    (id: string) => savedIds.some((sid) => normId(sid) === normId(id)),
    [savedIds],
  );

  const toggle = useCallback((id: string, preview?: CampaignData) => {
    void (async () => {
      const uid = await resolveUserId(userIdRef.current);
      userIdRef.current = uid;
      if (!uid) return;
      const key = normId(id);
      setSavedIds((prev) => {
        const has = prev.some((sid) => normId(sid) === key);
        const next = has ? prev.filter((sid) => normId(sid) !== key) : [...prev, id.trim()];
        const removing = has;
        queueMicrotask(() => {
          setPreviewById((previews) => {
            if (removing) {
              const { [key]: _removed, ...rest } = previews;
              syncPreviewStorage(uid, rest);
              return rest;
            }
            if (preview) {
              const merged = { ...previews, [key]: preview };
              syncPreviewStorage(uid, merged);
              return merged;
            }
            return previews;
          });
          void persistSaved(uid, next);
        });
        return next;
      });
    })();
  }, [loadSaved]);

  return (
    <SavedCampaignsContext.Provider value={{ savedIds, previewById, toggle, isSaved, reload }}>
      {children}
    </SavedCampaignsContext.Provider>
  );
}

export function useSavedCampaigns() {
  const ctx = useContext(SavedCampaignsContext);
  if (!ctx) throw new Error('useSavedCampaigns must be used within SavedCampaignsProvider');
  return ctx;
}
