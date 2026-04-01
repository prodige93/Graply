import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/shared/infrastructure/supabase';

export interface InstagramMedia {
  id: string;
  caption: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url: string | null;
  timestamp: string;
  permalink: string;
}

export interface InstagramVideo {
  id: string;
  title: string;
  platform: 'instagram';
  thumbnail: string;
  permalink: string;
  date: string;
  media_url: string;
}

function formatInstagramDate(isoDate: string): string {
  const d = new Date(isoDate);
  const day = d.getDate();
  const months = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  return `${day} ${months[d.getMonth()]}`;
}

function truncateCaption(caption: string | null, maxLen = 50): string {
  if (!caption) return 'Vidéo Instagram';
  if (caption.length <= maxLen) return caption;
  return caption.slice(0, maxLen).trimEnd() + '…';
}

export function useInstagramVideos() {
  const [videos, setVideos] = useState<InstagramVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notConnected, setNotConnected] = useState(false);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: rpcError } = await supabase.rpc('fetch_instagram_media');

    if (rpcError) {
      setError(rpcError.message);
      setLoading(false);
      return;
    }

    if (data?.error === 'not_connected') {
      setNotConnected(true);
      setLoading(false);
      return;
    }

    if (data?.error) {
      setError(data.error);
      setLoading(false);
      return;
    }

    const allMedia: InstagramMedia[] = data?.data || [];
    const videoItems: InstagramVideo[] = allMedia
      .filter((m) => m.media_type === 'VIDEO')
      .map((m) => ({
        id: m.id,
        title: truncateCaption(m.caption),
        platform: 'instagram' as const,
        thumbnail: m.thumbnail_url || m.media_url,
        permalink: m.permalink,
        date: formatInstagramDate(m.timestamp),
        media_url: m.media_url,
      }));

    setVideos(videoItems);
    setNotConnected(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return { videos, loading, error, notConnected, refetch: fetchVideos };
}