// Supabase Edge Function: sitemap-jobs
// Generates sitemap index and chunked sitemaps for jobs from database

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml; charset=utf-8",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PAGE_SIZE = 5000;
const SITE_URL = "https://jooble.az";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "0");

  try {
    // Get total count of active jobs (including null expiration dates)
    const { count } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
      .or(`expiration_date.is.null,expiration_date.gt.${new Date().toISOString()}`);

    const totalJobs = count || 0;
    const totalPages = Math.max(1, Math.ceil(totalJobs / PAGE_SIZE));

    console.log(`Total jobs: ${totalJobs}, Total pages: ${totalPages}, Requested page: ${page}`);

    // If page is 0 or not specified, return sitemap index
    if (page === 0) {
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      for (let p = 1; p <= totalPages; p++) {
        xml += `  <sitemap>\n`;
        xml += `    <loc>${SITE_URL}/sitemap_job.xml?page=${p}</loc>\n`;
        xml += `    <lastmod>${new Date().toISOString().split('.')[0]}Z</lastmod>\n`;
        xml += `  </sitemap>\n`;
      }

      xml += `</sitemapindex>`;
      
      console.log(`Generated sitemap index with ${totalPages} pages`);
      return new Response(xml, { headers: corsHeaders, status: 200 });
    }

    // Return specific page of jobs
    if (page < 1 || page > totalPages) {
      const errorXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
      return new Response(errorXml, { headers: corsHeaders, status: 200 });
    }

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data: jobs, error } = await supabase
      .from("jobs")
      .select("slug, updated_at")
      .eq("is_active", true)
      .or(`expiration_date.is.null,expiration_date.gt.${new Date().toISOString()}`)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching jobs:", error);
      throw error;
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const job of jobs || []) {
      if (!job.slug) continue;
      
      const lastmod = job.updated_at 
        ? new Date(job.updated_at).toISOString().split('.')[0] + 'Z'
        : new Date().toISOString().split('.')[0] + 'Z';
      
      xml += `  <url>\n`;
      xml += `    <loc>${SITE_URL}/?job=${encodeURIComponent(job.slug)}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    console.log(`Generated sitemap page ${page} with ${jobs?.length || 0} jobs`);
    return new Response(xml, { headers: corsHeaders, status: 200 });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
    return new Response(fallback, { headers: corsHeaders, status: 200 });
  }
});
