import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=3600',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SITE_URL = "https://jooble.az";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const today = new Date().toISOString().split('T')[0];

    console.log('Generating sitemap-main with all URLs');

    // Fetch all data in parallel
    const [jobsResult, companiesResult, categoriesResult, regionsResult] = await Promise.all([
      supabase
        .from('jobs')
        .select('slug, updated_at')
        .eq('is_active', true)
        .order('updated_at', { ascending: false }),
      supabase
        .from('companies')
        .select('slug, updated_at')
        .eq('is_active', true)
        .order('name'),
      supabase
        .from('categories')
        .select('slug, updated_at')
        .eq('is_active', true)
        .order('name'),
      supabase
        .from('regions')
        .select('slug, updated_at')
        .eq('is_active', true)
        .order('name'),
    ]);

    const jobs = jobsResult.data || [];
    const companies = companiesResult.data || [];
    const categories = categoriesResult.data || [];
    const regions = regionsResult.data || [];

    console.log(`Found: ${jobs.length} jobs, ${companies.length} companies, ${categories.length} categories, ${regions.length} regions`);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // 1. Static pages (required)
    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      { loc: '/vacancies', priority: '0.9', changefreq: 'daily' },
      { loc: '/companies', priority: '0.8', changefreq: 'daily' },
      { loc: '/categories', priority: '0.8', changefreq: 'weekly' },
      { loc: '/regions', priority: '0.8', changefreq: 'weekly' },
      { loc: '/subscribe', priority: '0.6', changefreq: 'monthly' },
      { loc: '/referral', priority: '0.6', changefreq: 'monthly' },
      { loc: '/add_job', priority: '0.7', changefreq: 'monthly' },
      { loc: '/about', priority: '0.7', changefreq: 'monthly' },
      { loc: '/services', priority: '0.7', changefreq: 'monthly' },
    ];

    staticPages.forEach(page => {
      xml += `
  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // 2. Categories - format: /categories/[slug]
    categories.forEach(category => {
      const lastmod = category.updated_at ? new Date(category.updated_at).toISOString().split('T')[0] : today;
      xml += `
  <url>
    <loc>${SITE_URL}/categories/${category.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    // 3. Regions - format: /regions/[slug]
    regions.forEach(region => {
      const lastmod = region.updated_at ? new Date(region.updated_at).toISOString().split('T')[0] : today;
      xml += `
  <url>
    <loc>${SITE_URL}/regions/${region.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    // 4. Companies - ONLY format: /companies/[slug] (NO /vacancies or /vacancy/[job] sub-paths)
    companies.forEach(company => {
      const lastmod = company.updated_at ? new Date(company.updated_at).toISOString().split('T')[0] : today;
      xml += `
  <url>
    <loc>${SITE_URL}/companies/${company.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    // 5. Vacancies - ONLY format: /vacancies/[slug] (NOT nested under companies)
    jobs.forEach(job => {
      const lastmod = job.updated_at ? new Date(job.updated_at).toISOString().split('T')[0] : today;
      xml += `
  <url>
    <loc>${SITE_URL}/vacancies/${job.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    const totalUrls = staticPages.length + categories.length + regions.length + companies.length + jobs.length;
    console.log(`Generated sitemap-main with ${totalUrls} total URLs`);

    return new Response(xml, { headers: corsHeaders });

  } catch (error) {
    console.error('Sitemap-main generation error:', error);
    
    // Fallback with static pages only
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/vacancies</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/companies</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/categories</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/regions</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/subscribe</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${SITE_URL}/referral</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${SITE_URL}/add_job</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/about</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/services</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

    return new Response(fallbackXml, { 
      headers: { ...corsHeaders, 'X-Sitemap-Error': 'fallback-generated' }
    });
  }
});
