// Supabase Edge Function: indexnew
// Generates separate sitemap files for different content types and uploads them to storage

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json; charset=utf-8",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE_URL = "https://jooble.az";

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    console.log("Starting sitemap generation...");
    const today = new Date().toISOString();

    // Fetch all data
    console.log("Fetching data from database...");
    const [jobsData, categoriesData, companiesData] = await Promise.all([
      supabase.from("jobs").select("slug, updated_at").eq("is_active", true).order("updated_at", { ascending: false }),
      supabase.from("categories").select("slug, updated_at").eq("is_active", true).order("updated_at", { ascending: false }),
      supabase.from("companies").select("slug, updated_at").eq("is_active", true).order("updated_at", { ascending: false }),
    ]);

    const jobs = jobsData.data || [];
    const categories = categoriesData.data || [];
    const companies = companiesData.data || [];

    console.log(`Fetched ${jobs.length} jobs, ${categories.length} categories, ${companies.length} companies`);

    // Generate sitemap_static.xml (static pages)
    let staticXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    staticXml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "daily" },
      { url: "/about", priority: "0.8", changefreq: "weekly" },
      { url: "/pricing", priority: "0.8", changefreq: "weekly" },
      { url: "/categories", priority: "0.9", changefreq: "daily" },
      { url: "/companies", priority: "0.9", changefreq: "daily" },
      { url: "/saved-jobs", priority: "0.6", changefreq: "weekly" },
      { url: "/referral", priority: "0.7", changefreq: "weekly" },
    ];

    for (const page of staticPages) {
      staticXml += `  <url>\n`;
      staticXml += `    <loc>${SITE_URL}${page.url}</loc>\n`;
      staticXml += `    <lastmod>${today}</lastmod>\n`;
      staticXml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      staticXml += `    <priority>${page.priority}</priority>\n`;
      staticXml += `  </url>\n`;
    }
    staticXml += `</urlset>`;

    // Generate sitemap_categories.xml
    let categoriesXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    categoriesXml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    for (const category of categories) {
      categoriesXml += `  <url>\n`;
      categoriesXml += `    <loc>${SITE_URL}/categories/${category.slug}</loc>\n`;
      categoriesXml += `    <lastmod>${category.updated_at || today}</lastmod>\n`;
      categoriesXml += `    <changefreq>daily</changefreq>\n`;
      categoriesXml += `    <priority>0.8</priority>\n`;
      categoriesXml += `  </url>\n`;
    }
    categoriesXml += `</urlset>`;

    // Generate sitemap_companies.xml
    let companiesXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    companiesXml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    for (const company of companies) {
      // Company profile page
      companiesXml += `  <url>\n`;
      companiesXml += `    <loc>${SITE_URL}/companies/${company.slug}</loc>\n`;
      companiesXml += `    <lastmod>${company.updated_at || today}</lastmod>\n`;
      companiesXml += `    <changefreq>weekly</changefreq>\n`;
      companiesXml += `    <priority>0.7</priority>\n`;
      companiesXml += `  </url>\n`;
      
      // Company about page
      companiesXml += `  <url>\n`;
      companiesXml += `    <loc>${SITE_URL}/companies/${company.slug}/about</loc>\n`;
      companiesXml += `    <lastmod>${company.updated_at || today}</lastmod>\n`;
      companiesXml += `    <changefreq>weekly</changefreq>\n`;
      companiesXml += `    <priority>0.6</priority>\n`;
      companiesXml += `  </url>\n`;
    }
    companiesXml += `</urlset>`;

    // Generate sitemap_jobs.xml
    let jobsXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    jobsXml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    for (const job of jobs) {
      jobsXml += `  <url>\n`;
      jobsXml += `    <loc>${SITE_URL}/vacancies/${job.slug}</loc>\n`;
      jobsXml += `    <lastmod>${job.updated_at || today}</lastmod>\n`;
      jobsXml += `    <changefreq>daily</changefreq>\n`;
      jobsXml += `    <priority>0.9</priority>\n`;
      jobsXml += `  </url>\n`;
    }
    jobsXml += `</urlset>`;

    // Generate sitemap_index.xml
    let indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    indexXml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    indexXml += `  <sitemap>\n    <loc>${SITE_URL}/sitemap_static.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
    indexXml += `  <sitemap>\n    <loc>${SITE_URL}/sitemap_categories.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
    indexXml += `  <sitemap>\n    <loc>${SITE_URL}/sitemap_companies.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
    indexXml += `  <sitemap>\n    <loc>${SITE_URL}/sitemap_jobs.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
    indexXml += `</sitemapindex>`;

    console.log("Uploading sitemaps to storage...");

    // Upload all sitemaps to storage
    const uploadPromises = [
      supabase.storage.from("sitemaps").upload("sitemap_index.xml", new Blob([indexXml], { type: "application/xml" }), { upsert: true }),
      supabase.storage.from("sitemaps").upload("sitemap_static.xml", new Blob([staticXml], { type: "application/xml" }), { upsert: true }),
      supabase.storage.from("sitemaps").upload("sitemap_categories.xml", new Blob([categoriesXml], { type: "application/xml" }), { upsert: true }),
      supabase.storage.from("sitemaps").upload("sitemap_companies.xml", new Blob([companiesXml], { type: "application/xml" }), { upsert: true }),
      supabase.storage.from("sitemaps").upload("sitemap_jobs.xml", new Blob([jobsXml], { type: "application/xml" }), { upsert: true }),
    ];

    const uploadResults = await Promise.all(uploadPromises);
    
    // Check for errors
    const errors = uploadResults.filter(r => r.error);
    if (errors.length > 0) {
      console.error("Upload errors:", errors);
      throw new Error(`Failed to upload ${errors.length} sitemap(s)`);
    }

    console.log("Sitemaps generated and uploaded successfully");

    const stats = {
      success: true,
      message: "Sitemaps generated and uploaded successfully",
      stats: {
        staticPages: staticPages.length,
        categories: categories.length,
        companies: companies.length * 2, // profile + about pages
        jobs: jobs.length,
        totalUrls: staticPages.length + categories.length + (companies.length * 2) + jobs.length,
      },
      files: [
        "sitemap_index.xml",
        "sitemap_static.xml",
        "sitemap_categories.xml",
        "sitemap_companies.xml",
        "sitemap_jobs.xml",
      ],
    };

    return new Response(JSON.stringify(stats), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" }, 
      status: 200 
    });

  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unknown error occurred" 
      }), 
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});
