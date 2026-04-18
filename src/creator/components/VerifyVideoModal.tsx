import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight, Trash2, Plus, ChevronLeft } from 'lucide-react';
import { supabase } from '@/shared/infrastructure/supabase';
import { getCreatorCampaigns, getPendingApplications, getSubmittedVideos } from '@/shared/lib/useCreatorCampaigns';
import { campaigns as staticCampaigns, sponsoredCampaigns } from '@/shared/data/campaignsData';
import { normalizeStringArray } from '@/shared/lib/mapSupabaseCampaign';
import {
  loadVerifyModalHiddenCampaignIds,
  saveVerifyModalHiddenCampaignIds,
} from '@/shared/lib/verifyModalHiddenCampaigns';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';
import GrapeLoader from './GrapeLoader';

const platformIconMap: Record<string, string> = {
  instagram: instagramIcon,
  tiktok: tiktokIcon,
  youtube: youtubeIcon,
};

const allStaticPool = [...staticCampaigns, ...sponsoredCampaigns];

interface CampaignItem {
  id: string;
  name: string;
  brand: string;
  photo: string;
  platforms: string[];
  pendingCount: number;
  source: 'saved' | 'accepted' | 'submitted';
}

interface Props {
  onClose: () => void;
  hidePendingBadges?: boolean;
}

function mergePool(
  accepted: CampaignItem[],
  saved: CampaignItem[],
  submitted: CampaignItem[],
): CampaignItem[] {
  const seen = new Set<string>();
  const out: CampaignItem[] = [];
  for (const c of accepted) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    out.push(c);
  }
  for (const c of saved) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    out.push(c);
  }
  for (const c of submitted) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    out.push(c);
  }
  return out;
}

const glassSquareBtn =
  'w-9 h-9 shrink-0 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-white/[0.08] active:scale-95';

const glassSquareStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.14)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 20px rgba(0,0,0,0.25)',
};

