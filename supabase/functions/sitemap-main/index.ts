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
const BATCH_SIZE = 1000; // Supabase default limit

// Fetch all records with pagination to bypass 1000 limit
async function fetchAllRecords(supabase: any, table: string, select: string, orderBy?: string): Promise<any[]> {
  let allData: any[] = [];
  let from = 0;
  
  while (true) {
    const query = supabase
      .from(table)
      .select(select)
      .eq('is_active', true)
      .range(from, from + BATCH_SIZE - 1);
    
    if (orderBy) {
      query.order(orderBy, { ascending: true });
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error fetching ${table} from ${from}:`, error);
      throw error;
    }
    
    if (!data || data.length === 0) break;
    
    allData = allData.concat(data);
    console.log(`Fetched ${allData.length} ${table} records so far`);
    
    // If we got less than BATCH_SIZE, we've reached the end
    if (data.length < BATCH_SIZE) break;
    
    from += BATCH_SIZE;
  }
  
  return allData;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const today = new Date().toISOString().split('T')[0];

    console.log('Generating sitemap-main with ALL URLs (pagination enabled)');

    // Fetch all data with pagination in parallel
    const [jobs, companies, categories, regions, customPages] = await Promise.all([
      fetchAllRecords(supabase, 'jobs', 'slug, updated_at', 'created_at'),
      fetchAllRecords(supabase, 'companies', 'slug, updated_at', 'name'),
      fetchAllRecords(supabase, 'categories', 'slug, updated_at', 'name'),
      fetchAllRecords(supabase, 'regions', 'slug, updated_at', 'name'),
      fetchAllRecords(supabase, 'custom_pages', 'slug, updated_at', 'created_at'),
    ]);

    console.log(`Total found: ${jobs.length} jobs, ${companies.length} companies, ${categories.length} categories, ${regions.length} regions, ${customPages.length} custom pages`);

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

    // 6. Custom SEO Pages - format: /[slug] (only active pages)
    customPages.forEach(page => {
      const lastmod = page.updated_at ? new Date(page.updated_at).toISOString().split('T')[0] : today;
      // Clean slug - remove leading slash if present for URL construction
      const cleanSlug = page.slug.startsWith('/') ? page.slug.slice(1) : page.slug;
      xml += `
  <url>
    <loc>${SITE_URL}/${cleanSlug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    const totalUrls = staticPages.length + categories.length + regions.length + companies.length + jobs.length + customPages.length;
    console.log(`Generated sitemap-main with ${totalUrls} total URLs (including ${customPages.length} custom pages)`);

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
