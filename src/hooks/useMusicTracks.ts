
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MusicTrack {
  id: string;
  youtube_id: string;
  title: string;
  artist: string;
  thumbnail_url: string | null;
  duration: string | null;
  view_count: number | null;
  published_at: string | null;
  channel_name: string | null;
  description: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export const useMusicTracks = (limit: number = 50) => {
  return useQuery({
    queryKey: ['music-tracks', limit],
    queryFn: async (): Promise<MusicTrack[]> => {
      const { data, error } = await supabase
        .from('music_tracks')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRefreshMusicTracks = () => {
  return useQuery({
    queryKey: ['refresh-music-tracks'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-youtube-music');
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    enabled: false, // Only run when manually triggered
  });
};
