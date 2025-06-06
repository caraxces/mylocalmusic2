
import { useState, useEffect } from 'react';

export interface LocalMusicTrack {
  id: string;
  file: File;
  title: string;
  artist: string;
  duration: string;
  thumbnail?: string;
  url: string;
}

export const useLocalMusic = () => {
  const [tracks, setTracks] = useState<LocalMusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load tracks from localStorage on mount
  useEffect(() => {
    const savedTracks = localStorage.getItem('localMusicTracks');
    if (savedTracks) {
      try {
        const parsedTracks = JSON.parse(savedTracks);
        setTracks(parsedTracks);
      } catch (error) {
        console.error('Error loading saved tracks:', error);
      }
    }
  }, []);

  // Save tracks to localStorage whenever tracks change
  useEffect(() => {
    localStorage.setItem('localMusicTracks', JSON.stringify(tracks));
  }, [tracks]);

  const addTrack = async (file: File) => {
    setIsLoading(true);
    try {
      // Create object URL for the audio file
      const url = URL.createObjectURL(file);
      
      // Extract metadata from filename
      const filename = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      let title = filename;
      let artist = "Unknown Artist";
      
      // Try to parse "Artist - Title" format
      if (filename.includes(' - ')) {
        const parts = filename.split(' - ');
        artist = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();
      }

      // Get duration using audio element
      const audio = new Audio(url);
      const duration = await new Promise<string>((resolve) => {
        audio.addEventListener('loadedmetadata', () => {
          const mins = Math.floor(audio.duration / 60);
          const secs = Math.floor(audio.duration % 60);
          resolve(`${mins}:${secs.toString().padStart(2, '0')}`);
        });
      });

      const newTrack: LocalMusicTrack = {
        id: Date.now().toString(),
        file,
        title,
        artist,
        duration,
        url
      };

      setTracks(prev => [...prev, newTrack]);
    } catch (error) {
      console.error('Error adding track:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeTrack = (id: string) => {
    setTracks(prev => {
      const trackToRemove = prev.find(track => track.id === id);
      if (trackToRemove) {
        URL.revokeObjectURL(trackToRemove.url);
      }
      return prev.filter(track => track.id !== id);
    });
  };

  const clearAllTracks = () => {
    tracks.forEach(track => URL.revokeObjectURL(track.url));
    setTracks([]);
  };

  return {
    tracks,
    addTrack,
    removeTrack,
    clearAllTracks,
    isLoading
  };
};
