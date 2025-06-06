import { useState, useEffect } from 'react';
import { useSupabaseMusic } from './useSupabaseMusic';
import { useLocalMusic } from './useLocalMusic';
import { supabase } from '@/integrations/supabase/client';

export const useMusicStorage = () => {
  const [useSupabase, setUseSupabase] = useState<boolean | null>(null);
  const supabaseHook = useSupabaseMusic();
  const localHook = useLocalMusic();

  useEffect(() => {
    checkSupabaseAvailability();
  }, []);

  const checkSupabaseAvailability = async () => {
    try {
      // Test Supabase connection
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        console.log('Supabase not available, using localStorage');
        setUseSupabase(false);
        return;
      }

      // Test storage bucket
      const { error: bucketError } = await supabase.storage.getBucket('music-files');
      
      if (bucketError) {
        console.log('Storage bucket not available, using localStorage');
        setUseSupabase(false);
        return;
      }

      console.log('Supabase available, using cloud storage');
      setUseSupabase(true);
      
    } catch (error) {
      console.log('Supabase connection failed, using localStorage');
      setUseSupabase(false);
    }
  };

  // Return the appropriate hook based on availability
  if (useSupabase === null) {
    // Still checking, return loading state
    return {
      tracks: [],
      addTrack: async () => {},
      removeTrack: () => {},
      clearAllTracks: () => {},
      isLoading: true,
      refreshTracks: () => {},
      storageType: 'checking' as const,
    };
  }

  if (useSupabase) {
    return {
      ...supabaseHook,
      storageType: 'supabase' as const,
    };
  } else {
    return {
      ...localHook,
      refreshTracks: () => {}, // localStorage doesn't need refresh
      storageType: 'localStorage' as const,
    };
  }
}; 