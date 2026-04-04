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

/**
 * URI de callback OAuth (identique pour authorize et pour l’échange du code côté Supabase).
 * - Défaut : Supabase Storage `oauth/redirect.html`.
 * - `VITE_OAUTH_REDIRECT_URI` : remplace pour **toutes** les plateformes (Meta + Google + TikTok doivent lister cette URL).
 * - `VITE_TIKTOK_OAUTH_REDIRECT_URI` : **TikTok seulement** (ex. Netlify), pour sandbox quand Meta/Google gardent l’URL Supabase.
 */
function getRedirectUri(platform: SocialPlatform): string {
  const globalCustom = import.meta.env.VITE_OAUTH_REDIRECT_URI?.trim();
  if (globalCustom) return globalCustom;
  if (platform === 'tiktok') {
    const ttOnly = import.meta.env.VITE_TIKTOK_OAUTH_REDIRECT_URI?.trim();
    if (ttOnly) return ttOnly;
  }
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/oauth/redirect.html`;
}

export function buildInstagramOAuthUrl(): string {
  const clientId = import.meta.env.VITE_INSTAGRAM_CLIENT_ID;
  if (!clientId) throw new Error('VITE_INSTAGRAM_CLIENT_ID non configuré');
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri('instagram'),
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
  // Sandbox : souvent seul user.info.basic est accepté ; video.list peut provoquer un refus immédiat.
  // Prod / après review TikTok : VITE_TIKTOK_OAUTH_SCOPE=user.info.basic,video.list (sync vidéos)
  const scope =
    import.meta.env.VITE_TIKTOK_OAUTH_SCOPE?.trim() || 'user.info.basic';
  const params = new URLSearchParams({
    client_key: clientKey,
    response_type: 'code',
    scope,
    redirect_uri: getRedirectUri('tiktok'),
    state: oauthStateWithReturnOrigin('tiktok'),
    // Toujours afficher l’écran d’autorisation (doc Login Kit Web)
    disable_auto_auth: '1',
  });
  return `https://www.tiktok.com/v2/auth/authorize/?${params}`;
}

export function buildYouTubeOAuthUrl(): string {
  const clientId = import.meta.env.VITE_YOUTUBE_CLIENT_ID;
  if (!clientId) throw new Error('VITE_YOUTUBE_CLIENT_ID non configuré');
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri('youtube'),
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

export function getRedirectUriForExchange(platform: SocialPlatform): string {
  return getRedirectUri(platform);
}
