export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube';

const CALLBACK_PATH = '/social-callback';

function getRedirectUri(): string {
  return `${window.location.origin}${CALLBACK_PATH}`;
}

export function buildInstagramOAuthUrl(): string {
  const clientId = import.meta.env.VITE_INSTAGRAM_CLIENT_ID;
  if (!clientId) throw new Error('VITE_INSTAGRAM_CLIENT_ID non configuré');
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: 'instagram_business_basic',
    state: 'instagram',
  });
  return `https://www.instagram.com/oauth/authorize?${params}`;
}

export function buildTikTokOAuthUrl(): string {
  const clientKey = import.meta.env.VITE_TIKTOK_CLIENT_KEY;
  if (!clientKey) throw new Error('VITE_TIKTOK_CLIENT_KEY non configuré');
  const params = new URLSearchParams({
    client_key: clientKey,
    response_type: 'code',
    scope: 'user.info.basic',
    redirect_uri: getRedirectUri(),
    state: 'tiktok',
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
    state: 'youtube',
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
