
import { useState } from 'react';
import SearchBar from './SearchBar';
import MusicCard from './MusicCard';
import MusicUploader from './MusicUploader';
import SimpleSupabaseTest from './SimpleSupabaseTest';
import { toast } from '@/hooks/use-toast';
import { useMusicStorage } from '@/hooks/useMusicStorage';
import { usePlayer } from '@/contexts/PlayerContext';
import { Trash2, FolderOpen, RefreshCw } from 'lucide-react';

const MainContent = () => {
  const { tracks, addTrack, removeTrack, clearAllTracks, isLoading, refreshTracks, storageType } = useMusicStorage();
  const { playTrack } = usePlayer();
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilesSelected = async (files: File[]) => {
    for (const file of files) {
      await addTrack(file);
    }
    toast({
      title: "Files Added",
      description: `Successfully added ${files.length} track(s) to your library`,
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query.toLowerCase());
  };

  const handlePlay = (track: any) => {
    playTrack({
      id: track.id,
      title: track.title,
      artist: track.artist,
      url: track.url,
      duration: track.duration,
      thumbnail: track.thumbnail
    });
    console.log('Playing:', track.title);
    toast({
      title: "Now Playing",
      description: `${track.title} by ${track.artist}`,
    });
  };

  const handleDownload = (track: any) => {
    // Create download link for the original file
    const link = document.createElement('a');
    link.href = track.url;
    link.download = `${track.artist} - ${track.title}`;
    link.click();
    
    toast({
      title: "Download Started",
      description: `Downloading ${track.title}`,
    });
  };

  const handleRemoveTrack = (trackId: string) => {
    removeTrack(trackId);
    toast({
      title: "Track Removed",
      description: "Track has been removed from your library",
    });
  };

  const handleAddMusicClick = () => {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  };

  // Filter tracks based on search query
  const filteredTracks = tracks.filter(track => 
    track.title.toLowerCase().includes(searchQuery) ||
    track.artist.toLowerCase().includes(searchQuery)
  );

  // Group tracks for different sections
  const recentTracks = filteredTracks.slice(0, 6);
  const allTracks = filteredTracks;

  return (
    <div className="flex-1 p-6 pb-32 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gradient">Your Music Library</h1>
            <p className="text-white/60 text-sm mt-1">Storage: Cloud (Supabase)</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleAddMusicClick}
              className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full transition-colors"
            >
              <FolderOpen size={16} />
              <span>Add Music</span>
            </button>
            <button
              onClick={refreshTracks}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-colors"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
            {tracks.length > 0 && (
              <button
                onClick={clearAllTracks}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-colors"
              >
                <Trash2 size={16} />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Supabase Status */}
      <SimpleSupabaseTest />

      {tracks.length === 0 ? (
        <div className="max-w-2xl mx-auto">
          <MusicUploader onFilesSelected={handleFilesSelected} isLoading={isLoading} />
        </div>
      ) : (
        <>
          {/* Upload Section */}
          <section className="mb-8">
            <div className="max-w-md">
              <MusicUploader onFilesSelected={handleFilesSelected} isLoading={isLoading} />
            </div>
          </section>

          {searchQuery && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Search Results ({filteredTracks.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {filteredTracks.map((track) => (
                  <MusicCard
                    key={track.id}
                    title={track.title}
                    artist={track.artist}
                    thumbnail={track.thumbnail || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'}
                    duration={track.duration}
                    onPlay={() => handlePlay(track)}
                    onDownload={() => handleDownload(track)}
                  />
                ))}
              </div>
            </section>
          )}

          {!searchQuery && (
            <>
              {/* Recently Added */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">Recently Added</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                  {recentTracks.map((track) => (
                    <MusicCard
                      key={track.id}
                      title={track.title}
                      artist={track.artist}
                      thumbnail={track.thumbnail || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'}
                      duration={track.duration}
                      onPlay={() => handlePlay(track)}
                      onDownload={() => handleDownload(track)}
                    />
                  ))}
                </div>
              </section>

              {/* All Music */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-6">All Music ({allTracks.length} tracks)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                  {allTracks.map((track) => (
                    <MusicCard
                      key={track.id}
                      title={track.title}
                      artist={track.artist}
                      thumbnail={track.thumbnail || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'}
                      duration={track.duration}
                      onPlay={() => handlePlay(track)}
                      onDownload={() => handleDownload(track)}
                    />
                  ))}
                </div>
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default MainContent;
