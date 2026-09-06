// Supabase Edge Function: sitemap-index
// Generates a sitemap index that points to chunked sitemaps for jobs and companies,
// plus single files for categories and static pages.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml; charset=utf-8",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PAGE_SIZE = 5000; // well within 50k URL limit per file
const SITE_URL = "https://jooble.az"; // public site origin

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    // Count active rows
    const [{ count: jobsCount }, { count: companiesCount }, { count: categoriesCount }] = await Promise.all([
      supabase.from("jobs").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("companies").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("categories").select("id", { count: "exact", head: true }).eq("is_active", true),
    ]);

    const jobsPages = Math.max(1, Math.ceil((jobsCount || 0) / PAGE_SIZE));
    const companiesPages = Math.max(1, Math.ceil((companiesCount || 0) / PAGE_SIZE));

    const today = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static and categories single files
    xml += `  <sitemap>\n    <loc>${SITE_URL}/sitemap-static.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
    xml += `  <sitemap>\n    <loc>${SITE_URL}/sitemap-categories.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;

    // Jobs pages
    for (let p = 1; p <= jobsPages; p++) {
      xml += `  <sitemap>\n    <loc>${SITE_URL}/sitemap-jobs-${p}.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
    }

    // Companies pages
    for (let p = 1; p <= companiesPages; p++) {
      xml += `  <sitemap>\n    <loc>${SITE_URL}/sitemap-companies-${p}.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
    }

    xml += `</sitemapindex>`;

    return new Response(xml, { headers: corsHeaders, status: 200 });
  } catch (error) {
    console.error("Sitemap index generation error:", error);
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap>\n    <loc>${SITE_URL}/sitemap-static.xml</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n  </sitemap>\n</sitemapindex>`;
    return new Response(fallback, { headers: corsHeaders, status: 200 });
  }
});