export default function VerifyVideoModal({ onClose, hidePendingBadges = false }: Props) {
  const navigate = useNavigate();
  const [pool, setPool] = useState<CampaignItem[]>([]);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => loadVerifyModalHiddenCampaignIds());
  const [loading, setLoading] = useState(true);
  const [addPanelOpen, setAddPanelOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        const localActive = getCreatorCampaigns().filter((c) => c.status === 'active');
        const localAccepted = getPendingApplications()
          .filter((a) => a.status === 'accepted')
          .map((a) => ({
            id: a.id,
            name: a.name,
            brand: a.brand,
            photo: a.photo,
            platforms: a.platforms,
            pendingCount: 0,
            source: 'accepted' as const,
          }));

        const activeItems: CampaignItem[] = localActive.map((c) => ({
          id: c.id,
          name: c.name,
          brand: c.brand,
          photo: c.photo,
          platforms: c.platforms,
          pendingCount: 0,
          source: 'accepted' as const,
        }));

        const seenAccepted = new Set(activeItems.map((c) => c.id));
        const dedupedAccepted = [...activeItems, ...localAccepted.filter((a) => !seenAccepted.has(a.id))];

        const localVideos = getSubmittedVideos();
        const seenAll = new Set(dedupedAccepted.map((c) => c.id));
        const localSubmitted: CampaignItem[] = [];
        const seenSubmitted = new Set<string>();
        for (const v of localVideos) {
          if (!seenAll.has(v.campaignId) && !seenSubmitted.has(v.campaignId)) {
            seenSubmitted.add(v.campaignId);
            const staticC = allStaticPool.find((c) => c.id === v.campaignId);
            localSubmitted.push({
              id: v.campaignId,
              name: v.campaignName,
              brand: v.brand,
              photo: staticC?.image ?? v.campaignPhoto,
              platforms: staticC?.socials ?? [],
              pendingCount: 0,
              source: 'submitted' as const,
            });
          }
        }

        setPool(mergePool(dedupedAccepted, [], localSubmitted));
        setLoading(false);
        return;
      }

      const [appsResult, savedResult, allVideosResult] = await Promise.all([
        supabase
          .from('campaign_applications')
          .select('campaign_id, campaigns(id, name, photo_url, platforms, user_id)')
          .eq('user_id', user.id)
          .eq('status', 'accepted'),
        supabase
          .from('profiles')
          .select('saved_campaign_ids')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('video_submissions')
          .select('campaign_id, campaign_name, brand, campaign_photo')
          .eq('user_id', user.id),
      ]);

      const pendingCounts: Record<string, number> = {};
      if (allVideosResult.data) {
        allVideosResult.data.forEach((row) => {
          pendingCounts[row.campaign_id] = (pendingCounts[row.campaign_id] ?? 0) + 1;
        });
      }

      const acceptedItems: CampaignItem[] = ((appsResult.data ?? []) as unknown as Array<{
        campaign_id: string;
        campaigns: { id: string; name: string; photo_url: string | null; platforms: unknown; user_id: string } | null;
      }>)
        .filter((a) => a.campaigns)
        .map((a) => {
          const c = a.campaigns!;
          return {
            id: c.id,
            name: c.name,
            brand: '',
            photo: c.photo_url ?? '',
            platforms: normalizeStringArray(c.platforms),
            pendingCount: pendingCounts[c.id] ?? 0,
            source: 'accepted' as const,
          };
        });

      const savedIds: string[] = Array.isArray(savedResult.data?.saved_campaign_ids)
        ? (savedResult.data.saved_campaign_ids as string[])
        : [];
      const acceptedIds = new Set(acceptedItems.map((c) => c.id));

      let savedItems: CampaignItem[] = [];
      if (savedIds.length > 0) {
        const { data: dbSaved } = await supabase
          .from('campaigns')
          .select('id, name, photo_url, platforms')
          .in('id', savedIds);

        const dbSavedItems: CampaignItem[] = (dbSaved ?? []).map((c) => ({
          id: c.id,
          name: c.name,
          brand: '',
          photo: c.photo_url ?? '',
          platforms: normalizeStringArray(c.platforms),
          pendingCount: pendingCounts[c.id] ?? 0,
          source: 'saved' as const,
        }));

        const staticSavedItems: CampaignItem[] = allStaticPool
          .filter((c) => savedIds.includes(c.id))
          .map((c) => ({
            id: c.id,
            name: c.title,
            brand: c.brand,
            photo: c.image,
            platforms: c.socials ?? [],
            pendingCount: pendingCounts[c.id] ?? 0,
            source: 'saved' as const,
          }));

        const dbIds = new Set(dbSavedItems.map((c) => c.id));
        const combined = [...dbSavedItems, ...staticSavedItems.filter((c) => !dbIds.has(c.id))];
        savedItems = combined.filter((c) => !acceptedIds.has(c.id));
      }

      const allKnownIds = new Set([...acceptedIds, ...savedIds]);
      const submittedSeenIds = new Set<string>();
      const submittedItems: CampaignItem[] = [];

      (allVideosResult.data ?? []).forEach((row) => {
        const cid = row.campaign_id;
        if (!allKnownIds.has(cid) && !submittedSeenIds.has(cid)) {
          submittedSeenIds.add(cid);
          const staticC = allStaticPool.find((s) => s.id === cid);
          submittedItems.push({
            id: cid,
            name: row.campaign_name ?? staticC?.title ?? cid,
            brand: row.brand ?? '',
            photo: row.campaign_photo ?? staticC?.image ?? '',
            platforms: staticC?.socials ?? [],
            pendingCount: pendingCounts[cid] ?? 0,
            source: 'submitted' as const,
          });
        }
      });

      setPool(mergePool(acceptedItems, savedItems, submittedItems));
      setLoading(false);
    })();
  }, []);

  const visibleCampaigns = useMemo(
    () => pool.filter((c) => !hiddenIds.has(c.id)),
    [pool, hiddenIds],
  );

  const hiddenCampaigns = useMemo(
    () => pool.filter((c) => hiddenIds.has(c.id)),
    [pool, hiddenIds],
  );

  const persistHidden = (next: Set<string>) => {
    saveVerifyModalHiddenCampaignIds(next);
    setHiddenIds(next);
  };

  const handleSelect = (id: string) => {
    onClose();
    navigate(`/campagne/${id}/verification`);
  };

  /** Retire uniquement de cette modale (pas de suppression candidature / video / enregistre en base). */
  const handleHideFromList = (campaign: CampaignItem) => {
    const next = new Set(hiddenIds);
    next.add(campaign.id);
    persistHidden(next);
  };

  const handleRestore = (campaignId: string) => {
    const next = new Set(hiddenIds);
    next.delete(campaignId);
    persistHidden(next);
  };

  const isTotallyEmpty = !loading && pool.length === 0;
  const isMainEmptyVisible = !loading && pool.length > 0 && visibleCampaigns.length === 0;

  const modal = (
    <div
      className="fixed inset-0 z-[280] flex items-end sm:items-center justify-center p-0 sm:p-6 pointer-events-auto"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden relative z-[1] pointer-events-auto"
        style={{
          background: 'rgba(255,255,255,0.055)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.9)',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Verifier ma video"
      >
        <div
          className="flex items-center justify-between gap-3 px-4 sm:px-6 pt-6 pb-4 relative z-10"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          {addPanelOpen ? (
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <button
                type="button"
                onClick={() => setAddPanelOpen(false)}
                className={`${glassSquareBtn} shrink-0`}
                style={glassSquareStyle}
                aria-label="Retour"
              >
                <ChevronLeft className="w-4 h-4 text-white/85" />
              </button>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-white truncate">Ajouter une campagne</h2>
                <p className="text-xs text-white/40 mt-0.5 truncate">Campagnes masquees — touche pour reafficher</p>
              </div>
            </div>
          ) : (
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-white">Verifier ma video</h2>
              <p className="text-xs text-white/40 mt-0.5">Acceptees, video envoyee, enregistrees</p>
            </div>
          )}
          <div className="flex items-center gap-2 shrink-0 relative z-20">
            {!addPanelOpen && pool.length > 0 && (
              <button
                type="button"
                onClick={() => setAddPanelOpen(true)}
                className={glassSquareBtn}
                style={glassSquareStyle}
                title="Rajouter une campagne masquee"
                aria-label="Rajouter une campagne"
              >
                <Plus className="w-4 h-4 text-white/90" strokeWidth={2.5} />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onClose();
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-white/10 touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              aria-label="Fermer"
            >
              <X className="w-5 h-5 text-white/80" />
            </button>
          </div>
        </div>

        <div className="px-4 py-3 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <GrapeLoader size="md" />
            </div>
          ) : addPanelOpen ? (
            hiddenCampaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <p className="text-sm text-white/35 text-center">Aucune campagne masquee pour l&apos;instant.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {hiddenCampaigns.map((c) => (
                  <RestoreRow
                    key={c.id}
                    campaign={c}
                    hidePendingBadges={hidePendingBadges}
                    onRestore={() => handleRestore(c.id)}
                  />
                ))}
              </div>
            )
          ) : isTotallyEmpty ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <p className="text-sm text-white/30 text-center">
                Aucune campagne ici.<br />
                Postule et sois accepte, envoie une video, ou enregistre une campagne.
              </p>
            </div>
          ) : isMainEmptyVisible ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 px-2">
              <p className="text-sm text-white/40 text-center">
                Toutes les campagnes sont masquees. Touche le bouton + en haut a droite pour les rajouter.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {visibleCampaigns.map((c) => (
                <CampaignRow
                  key={c.id}
                  campaign={c}
                  hidePendingBadges={hidePendingBadges}
                  onSelect={handleSelect}
                  onRemove={handleHideFromList}
                />
              ))}
            </div>
          )}
        </div>

        <div className="hidden sm:block h-5" />
        <div className="block sm:hidden" style={{ height: 'calc(5rem + env(safe-area-inset-bottom))' }} />
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
}

