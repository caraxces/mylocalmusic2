
import { Upload, Music, X } from 'lucide-react';
import { useRef } from 'react';
import { toast } from '@/hooks/use-toast';

interface MusicUploaderProps {
  onFilesSelected: (files: File[]) => void;
  isLoading: boolean;
}

const MusicUploader = ({ onFilesSelected, isLoading }: MusicUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const audioFiles = files.filter(file => 
      file.type.startsWith('audio/') || 
      file.name.toLowerCase().endsWith('.mp3') ||
      file.name.toLowerCase().endsWith('.wav') ||
      file.name.toLowerCase().endsWith('.m4a') ||
      file.name.toLowerCase().endsWith('.flac')
    );

    if (audioFiles.length === 0) {
      toast({
        title: "Invalid Files",
        description: "Please select audio files (MP3, WAV, M4A, FLAC)",
        variant: "destructive",
      });
      return;
    }

    if (audioFiles.length !== files.length) {
      toast({
        title: "Some Files Skipped",
        description: `${files.length - audioFiles.length} non-audio files were skipped`,
      });
    }

    onFilesSelected(audioFiles);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const audioFiles = files.filter(file => 
      file.type.startsWith('audio/') || 
      file.name.toLowerCase().endsWith('.mp3') ||
      file.name.toLowerCase().endsWith('.wav') ||
      file.name.toLowerCase().endsWith('.m4a') ||
      file.name.toLowerCase().endsWith('.flac')
    );

    if (audioFiles.length > 0) {
      onFilesSelected(audioFiles);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div 
      className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-orange-400 transition-colors"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="bg-orange-500/20 p-4 rounded-full">
          {isLoading ? (
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload size={32} className="text-orange-400" />
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {isLoading ? 'Processing Files...' : 'Upload Your Music'}
          </h3>
          <p className="text-white/70 mb-4">
            Drag and drop audio files here, or click to browse
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full transition-colors disabled:opacity-50"
          >
            <Music className="inline w-4 h-4 mr-2" />
            Choose Files
          </button>
        </div>
        <p className="text-xs text-white/50">
          Supports MP3, WAV, M4A, FLAC formats
        </p>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.wav,.m4a,.flac"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default MusicUploader;
