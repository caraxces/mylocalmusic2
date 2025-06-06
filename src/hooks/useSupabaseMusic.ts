import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface SupabaseMusicTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  thumbnail?: string;
  url: string;
  file_path: string;
  created_at: string;
}

export const useSupabaseMusic = () => {
  const [tracks, setTracks] = useState<SupabaseMusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load tracks from Supabase on mount
  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      // Get list of files from storage
      const { data: files, error: listError } = await supabase.storage
        .from('music-files')
        .list('uploads', {
          limit: 100,
          offset: 0,
        });

      if (listError) {
        console.error('Error listing files:', listError);
        return;
      }

      if (!files || files.length === 0) {
        setTracks([]);
        return;
      }

      // Get public URLs for each file and create track objects
      const trackPromises = files
        .filter(file => file.name !== '.emptyFolderPlaceholder')
        .map(async (file) => {
          const { data: urlData } = supabase.storage
            .from('music-files')
            .getPublicUrl(`uploads/${file.name}`);

          // Extract metadata from filename
          const filename = file.name.replace(/\.[^/.]+$/, "");
          let title = filename;
          let artist = "Unknown Artist";
          
          if (filename.includes(' - ')) {
            const parts = filename.split(' - ');
            artist = parts[0].trim();
            title = parts.slice(1).join(' - ').trim();
          }

          return {
            id: file.id || file.name,
            title,
            artist,
            duration: '0:00', // Will be updated when audio loads
            url: urlData.publicUrl,
            file_path: `uploads/${file.name}`,
            created_at: file.created_at || new Date().toISOString(),
          };
        });

      const loadedTracks = await Promise.all(trackPromises);
      setTracks(loadedTracks);

    } catch (error) {
      console.error('Error loading tracks:', error);
      toast({
        title: "Error",
        description: "Failed to load music tracks",
        variant: "destructive",
      });
    }
  };

  const addTrack = async (file: File) => {
    setIsLoading(true);
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}_${file.name}`;
      const filePath = `uploads/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('music-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('music-files')
        .getPublicUrl(filePath);

      // Extract metadata from filename
      const filename = file.name.replace(/\.[^/.]+$/, "");
      let title = filename;
      let artist = "Unknown Artist";
      
      if (filename.includes(' - ')) {
        const parts = filename.split(' - ');
        artist = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();
      }

      // Get duration using audio element
      const audio = new Audio(urlData.publicUrl);
      const duration = await new Promise<string>((resolve) => {
        audio.addEventListener('loadedmetadata', () => {
          const mins = Math.floor(audio.duration / 60);
          const secs = Math.floor(audio.duration % 60);
          resolve(`${mins}:${secs.toString().padStart(2, '0')}`);
        });
        audio.addEventListener('error', () => {
          resolve('0:00');
        });
      });

      const newTrack: SupabaseMusicTrack = {
        id: timestamp.toString(),
        title,
        artist,
        duration,
        url: urlData.publicUrl,
        file_path: filePath,
        created_at: new Date().toISOString(),
      };

      setTracks(prev => [...prev, newTrack]);

      toast({
        title: "Success",
        description: `${title} uploaded successfully`,
      });

    } catch (error) {
      console.error('Error adding track:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload music file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeTrack = async (id: string) => {
    try {
      const track = tracks.find(t => t.id === id);
      if (!track) return;

      // Delete file from storage
      const { error } = await supabase.storage
        .from('music-files')
        .remove([track.file_path]);

      if (error) {
        throw error;
      }

      // Remove from local state
      setTracks(prev => prev.filter(t => t.id !== id));

      toast({
        title: "Success",
        description: "Track deleted successfully",
      });

    } catch (error) {
      console.error('Error removing track:', error);
      toast({
        title: "Delete Error",
        description: "Failed to delete track",
        variant: "destructive",
      });
    }
  };

  const clearAllTracks = async () => {
    try {
      // Get all file paths
      const filePaths = tracks.map(track => track.file_path);
      
      if (filePaths.length === 0) return;

      // Delete all files from storage
      const { error } = await supabase.storage
        .from('music-files')
        .remove(filePaths);

      if (error) {
        throw error;
      }

      // Clear local state
      setTracks([]);

      toast({
        title: "Success",
        description: "All tracks deleted successfully",
      });

    } catch (error) {
      console.error('Error clearing tracks:', error);
      toast({
        title: "Delete Error",
        description: "Failed to delete all tracks",
        variant: "destructive",
      });
    }
  };

  return {
    tracks,
    addTrack,
    removeTrack,
    clearAllTracks,
    isLoading,
    refreshTracks: loadTracks,
  };
}; 