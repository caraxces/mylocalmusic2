
import { Home, Search, Library, Plus, Heart, Download } from 'lucide-react';
import { useState } from 'react';

const Sidebar = () => {
  const [playlists] = useState([
    'My Playlist #1',
    'Liked Songs',
    'Recently Played',
    'Downloaded Music',
    'Rock Classics',
    'Pop Hits 2024'
  ]);

  return (
    <div className="w-64 h-full bg-black/80 backdrop-blur-md border-r border-white/10 flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gradient">MusicDownloader</h1>
      </div>

      {/* Navigation */}
      <nav className="px-4 space-y-2">
        <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-white hover:text-orange-400">
          <Home size={20} />
          <span className="font-medium">Home</span>
        </a>
        <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-orange-400">
          <Search size={20} />
          <span className="font-medium">Search</span>
        </a>
        <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-orange-400">
          <Library size={20} />
          <span className="font-medium">Your Library</span>
        </a>
        <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-orange-400">
          <Download size={20} />
          <span className="font-medium">Downloads</span>
        </a>
      </nav>

      {/* Divider */}
      <div className="mx-4 my-4 border-t border-white/10"></div>

      {/* Create Playlist */}
      <div className="px-4 mb-4">
        <button className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-orange-400 w-full">
          <Plus size={20} />
          <span className="font-medium">Create Playlist</span>
        </button>
        <button className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-orange-400 w-full">
          <Heart size={20} />
          <span className="font-medium">Liked Songs</span>
        </button>
      </div>

      {/* Playlists */}
      <div className="flex-1 px-4 overflow-y-auto">
        <div className="space-y-1">
          {playlists.map((playlist, index) => (
            <button
              key={index}
              className="block w-full text-left px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white text-sm"
            >
              {playlist}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
