
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get active keywords from database
    const { data: keywords, error: keywordsError } = await supabaseClient
      .from('music_keywords')
      .select('keyword')
      .eq('is_active', true)

    if (keywordsError) {
      throw keywordsError
    }

    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')
    if (!YOUTUBE_API_KEY) {
      throw new Error('YouTube API key not configured')
    }

    // Fetch music for each keyword
    const allTracks = []
    
    for (const keywordObj of keywords) {
      const keyword = keywordObj.keyword
      console.log(`Fetching music for keyword: ${keyword}`)
      
      // Search for videos using YouTube Data API
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&` +
        `q=${encodeURIComponent(keyword)}&` +
        `type=video&` +
        `videoCategoryId=10&` + // Music category
        `order=date&` +
        `maxResults=10&` +
        `key=${YOUTUBE_API_KEY}`

      const searchResponse = await fetch(searchUrl)
      const searchData = await searchResponse.json()

      if (searchData.error) {
        console.error('YouTube API error:', searchData.error)
        continue
      }

      // Get video details for duration and view count
      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',')
      
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?` +
        `part=contentDetails,statistics&` +
        `id=${videoIds}&` +
        `key=${YOUTUBE_API_KEY}`

      const detailsResponse = await fetch(detailsUrl)
      const detailsData = await detailsResponse.json()

      // Process and store tracks
      for (let i = 0; i < searchData.items.length; i++) {
        const item = searchData.items[i]
        const details = detailsData.items[i]
        
        if (!details) continue

        // Parse duration from ISO 8601 format (PT4M13S -> 4:13)
        const duration = details.contentDetails.duration
        const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/)
        const minutes = match[1] || '0'
        const seconds = match[2] || '0'
        const formattedDuration = `${minutes}:${seconds.padStart(2, '0')}`

        // Extract artist and title from video title
        const fullTitle = item.snippet.title
        let title = fullTitle
        let artist = item.snippet.channelTitle

        // Try to split title if it contains common separators
        const separators = [' - ', ' – ', ' | ', ' by ']
        for (const sep of separators) {
          if (fullTitle.includes(sep)) {
            const parts = fullTitle.split(sep)
            if (parts.length >= 2) {
              artist = parts[0].trim()
              title = parts.slice(1).join(sep).trim()
              break
            }
          }
        }

        const track = {
          youtube_id: item.id.videoId,
          title: title,
          artist: artist,
          thumbnail_url: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
          duration: formattedDuration,
          view_count: parseInt(details.statistics.viewCount || '0'),
          published_at: item.snippet.publishedAt,
          channel_name: item.snippet.channelTitle,
          description: item.snippet.description,
          tags: item.snippet.tags || []
        }

        allTracks.push(track)
      }
    }

    // Insert or update tracks in database
    const { data: insertedTracks, error: insertError } = await supabaseClient
      .from('music_tracks')
      .upsert(allTracks, { 
        onConflict: 'youtube_id',
        ignoreDuplicates: false 
      })
      .select()

    if (insertError) {
      console.error('Database insert error:', insertError)
      throw insertError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully processed ${allTracks.length} tracks`,
        tracks: insertedTracks 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
