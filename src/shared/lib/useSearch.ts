import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/shared/infrastructure/supabase';

export interface ProfileResult {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  content_tags: string[];
  role: string;
}

export function useProfileSearch(query: string) {
  const [results, setResults] = useState<ProfileResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const pattern = `%${trimmed}%`;
      const { data } = await supabase
        .from('profiles')
        .select('id, username, display_name, bio, avatar_url, content_tags, role')
        .or(`username.ilike.${pattern},display_name.ilike.${pattern},bio.ilike.${pattern}`)
        .eq('is_public', true)
        .limit(20);

      setResults(data ?? []);
      setLoading(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return { results, loading };
}
