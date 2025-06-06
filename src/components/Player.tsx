
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat, Download } from 'lucide-react';
import { useEffect } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';

const Player = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    audioRef,
    togglePlayPause,
    setCurrentTime,
    setVolume,
    setIsPlaying,
    setDuration,
  } = usePlayer();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newVolume = (clickX / rect.width) * 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-white/10 p-4">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        {/* Current Song Info */}
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Play size={24} className="text-white" fill="currentColor" />
          </div>
          <div className="min-w-0">
            <h4 className="font-medium text-white truncate">
              {currentTrack?.title || 'No track selected'}
            </h4>
            <p className="text-white/70 text-sm truncate">
              {currentTrack?.artist || 'Unknown Artist'}
            </p>
          </div>
          <button className="text-white/70 hover:text-orange-400 transition-colors">
            <Download size={20} />
          </button>
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center space-y-2 flex-1 max-w-md">
          <div className="flex items-center space-x-4">
            <button className="text-white/70 hover:text-white transition-colors">
              <Shuffle size={20} />
            </button>
            <button className="text-white/70 hover:text-white transition-colors">
              <SkipBack size={24} />
            </button>
            <button
              onClick={togglePlayPause}
              className="bg-white text-black p-2 rounded-full hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
            </button>
            <button className="text-white/70 hover:text-white transition-colors">
              <SkipForward size={24} />
            </button>
            <button className="text-white/70 hover:text-white transition-colors">
              <Repeat size={20} />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center space-x-2 w-full">
            <span className="text-xs text-white/60">{formatTime(currentTime)}</span>
            <div 
              className="flex-1 bg-white/20 rounded-full h-1 cursor-pointer"
              onClick={handleProgressClick}
            >
              <div 
                className="bg-white h-1 rounded-full transition-all duration-300"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              ></div>
            </div>
            <span className="text-xs text-white/60">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-3 min-w-0 flex-1 justify-end">
          <Volume2 size={20} className="text-white/70" />
          <div 
            className="w-24 bg-white/20 rounded-full h-1 cursor-pointer"
            onClick={handleVolumeChange}
          >
            <div 
              className="bg-white h-1 rounded-full"
              style={{ width: `${volume}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default Player;
