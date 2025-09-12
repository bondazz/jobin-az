// Supabase Edge Function: sitemap-main
// Generates a main sitemap.xml with current active links

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml; charset=utf-8",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE_URL = "https://jooble.az";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    const today = new Date().toISOString();

    // Fetch all active data
    const [jobsRes, companiesRes, categoriesRes] = await Promise.all([
      supabase.from("jobs").select("id, slug, updated_at").eq("is_active", true).order("updated_at", { ascending: false }),
      supabase.from("companies").select("id, slug, updated_at").eq("is_active", true).order("updated_at", { ascending: false }),
      supabase.from("categories").select("id, slug, updated_at").eq("is_active", true).order("updated_at", { ascending: false }),
    ]);

    const jobs = jobsRes.data || [];
    const companies = companiesRes.data || [];
    const categories = categoriesRes.data || [];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    const staticPages = [
      { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'daily' },
      { loc: `${SITE_URL}/companies`, priority: '0.9', changefreq: 'daily' },
      { loc: `${SITE_URL}/categories`, priority: '0.9', changefreq: 'daily' },
      { loc: `${SITE_URL}/about`, priority: '0.8', changefreq: 'monthly' },
      { loc: `${SITE_URL}/pricing`, priority: '0.7', changefreq: 'monthly' },
      { loc: `${SITE_URL}/referral`, priority: '0.6', changefreq: 'weekly' },
      { loc: `${SITE_URL}/cv-builder`, priority: '0.6', changefreq: 'monthly' },
    ];

    staticPages.forEach(page => {
      xml += `  <url>\n`;
      xml += `    <loc>${page.loc}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    // Categories
    categories.forEach(cat => {
      xml += `  <url>\n`;
      xml += `    <loc>${SITE_URL}/categories/${cat.slug}</loc>\n`;
      xml += `    <lastmod>${cat.updated_at}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    // Companies
    companies.forEach(company => {
      xml += `  <url>\n`;
      xml += `    <loc>${SITE_URL}/companies/${company.slug}</loc>\n`;
      xml += `    <lastmod>${company.updated_at}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
      
      xml += `  <url>\n`;
      xml += `    <loc>${SITE_URL}/companies/${company.slug}/about</loc>\n`;
      xml += `    <lastmod>${company.updated_at}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;
      
      xml += `  <url>\n`;
      xml += `    <loc>${SITE_URL}/companies/${company.slug}/jobs</loc>\n`;
      xml += `    <lastmod>${company.updated_at}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    // Jobs
    jobs.forEach(job => {
      xml += `  <url>\n`;
      xml += `    <loc>${SITE_URL}/jobs/${job.slug}</loc>\n`;
      xml += `    <lastmod>${job.updated_at}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    console.log(`Main sitemap generated with ${staticPages.length + categories.length + companies.length * 3 + jobs.length} URLs`);

    return new Response(xml, { headers: corsHeaders, status: 200 });
  } catch (error) {
    console.error("Main sitemap generation error:", error);
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${SITE_URL}/</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>`;
    return new Response(fallback, { headers: corsHeaders, status: 200 });
  }
});