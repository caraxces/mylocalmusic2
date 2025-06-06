import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database, CheckCircle, AlertCircle, Play } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const DatabaseSetup = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [hasUploadedTracksTable, setHasUploadedTracksTable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testResults, setTestResults] = useState<{
    connection: boolean;
    tables: { music_tracks: boolean; music_keywords: boolean; uploaded_tracks: boolean };
    storage: boolean;
  } | null>(null);

  useEffect(() => {
    runDatabaseTests();
  }, []);

  const runDatabaseTests = async () => {
    setIsLoading(true);
    const results = {
      connection: false,
      tables: { music_tracks: false, music_keywords: false, uploaded_tracks: false },
      storage: false,
    };

    try {
      // Test 1: Basic connection
      console.log('Testing Supabase connection...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (!sessionError) {
        results.connection = true;
        setIsConnected(true);
        console.log('✅ Connection OK');
      } else {
        console.error('❌ Connection failed:', sessionError);
        setIsConnected(false);
        setTestResults(results);
        setIsLoading(false);
        return;
      }

      // Test 2: Check existing tables
      console.log('Checking existing tables...');
      
      // Check music_tracks table
      const { data: musicTracks, error: musicTracksError } = await supabase
        .from('music_tracks')
        .select('id')
        .limit(1);
      
      if (!musicTracksError) {
        results.tables.music_tracks = true;
        console.log('✅ music_tracks table exists');
      } else {
        console.log('❌ music_tracks table not accessible:', musicTracksError.message);
      }

      // Check music_keywords table
      const { data: musicKeywords, error: musicKeywordsError } = await supabase
        .from('music_keywords')
        .select('id')
        .limit(1);
      
      if (!musicKeywordsError) {
        results.tables.music_keywords = true;
        console.log('✅ music_keywords table exists');
      } else {
        console.log('❌ music_keywords table not accessible:', musicKeywordsError.message);
      }

      // Check uploaded_tracks table (our new table) using raw SQL
      const { data: uploadedTracksTest, error: uploadedTracksError } = await supabase
        .rpc('execute_sql', {
          sql: 'SELECT 1 FROM uploaded_tracks LIMIT 1'
        });
      
      if (!uploadedTracksError) {
        results.tables.uploaded_tracks = true;
        setHasUploadedTracksTable(true);
        console.log('✅ uploaded_tracks table exists');
      } else {
        console.log('❌ uploaded_tracks table missing:', uploadedTracksError.message);
        setHasUploadedTracksTable(false);
      }

      // Test 3: Check storage
      console.log('Checking storage...');
      const { data: bucket, error: bucketError } = await supabase.storage.getBucket('music-files');
      
      if (!bucketError && bucket) {
        results.storage = true;
        console.log('✅ Storage bucket exists');
      } else {
        console.log('❌ Storage bucket missing:', bucketError?.message);
      }

      setTestResults(results);

    } catch (error) {
      console.error('Database test failed:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const createUploadedTracksTable = async () => {
    try {
      // Create the table using SQL
      const { data, error } = await supabase.rpc('sql', {
        query: `
          CREATE TABLE IF NOT EXISTS public.uploaded_tracks (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            title text NOT NULL,
            artist text NOT NULL DEFAULT 'Unknown Artist',
            duration text,
            file_path text NOT NULL UNIQUE,
            file_size bigint,
            mime_type text,
            thumbnail_url text,
            tags text[],
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
          );

          -- Enable RLS
          ALTER TABLE public.uploaded_tracks ENABLE ROW LEVEL SECURITY;

          -- Create policies for public access
          CREATE POLICY "Public read access" ON public.uploaded_tracks
            FOR SELECT USING (true);

          CREATE POLICY "Public insert access" ON public.uploaded_tracks
            FOR INSERT WITH CHECK (true);

          CREATE POLICY "Public update access" ON public.uploaded_tracks
            FOR UPDATE USING (true);

          CREATE POLICY "Public delete access" ON public.uploaded_tracks
            FOR DELETE USING (true);

          -- Create updated_at trigger
          CREATE OR REPLACE FUNCTION public.handle_updated_at()
          RETURNS trigger AS $$
          BEGIN
            NEW.updated_at = now();
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;

          CREATE TRIGGER uploaded_tracks_updated_at
            BEFORE UPDATE ON public.uploaded_tracks
            FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
        `
      });

      if (error) {
        throw error;
      }

      setHasUploadedTracksTable(true);
      await runDatabaseTests(); // Re-run tests

      toast({
        title: "Success",
        description: "uploaded_tracks table created successfully",
      });

    } catch (error) {
      console.error('Error creating table:', error);
      
      // Fallback: Try direct SQL execution
      try {
        const { error: sqlError } = await supabase
          .from('uploaded_tracks')
          .select('id')
          .limit(1);

        if (sqlError && sqlError.message.includes('does not exist')) {
          toast({
            title: "Manual Setup Required",
            description: "Please create the table manually using the SQL provided below",
            variant: "destructive",
          });
        }
      } catch (fallbackError) {
        console.error('Fallback test failed:', fallbackError);
      }

      toast({
        title: "Error",
        description: "Failed to create table automatically. Please check console for SQL commands.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-blue-400 font-medium">Testing Database Connection...</span>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="text-red-400 mt-1" size={24} />
          <div className="flex-1">
            <h3 className="text-red-400 font-semibold text-lg mb-2">Database Connection Failed</h3>
            <p className="text-red-300 mb-4">
              Cannot connect to Supabase database. Please check:
            </p>
            <ul className="text-red-200 text-sm space-y-1 list-disc list-inside">
              <li>Supabase project URL and API key in client.ts</li>
              <li>Project is active and not paused</li>
              <li>Network connectivity</li>
              <li>API key permissions</li>
            </ul>
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
          <span className="text-green-400 font-semibold">Database Connected</span>
        </div>
      </div>

      {/* Test Results */}
      {testResults && (
        <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3 flex items-center">
            <Database className="mr-2" size={18} />
            Database Test Results
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Connection:</span>
              <span className={testResults.connection ? "text-green-400" : "text-red-400"}>
                {testResults.connection ? "✅ Connected" : "❌ Failed"}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300">music_tracks table:</span>
              <span className={testResults.tables.music_tracks ? "text-green-400" : "text-red-400"}>
                {testResults.tables.music_tracks ? "✅ Exists" : "❌ Missing"}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300">music_keywords table:</span>
              <span className={testResults.tables.music_keywords ? "text-green-400" : "text-red-400"}>
                {testResults.tables.music_keywords ? "✅ Exists" : "❌ Missing"}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300">uploaded_tracks table:</span>
              <span className={testResults.tables.uploaded_tracks ? "text-green-400" : "text-yellow-400"}>
                {testResults.tables.uploaded_tracks ? "✅ Exists" : "⚠️ Missing"}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Storage bucket:</span>
              <span className={testResults.storage ? "text-green-400" : "text-yellow-400"}>
                {testResults.storage ? "✅ Ready" : "⚠️ Not Setup"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Missing Table Warning */}
      {hasUploadedTracksTable === false && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-yellow-400 mt-1" size={20} />
            <div className="flex-1">
              <h4 className="text-yellow-400 font-semibold mb-2">Missing Required Table</h4>
              <p className="text-yellow-300 text-sm mb-3">
                The 'uploaded_tracks' table is required to store your uploaded music files in the database.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={createUploadedTracksTable}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <Play size={16} />
                  <span>Create Table Automatically</span>
                </button>
                
                <details className="text-xs">
                  <summary className="text-yellow-300 cursor-pointer hover:text-yellow-200">
                    Show Manual SQL Commands
                  </summary>
                  <div className="mt-2 p-3 bg-black/30 rounded border text-yellow-100 font-mono text-xs overflow-x-auto">
                    <pre>{`-- Run this in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.uploaded_tracks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  artist text NOT NULL DEFAULT 'Unknown Artist',
  duration text,
  file_path text NOT NULL UNIQUE,
  file_size bigint,
  mime_type text,
  thumbnail_url text,
  tags text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS and create policies
ALTER TABLE public.uploaded_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access" ON public.uploaded_tracks
  FOR ALL USING (true);`}</pre>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={runDatabaseTests}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        Refresh Tests
      </button>
    </div>
  );
};

export default DatabaseSetup; 