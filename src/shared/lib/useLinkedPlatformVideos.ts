import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/shared/infrastructure/supabase';

export type LinkedVideoPlatform = 'instagram' | 'tiktok' | 'youtube';

export interface LinkedVideo {
  id: string;
  platform: LinkedVideoPlatform;
  title: string;
  thumb: string;
  permalink: string;
  date: string;
  publishedAt: string;
}

function formatShortDate(isoDate: string): string {
  const d = new Date(isoDate);
  const day = d.getDate();
  const months = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  return `${day} ${months[d.getMonth()]}`;
}

function truncateTitle(s: string | null, maxLen = 50): string {
  if (!s) return 'Vidéo';
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen).trimEnd() + '…';
}

export function useLinkedPlatformVideos() {
  const [videos, setVideos] = useState<LinkedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [instagramNotConnected, setInstagramNotConnected] = useState(false);
  const [countsByPlatform, setCountsByPlatform] = useState({ instagram: 0, tiktok: 0, youtube: 0 });

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [igRes, ttRes, ytRes] = await Promise.all([
      supabase.rpc('sync_instagram_videos'),
      supabase.rpc('sync_tiktok_videos'),
      supabase.rpc('sync_youtube_videos'),
    ]);

    if (igRes.error) {
      setError(igRes.error.message);
      setLoading(false);
      return;
    }

    const igData = igRes.data as { error?: string } | null;
    if (igData?.error === 'not_connected') {
      setInstagramNotConnected(true);
    } else {
      setInstagramNotConnected(false);
    }

    if (igData?.error && igData.error !== 'not_connected') {
      setError(igData.error);
      setLoading(false);
      return;
    }

    const ytStats = await supabase.rpc('refresh_youtube_view_counts');
    if (ytStats.error) {
      console.warn('refresh_youtube_view_counts:', ytStats.error.message);
    }

    const recompute = await supabase.rpc('recompute_clip_views_total');
    if (recompute.error) {
      console.warn('recompute_clip_views_total:', recompute.error.message);
    }

    const [igRows, ttRows, ytRows] = await Promise.all([
      supabase.from('instagram_videos').select('*').order('timestamp', { ascending: false }),
      supabase.from('tiktok_videos').select('*').order('timestamp', { ascending: false }),
      supabase.from('youtube_videos').select('*').order('published_at', { ascending: false }),
    ]);

    if (igRows.error) {
      setError(igRows.error.message);
      setLoading(false);
      return;
    }
    if (ttRows.error) {
      setError(ttRows.error.message);
      setLoading(false);
      return;
    }
    if (ytRows.error) {
      setError(ytRows.error.message);
      setLoading(false);
      return;
    }

    const merged: LinkedVideo[] = [];

    for (const m of igRows.data || []) {
      const row = m as Record<string, string>;
      const ts = row.timestamp;
      merged.push({
        id: row.id,
        platform: 'instagram',
        title: truncateTitle(row.caption),
        thumb: row.thumbnail_url || row.media_url,
        permalink: row.permalink,
        date: formatShortDate(ts),
        publishedAt: ts,
      });
    }

    for (const m of ttRows.data || []) {
      const row = m as Record<string, string>;
      const ts = row.timestamp;
      merged.push({
        id: row.id,
        platform: 'tiktok',
        title: truncateTitle(row.title),
        thumb: row.cover_url,
        permalink: row.share_url,
        date: formatShortDate(ts),
        publishedAt: ts,
      });
    }

    for (const m of ytRows.data || []) {
      const row = m as Record<string, string>;
      const ts = row.published_at;
      merged.push({
        id: row.id,
        platform: 'youtube',
        title: truncateTitle(row.title),
        thumb: row.thumbnail_url,
        permalink: row.watch_url,
        date: formatShortDate(ts),
        publishedAt: ts,
      });
    }

    merged.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    setCountsByPlatform({
      instagram: (igRows.data || []).length,
      tiktok: (ttRows.data || []).length,
      youtube: (ytRows.data || []).length,
    });
    setVideos(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    videos,
    loading,
    error,
    instagramNotConnected,
    countsByPlatform,
    refetch,
  };
}