function CampaignRow({ campaign, hidePendingBadges, onSelect, onRemove }: {
  campaign: CampaignItem;
  hidePendingBadges: boolean;
  onSelect: (id: string) => void;
  onRemove: (campaign: CampaignItem) => void;
}) {
  const rowHeightClass = 'h-[4.75rem] min-h-[4.75rem] max-h-[4.75rem]';

  return (
    <div className={`flex items-center gap-2 ${rowHeightClass}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(campaign);
        }}
        className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 self-center"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(12px)',
        }}
        title="Masquer de cette liste"
        aria-label="Masquer de la liste"
      >
        <Trash2 className="w-3.5 h-3.5 text-white/40" />
      </button>
      <button
        type="button"
        title={campaign.name}
        onClick={() => onSelect(campaign.id)}
        className={`flex-1 min-w-0 flex items-center gap-3 px-3 rounded-xl transition-all duration-200 text-left group hover:scale-[1.01] active:scale-[0.98] overflow-hidden ${rowHeightClass}`}
        style={{
          background: 'rgba(255,255,255,0.055)',
          border: '1px solid rgba(255,255,255,0.10)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.2)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.10)'; }}
      >
        <img
          src={campaign.photo}
          alt=""
          className="w-11 h-11 rounded-xl object-cover shrink-0"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        />
        <div className="flex-1 min-w-0 overflow-hidden flex flex-col justify-center gap-1">
          <p className="text-sm font-semibold text-white truncate whitespace-nowrap overflow-hidden text-ellipsis">{campaign.name}</p>
          <div className="flex items-center shrink-0 overflow-hidden" style={{ gap: 0 }}>
            {campaign.platforms.filter((p) => platformIconMap[p]).map((p, i, arr) => (
              <div key={p} style={{
                width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(20,20,28,0.72)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
                marginLeft: i === 0 ? 0 : -7, zIndex: arr.length - i, position: 'relative' as const,
              }}>
                <img src={platformIconMap[p]} alt={p} style={{ width: 10, height: 10, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.8 }} />
              </div>
            ))}
          </div>
        </div>
        {!hidePendingBadges && campaign.pendingCount > 0 && (
          <span
            className="text-[9px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
            style={{ background: 'rgba(255,166,114,0.12)', color: '#FFA672', border: '1px solid rgba(255,166,114,0.25)' }}
          >
            video en attente
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
      </button>
    </div>
  );
}

function RestoreRow({ campaign, hidePendingBadges, onRestore }: {
  campaign: CampaignItem;
  hidePendingBadges: boolean;
  onRestore: () => void;
}) {
  const rowHeightClass = 'h-[4.75rem] min-h-[4.75rem] max-h-[4.75rem]';

  return (
    <div className={`flex items-center gap-2 ${rowHeightClass}`}>
      <button
        type="button"
        onClick={onRestore}
        className={`${glassSquareBtn} self-center`}
        style={glassSquareStyle}
        title="Rajouter a la liste"
        aria-label="Rajouter"
      >
        <Plus className="w-4 h-4 text-white/90" strokeWidth={2.5} />
      </button>
      <button
        type="button"
        onClick={onRestore}
        className={`flex-1 min-w-0 flex items-center gap-3 px-3 rounded-xl transition-all duration-200 text-left group hover:scale-[1.01] active:scale-[0.98] overflow-hidden ${rowHeightClass}`}
        style={{
          background: 'rgba(255,255,255,0.055)',
          border: '1px solid rgba(255,255,255,0.10)',
        }}
      >
        <img
          src={campaign.photo}
          alt=""
          className="w-11 h-11 rounded-xl object-cover shrink-0"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        />
        <div className="flex-1 min-w-0 overflow-hidden flex flex-col justify-center gap-1">
          <p className="text-sm font-semibold text-white truncate whitespace-nowrap overflow-hidden text-ellipsis">{campaign.name}</p>
          <div className="flex items-center shrink-0 overflow-hidden" style={{ gap: 0 }}>
            {campaign.platforms.filter((p) => platformIconMap[p]).map((p, i, arr) => (
              <div key={p} style={{
                width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(20,20,28,0.72)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
                marginLeft: i === 0 ? 0 : -7, zIndex: arr.length - i, position: 'relative' as const,
              }}>
                <img src={platformIconMap[p]} alt={p} style={{ width: 10, height: 10, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.8 }} />
              </div>
            ))}
          </div>
        </div>
        {!hidePendingBadges && campaign.pendingCount > 0 && (
          <span
            className="text-[9px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
            style={{ background: 'rgba(255,166,114,0.12)', color: '#FFA672', border: '1px solid rgba(255,166,114,0.25)' }}
          >
            video en attente
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
      </button>
    </div>
  );
}
