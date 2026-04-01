import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/shared/infrastructure/supabase';

export interface InstagramMedia {
    id: string;
    caption: string;
    madia_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
    media_url: string;
    thumbnail_url: string | null;
    timestamp: string;
    permalink: string;
}

export interface InstagramVideo {
    id: string;
    title: string;
    platform: 'instagram';
    thumnnail: string;
    permalink: string;
    date: string;
    media_url: string;
}

function formatInstagramDate (isoDate: string): string {
    const d = new Date(isoDate);
    const day = d.getDate();
    const months = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    return `${day} ${months[d.getMonth()]}`
}

function truncateCaption (caption: string | null, maxLen = 50): string {
    if (!caption) return 'Video Instagram';
    if (caption.length <= maxLen) return caption;
    return caption.slice(0, maxLen).trimEnd() + '…';
}

