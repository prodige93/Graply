import { supabase } from '@/shared/infrastructure/supabase';

/** Ligne factice « créateur » sur le dashboard entreprise (aperçu — pas un profil Supabase réel). */
export const ENTERPRISE_DEMO_CREATOR_USER_ID = '__graply-demo-creator__' as const;

export interface VideoSubmissionRow {
  id: string;
  user_id: string;
  campaign_id: string;
  campaign_name: string;
  platform: string;
  video_url: string;
  submitted_at: string;
  status: string;
  view_count: number | null;
  payout_amount: number | null;
  /** Titre libre ; vide en base → libellé dérivé côté UI. */
  video_title?: string | null;
}

/** Candidature acceptée sur une de vos campagnes (toute campagne où vous êtes propriétaire). */
export interface PrivateApplicationAcceptedRow {
  user_id: string;
  campaign_id: string;
  created_at: string;
}

export interface ProfileRow {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  youtube_handle: string | null;
}

export interface AcceptedCreatorSummary {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  instagramHandle: string;
  tiktokHandle: string;
  youtubeHandle: string;
  /** A participé à au moins une campagne / vidéo liée au type UGC (côté marque). */
  hasUgc: boolean;
  /** A participé à au moins une campagne / vidéo liée au clipping (type contenant « clip »). */
  hasClipping: boolean;
  /** Dernière activité (soumission vidéo ou candidature acceptée), pour tri « Date ». */
  lastActivityAt: string | null;
  /** Vidéos approuvées (campagnes non strictement privées : `is_public !== false`). */
  totalVideos: number;
  totalViews: number;
  totalPayout: number;
  /** Nombre de campagnes où une candidature a été acceptée (y compris campagne privée / candidature seule). */
  privateAcceptances: number;
}

function normalizeHandle(h: string | null | undefined): string {
  const t = (h ?? '').trim();
  return t;
}

function isPrivateCampaign(isPublic: boolean | null | undefined): boolean {
  return isPublic === false;
}

/**
 * Créateurs liés à vos campagnes :
 * - **Toute** candidature `campaign_applications.status = accepted` sur **vos** campagnes (sync avec la validation créateurs, même `require_review` / `require_application` sans `is_public` à jour en base).
 * - **Vidéo** `video_submissions.status = approved` sur les campagnes avec `is_public !== false`.
 */
