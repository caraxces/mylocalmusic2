import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, CheckCircle, Database, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const SupabaseStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [bucketExists, setBucketExists] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSupabaseConnection();
  }, []);

  const checkSupabaseConnection = async () => {
    setIsLoading(true);
    try {
      // Test basic connection
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Supabase connection error:', error);
        setIsConnected(false);
      } else {
        setIsConnected(true);
        
        // Check if storage bucket exists
        await checkStorageBucket();
      }
    } catch (error) {
      console.error('Supabase connection failed:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const checkStorageBucket = async () => {
    try {
      const { data, error } = await supabase.storage.getBucket('music-files');
      
      if (error) {
        console.error('Storage bucket error:', error);
        setBucketExists(false);
      } else {
        setBucketExists(true);
      }
    } catch (error) {
      console.error('Storage bucket check failed:', error);
      setBucketExists(false);
    }
  };

  const createStorageBucket = async () => {
    try {
      const { data, error } = await supabase.storage.createBucket('music-files', {
        public: true,
        allowedMimeTypes: ['audio/*'],
        fileSizeLimit: 50 * 1024 * 1024, // 50MB
      });

      if (error) {
        throw error;
      }

      setBucketExists(true);
      toast({
        title: "Success",
        description: "Storage bucket created successfully",
      });
    } catch (error) {
      console.error('Error creating bucket:', error);
      toast({
        title: "Error",
        description: "Failed to create storage bucket",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-blue-400">Checking Supabase connection...</span>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="text-red-400 mt-0.5" size={20} />
          <div className="flex-1">
            <h3 className="text-red-400 font-semibold mb-2">Supabase Connection Failed</h3>
            <p className="text-red-300 text-sm mb-3">
              Cannot connect to Supabase. Please verify your configuration.
            </p>
            <div className="text-xs text-red-200 space-y-1">
              <p>To fix this:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Check your Supabase project URL and API key</li>
                <li>Ensure your Supabase project is active</li>
                <li>Verify network connectivity</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (bucketExists === false) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <Database className="text-yellow-400 mt-0.5" size={20} />
          <div className="flex-1">
            <h3 className="text-yellow-400 font-semibold mb-2">Storage Bucket Required</h3>
            <p className="text-yellow-300 text-sm mb-3">
              The 'music-files' storage bucket doesn't exist. Create it to store your music files.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={createStorageBucket}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Create Storage Bucket
              </button>
              <a
                href="https://supabase.com/dashboard/project"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-yellow-400 hover:text-yellow-300 text-sm"
              >
                <span>Open Supabase Dashboard</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-3">
        <CheckCircle className="text-green-400" size={20} />
        <div>
          <span className="text-green-400 font-semibold">Supabase Connected</span>
          <p className="text-green-300 text-sm">
            Music files will be stored in Supabase Storage and persist across sessions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupabaseStatus; 