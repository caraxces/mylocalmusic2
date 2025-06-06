
import { Play, Download, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

interface MusicCardProps {
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
  onPlay: () => void;
  onDownload: () => void;
}

const MusicCard = ({ title, artist, thumbnail, duration, onPlay, onDownload }: MusicCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="card-glass rounded-lg p-4 transition-all duration-300 hover:scale-105 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative mb-4">
        <img
          src={thumbnail}
          alt={title}
          className="w-full aspect-square object-cover rounded-lg"
        />
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={onPlay}
            className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
          >
            <Play size={24} fill="currentColor" />
          </button>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={onDownload}
            className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm"
          >
            <Download size={16} />
          </button>
        </div>
      </div>
      <h3 className="font-semibold text-white truncate mb-1">{title}</h3>
      <p className="text-white/70 text-sm truncate mb-2">{artist}</p>
      <div className="flex items-center justify-between text-xs text-white/50">
        <span>{duration}</span>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
};

export default MusicCard;