export async function fetchAcceptedCreatorsSummary(): Promise<{
  creators: AcceptedCreatorSummary[];
  submissions: VideoSubmissionRow[];
  privateApplications: PrivateApplicationAcceptedRow[];
  campaignNames: Map<string, string>;
  /** `true` = campagne publique (`is_public !== false`), `false` = strictement privée. */
  campaignIsPublicById: Map<string, boolean>;
}> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) {
    return {
      creators: [],
      submissions: [],
      privateApplications: [],
      campaignNames: new Map(),
      campaignIsPublicById: new Map(),
    };
  }

  const { data: myCampaigns, error: campErr } = await supabase
    .from('campaigns')
    .select('id, name, is_public, content_type')
    .eq('user_id', uid);

  if (campErr || !myCampaigns?.length) {
    return {
      creators: [],
      submissions: [],
      privateApplications: [],
      campaignNames: new Map(),
      campaignIsPublicById: new Map(),
    };
  }

  const campaignNames = new Map<string, string>();
  const campaignIsPublicById = new Map<string, boolean>();
  const allCampIdStrings: string[] = [];
  const publicIdStrings: string[] = [];

  const campaignContentById = new Map<string, string>();
  for (const c of myCampaigns as { id: string; name: string; is_public?: boolean | null; content_type?: string | null }[]) {
    const sid = String(c.id);
    campaignNames.set(sid, c.name);
    campaignIsPublicById.set(sid, !isPrivateCampaign(c.is_public));
    campaignContentById.set(sid, (c.content_type ?? '').trim());
    allCampIdStrings.push(sid);
    if (!isPrivateCampaign(c.is_public)) publicIdStrings.push(sid);
  }

  const inferContentFlags = (raw: string): { ugc: boolean; clipping: boolean } => {
    const lower = raw.toLowerCase().trim();
    const clipping =
      lower.includes('clipping') ||
      lower === 'clip' ||
      lower.startsWith('clip ') ||
      lower.endsWith(' clip') ||
      lower.includes(' clip ');
    return {
      ugc: lower.includes('ugc'),
      clipping,
    };
  };

  const userContentFlags = new Map<string, { ugc: boolean; clipping: boolean }>();
  const mergeFlags = (userId: string, raw: string) => {
    const add = inferContentFlags(raw);
    const cur = userContentFlags.get(userId) ?? { ugc: false, clipping: false };
    userContentFlags.set(userId, { ugc: cur.ugc || add.ugc, clipping: cur.clipping || add.clipping });
  };

  let rows: VideoSubmissionRow[] = [];
  if (publicIdStrings.length > 0) {
    const { data: subs, error: subErr } = await supabase
      .from('video_submissions')
      .select(
        'id, user_id, campaign_id, campaign_name, platform, video_url, submitted_at, status, view_count, payout_amount, video_title',
      )
      .eq('status', 'approved')
      .in('campaign_id', publicIdStrings);
    if (!subErr && subs?.length) rows = subs as VideoSubmissionRow[];
  }

  let privateApps: PrivateApplicationAcceptedRow[] = [];
  if (allCampIdStrings.length > 0) {
    const { data: apps, error: appErr } = await supabase
      .from('campaign_applications')
      .select('user_id, campaign_id, created_at')
      .eq('status', 'accepted')
      .in('campaign_id', allCampIdStrings);
    if (!appErr && apps?.length) {
      privateApps = (apps as { user_id: string; campaign_id: string; created_at: string }[]).map((a) => ({
        user_id: a.user_id,
        campaign_id: String(a.campaign_id),
        created_at: a.created_at,
      }));
    }
  }

  if (rows.length === 0 && privateApps.length === 0) {
    return { creators: [], submissions: [], privateApplications: [], campaignNames, campaignIsPublicById };
  }

  const userIdSet = new Set<string>();
  rows.forEach((r) => userIdSet.add(r.user_id));
  privateApps.forEach((a) => userIdSet.add(a.user_id));
  const userIds = [...userIdSet];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, instagram_handle, tiktok_handle, youtube_handle')
    .in('id', userIds);

  const profileMap = new Map<string, ProfileRow>();
  (profiles as ProfileRow[] | null)?.forEach((p) => profileMap.set(p.id, p));

  const byUserSubs = new Map<string, VideoSubmissionRow[]>();
  for (const r of rows) {
    const list = byUserSubs.get(r.user_id) ?? [];
    list.push(r);
    byUserSubs.set(r.user_id, list);
  }

  const privateCountByUser = new Map<string, number>();
  const lastPrivateAppAtByUser = new Map<string, string>();
  for (const a of privateApps) {
    privateCountByUser.set(a.user_id, (privateCountByUser.get(a.user_id) ?? 0) + 1);
    const prev = lastPrivateAppAtByUser.get(a.user_id);
    if (!prev || a.created_at > prev) lastPrivateAppAtByUser.set(a.user_id, a.created_at);
  }

  for (const r of rows) {
    mergeFlags(r.user_id, campaignContentById.get(String(r.campaign_id)) ?? '');
  }
  for (const a of privateApps) {
    mergeFlags(a.user_id, campaignContentById.get(String(a.campaign_id)) ?? '');
  }

  const creators: AcceptedCreatorSummary[] = [];
  for (const userId of userIds) {
    const list = byUserSubs.get(userId) ?? [];
    const privateAcceptances = privateCountByUser.get(userId) ?? 0;
    if (list.length === 0 && privateAcceptances === 0) continue;

    const p = profileMap.get(userId);
    const username = p?.username ?? 'createur';
    const displayName = (p?.display_name ?? '').trim() || username;
    const flags = userContentFlags.get(userId) ?? { ugc: false, clipping: false };
    let lastActivityAt: string | null = null;
    for (const v of list) {
      if (!lastActivityAt || v.submitted_at > lastActivityAt) lastActivityAt = v.submitted_at;
    }
    const lastPrivate = lastPrivateAppAtByUser.get(userId);
    if (lastPrivate && (!lastActivityAt || lastPrivate > lastActivityAt)) lastActivityAt = lastPrivate;

    creators.push({
      userId,
      username,
      displayName,
      avatarUrl: p?.avatar_url ?? null,
      instagramHandle: normalizeHandle(p?.instagram_handle),
      tiktokHandle: normalizeHandle(p?.tiktok_handle),
      youtubeHandle: normalizeHandle(p?.youtube_handle),
      hasUgc: flags.ugc,
      hasClipping: flags.clipping,
      lastActivityAt,
      totalVideos: list.length,
      totalViews: list.reduce((s, v) => s + (Number(v.view_count) || 0), 0),
      totalPayout: list.reduce((s, v) => s + (Number(v.payout_amount) || 0), 0),
      privateAcceptances,
    });
  }

  creators.sort(
    (a, b) =>
      b.totalPayout - a.totalPayout ||
      b.totalViews - a.totalViews ||
      b.privateAcceptances - a.privateAcceptances ||
      a.username.localeCompare(b.username),
  );

  return { creators, submissions: rows, privateApplications: privateApps, campaignNames, campaignIsPublicById };
}
