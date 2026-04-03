export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube';

/** Séparateur dans `state` OAuth : plateforme + origine (base64url) pour que redirect.html sur Supabase renvoie vers localhost ou la prod. */
const OAUTH_STATE_ORIGIN_SEP = '.';

function oauthStateWithReturnOrigin(platform: SocialPlatform): string {
  if (typeof window === 'undefined') return platform;
  try {
    const o = window.location.origin;
    if (!o) return platform;
    const b64 = btoa(o).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return `${platform}${OAUTH_STATE_ORIGIN_SEP}${b64}`;
  } catch {
    return platform;
  }
}

/** Extrait la plateforme depuis `state` (ancien format `instagram` ou `instagram.<base64url(origin)>`). */
export function parseOAuthPlatformFromState(state: string | null): SocialPlatform | null {
  if (!state) return null;
  const dot = state.indexOf(OAUTH_STATE_ORIGIN_SEP);
  const key = dot === -1 ? state : state.slice(0, dot);
  if (key === 'instagram' || key === 'tiktok' || key === 'youtube') return key;
  return null;
}

function getRedirectUri(): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/oauth/redirect.html`;
}

export function buildInstagramOAuthUrl(): string {
  const clientId = import.meta.env.VITE_INSTAGRAM_CLIENT_ID;
  if (!clientId) throw new Error('VITE_INSTAGRAM_CLIENT_ID non configuré');
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: 'instagram_business_basic',
    state: oauthStateWithReturnOrigin('instagram'),
  });
  // Doit être api.instagram.com (pas www.instagram.com) — sinon page « non disponible » côté Instagram
  return `https://api.instagram.com/oauth/authorize?${params}`;
}

export function buildTikTokOAuthUrl(): string {
  const clientKey = import.meta.env.VITE_TIKTOK_CLIENT_KEY;
  if (!clientKey) throw new Error('VITE_TIKTOK_CLIENT_KEY non configuré');
  const params = new URLSearchParams({
    client_key: clientKey,
    response_type: 'code',
    scope: 'user.info.basic',
    redirect_uri: getRedirectUri(),
    state: oauthStateWithReturnOrigin('tiktok'),
  });
  return `https://www.tiktok.com/v2/auth/authorize/?${params}`;
}

export function buildYouTubeOAuthUrl(): string {
  const clientId = import.meta.env.VITE_YOUTUBE_CLIENT_ID;
  if (!clientId) throw new Error('VITE_YOUTUBE_CLIENT_ID non configuré');
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/youtube.readonly',
    access_type: 'offline',
    prompt: 'consent',
    state: oauthStateWithReturnOrigin('youtube'),
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export function getSocialOAuthUrl(platform: SocialPlatform): string {
  switch (platform) {
    case 'instagram': return buildInstagramOAuthUrl();
    case 'tiktok': return buildTikTokOAuthUrl();
    case 'youtube': return buildYouTubeOAuthUrl();
  }
}

export function getRpcName(platform: SocialPlatform): string {
  switch (platform) {
    case 'instagram': return 'connect_instagram';
    case 'tiktok': return 'connect_tiktok';
    case 'youtube': return 'connect_youtube';
  }
}

export function getRedirectUriForExchange(): string {
  return getRedirectUri();
}
