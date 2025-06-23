import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database, CheckCircle, AlertCircle, Info } from 'lucide-react';

const SimpleSupabaseTest = () => {
  const [testResult, setTestResult] = useState<{
    connection: boolean;
    existingTables: boolean;
    storage: boolean;
    error?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    setIsLoading(true);
    const result = {
      connection: false,
      existingTables: false,
      storage: false,
      error: undefined as string | undefined,
    };

    try {
      // Test 1: Basic connection
      console.log('Testing Supabase connection...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (!sessionError) {
        result.connection = true;
        console.log('✅ Connection OK');
      } else {
        result.error = sessionError.message;
        console.error('❌ Connection failed:', sessionError);
        setTestResult(result);
        setIsLoading(false);
        return;
      }

      // Test 2: Check existing tables (music_tracks and music_keywords)
      try {
        const { data: musicTracks } = await supabase
          .from('music_tracks')
          .select('id')
          .limit(1);
        
        const { data: musicKeywords } = await supabase
          .from('music_keywords')
          .select('id')
          .limit(1);

        result.existingTables = true;
        console.log('✅ Existing tables accessible');
      } catch (error) {
        console.log('⚠️ Some tables not accessible:', error);
      }

      // Test 3: Check storage
      try {
        const { data: bucket } = await supabase.storage.getBucket('music-files');
        if (bucket) {
          result.storage = true;
          console.log('✅ Storage bucket exists');
        }
      } catch (error) {
        console.log('⚠️ Storage bucket not found:', error);
      }

      setTestResult(result);

    } catch (error) {
      console.error('Test failed:', error);
      result.error = error instanceof Error ? error.message : 'Unknown error';
      setTestResult(result);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-blue-400">Testing Supabase...</span>
        </div>
      </div>
    );
  }

  if (!testResult?.connection) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="text-red-400 mt-0.5" size={20} />
          <div className="flex-1">
            <h3 className="text-red-400 font-semibold mb-2">Supabase Connection Failed</h3>
            <p className="text-red-300 text-sm mb-2">
              {testResult?.error || 'Cannot connect to Supabase'}
            </p>
            <div className="text-xs text-red-200">
              <p className="mb-2">Please check:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Project URL and API key in src/integrations/supabase/client.ts</li>
                <li>Supabase project is active (not paused)</li>
                <li>Network connectivity</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Connection Status */}
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <CheckCircle className="text-green-400" size={20} />
          <span className="text-green-400 font-semibold">Supabase Connected Successfully</span>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3 flex items-center">
          <Database className="mr-2" size={18} />
          Current Database Status
        </h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Basic Connection:</span>
            <span className="text-green-400">✅ Working</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Existing Tables (music_tracks, music_keywords):</span>
            <span className={testResult.existingTables ? "text-green-400" : "text-yellow-400"}>
              {testResult.existingTables ? "✅ Accessible" : "⚠️ Limited Access"}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Storage Bucket (music-files):</span>
            <span className={testResult.storage ? "text-green-400" : "text-yellow-400"}>
              {testResult.storage ? "✅ Ready" : "⚠️ Needs Setup"}
            </span>
          </div>
        </div>
      </div>

      {/* What's Missing */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="text-yellow-400 mt-0.5" size={20} />
          <div className="flex-1">
            <h4 className="text-yellow-400 font-semibold mb-2">Required Setup for Music Upload</h4>
            <p className="text-yellow-300 text-sm mb-3">
              To store uploaded music files, you need to create additional database objects:
            </p>
            
            <div className="space-y-3 text-sm">
              <div>
                <h5 className="text-yellow-200 font-medium mb-1">1. Storage Bucket</h5>
                <p className="text-yellow-300 text-xs mb-2">
                  Create a public storage bucket named 'music-files' for audio files.
                </p>
                <div className="bg-black/20 p-2 rounded text-xs text-yellow-100 font-mono">
                  Go to Storage → Create Bucket → Name: "music-files" → Public: Yes
                </div>
              </div>

              <div>
                <h5 className="text-yellow-200 font-medium mb-1">2. Database Table (Optional)</h5>
                <p className="text-yellow-300 text-xs mb-2">
                  Create a table to store metadata about uploaded files.
                </p>
                <details className="text-xs">
                  <summary className="text-yellow-300 cursor-pointer hover:text-yellow-200">
                    Show SQL Commands
                  </summary>
                  <div className="mt-2 p-2 bg-black/20 rounded text-yellow-100 font-mono text-xs overflow-x-auto">
                    <pre>{`-- Run in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.uploaded_tracks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  artist text NOT NULL DEFAULT 'Unknown Artist',
  duration text,
  file_path text NOT NULL UNIQUE,
  file_size bigint,
  mime_type text,
  created_at timestamp DEFAULT now()
);

-- Enable public access
ALTER TABLE public.uploaded_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access" ON public.uploaded_tracks FOR ALL USING (true);`}</pre>
                  </div>
                </details>
              </div>

              <div>
                <h5 className="text-yellow-200 font-medium mb-1">3. Storage Policies</h5>
                <p className="text-yellow-300 text-xs mb-2">
                  Enable public read/write access to the storage bucket.
                </p>
                <div className="bg-black/20 p-2 rounded text-xs text-yellow-100 font-mono">
                  Storage → music-files → Policies → Create policy → Allow public access
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <button
        onClick={runTests}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        Refresh Tests
      </button>
    </div>
  );
};

export default SimpleSupabaseTest; 