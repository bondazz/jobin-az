import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const path = url.pathname.split('/store-prerender-snapshot')[1] || '/';

    // GET: Retrieve prerendered snapshot
    if (req.method === 'GET') {
      const snapshotPath = `prerenders${path}.html`;
      
      const { data, error } = await supabaseClient.storage
        .from('prerender-snapshots')
        .download(snapshotPath);

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: 'Snapshot not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const html = await data.text();

      return new Response(html, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=604800',
          'X-Prerender-Snapshot': 'true',
          'X-Snapshot-Date': new Date().toISOString(),
        },
      });
    }

    // POST: Store new prerendered snapshot
    if (req.method === 'POST') {
      const { path: targetPath, html } = await req.json();

      if (!targetPath || !html) {
        return new Response(
          JSON.stringify({ error: 'Missing path or html in request body' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const snapshotPath = `prerenders${targetPath}.html`;
      
      // Store in Supabase Storage
      const { error: uploadError } = await supabaseClient.storage
        .from('prerender-snapshots')
        .upload(snapshotPath, html, {
          contentType: 'text/html',
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return new Response(
          JSON.stringify({ error: 'Failed to store snapshot', details: uploadError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Store metadata
      const { error: metadataError } = await supabaseClient
        .from('prerender_metadata')
        .upsert({
          path: targetPath,
          snapshot_path: snapshotPath,
          created_at: new Date().toISOString(),
          ttl_days: 7,
          manual: true,
        });

      if (metadataError) {
        console.warn('Metadata storage warning:', metadataError);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          path: snapshotPath,
          message: 'Snapshot stored successfully. TTL: 7 days'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
