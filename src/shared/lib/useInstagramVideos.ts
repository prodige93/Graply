import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/shared/infrastructure/supabase';

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

    const { data: syncResult, error: syncErr } = await supabase.rpc('sync_instagram_videos');

    if (syncErr) {
      setError(syncErr.message);
      setLoading(false);
      return;
    }

    if (syncResult?.error === 'not_connected') {
      setNotConnected(true);
      setVideos([]);
      setLoading(false);
      return;
    }

    if (syncResult?.error) {
      setError(syncResult.error);
      setLoading(false);
      return;
    }

    const { data: rows, error: selectErr } = await supabase
      .from('instagram_videos')
      .select('*')
      .order('timestamp', { ascending: false });

    if (selectErr) {
      setError(selectErr.message);
      setLoading(false);
      return;
    }

    const videoItems: InstagramVideo[] = (rows || []).map((m: Record<string, string>) => ({
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
