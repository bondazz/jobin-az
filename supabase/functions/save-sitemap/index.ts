import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { sitemapContent, filename = 'sitemap.xml' } = await req.json();

    // Ensure bucket exists and is public
    try {
      const { data: bucket, error: getBucketError } = await supabase.storage.getBucket('sitemaps');
      if (getBucketError || !bucket) {
        await supabase.storage.createBucket('sitemaps', {
          public: true,
        });
      } else if (bucket.public === false) {
        await supabase.storage.updateBucket('sitemaps', { public: true });
      }
    } catch (e) {
      console.warn('Bucket check/create warning:', e);
    }

    if (!sitemapContent) {
      return new Response(JSON.stringify({ error: 'Sitemap content is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate XML format
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(sitemapContent, "text/xml");
      const errorNode = doc.querySelector("parsererror");
      if (errorNode) {
        throw new Error("Invalid XML format");
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid XML format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { error: uploadError } = await supabase.storage
      .from('sitemaps')
      .upload(filename, new Blob([sitemapContent], { type: 'application/xml;charset=utf-8' }), {
        contentType: 'application/xml;charset=utf-8',
        upsert: true,
        cacheControl: '0',
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return new Response(JSON.stringify({ error: 'Failed to save sitemap' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Sitemap saved successfully',
      filename 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error saving sitemap:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});