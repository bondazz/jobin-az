// Supabase Edge Function: sitemap-jobs
// Mirrors sitemap from storage.jooble.az

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml; charset=utf-8",
};

const MIRROR_URL = "https://storage.jooble.az/public/sitemap.xml";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`Fetching sitemap from: ${MIRROR_URL}`);
    
    const response = await fetch(MIRROR_URL, {
      headers: {
        "Accept": "application/xml, text/xml",
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch sitemap: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch sitemap: ${response.status}`);
    }

    const xml = await response.text();
    console.log(`Successfully fetched sitemap (${xml.length} bytes)`);

    return new Response(xml, { headers: corsHeaders, status: 200 });
  } catch (error) {
    console.error("Sitemap mirror error:", error);
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
    return new Response(fallback, { headers: corsHeaders, status: 200 });
  }
});
