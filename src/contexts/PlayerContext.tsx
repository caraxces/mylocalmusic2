import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: string;
  thumbnail?: string;
  file_path?: string;
  created_at?: string;
}

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  audioRef: React.RefObject<HTMLAudioElement>;
  playTrack: (track: Track) => void;
  togglePlayPause: () => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setDuration: (duration: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

interface PlayerProviderProps {
  children: ReactNode;
}

export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(75);
  const audioRef = useRef<HTMLAudioElement>(null);

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(false);
    
    if (audioRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.load();
      
      // Wait for the audio to be ready then play
      audioRef.current.addEventListener('canplay', () => {
        audioRef.current?.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.error('Error playing audio:', error);
        });
      }, { once: true });
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current && currentTrack) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.error('Error playing audio:', error);
        });
      }
    }
  };

  const value: PlayerContextType = {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    audioRef,
    playTrack,
    togglePlayPause,
    setCurrentTime,
    setVolume,
    setIsPlaying,
    setDuration,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}; 