import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=3600'
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SITE_URL = "https://jooble.az";
const MAX_URLS_PER_FILE = 1000;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const filename = url.searchParams.get('file') || 'sitemap.xml';
  
  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const today = new Date().toISOString().split('T')[0];
    
    console.log(`Serving sitemap: ${filename}`);

    // Fetch data based on what's needed for the specific file
    const fetchAllData = async (table: string, select: string, orderBy?: string) => {
      let allData: any[] = [];
      let from = 0;
      const batchSize = 1000;
      
      while (true) {
        const query = supabase
          .from(table)
          .select(select)
          .eq('is_active', true)
          .range(from, from + batchSize - 1);
          
        if (orderBy) {
          query.order(orderBy);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        if (!data || data.length === 0) break;
        
        allData = allData.concat(data);
        
        if (data.length < batchSize) break;
        from += batchSize;
      }
      
      return allData;
    };

    if (filename === 'sitemap.xml' || filename === 'sitemap_index.xml') {
      // Generate sitemap index
      const [jobs, categories, companies] = await Promise.all([
        fetchAllData('jobs', 'id', 'created_at'),
        fetchAllData('categories', 'id', 'name'),
        fetchAllData('companies', 'id', 'name')
      ]);

      const jobChunks = Math.ceil(jobs.length / MAX_URLS_PER_FILE);
      const companyChunks = Math.ceil(companies.length / MAX_URLS_PER_FILE);

      let sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap-static.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-categories.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`;

      // Add job sitemap entries
      for (let i = 1; i <= jobChunks; i++) {
        sitemapIndex += `
  <sitemap>
    <loc>${SITE_URL}/sitemap-jobs-${i}.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`;
      }

      // Add company sitemap entries
      for (let i = 1; i <= companyChunks; i++) {
        sitemapIndex += `
  <sitemap>
    <loc>${SITE_URL}/sitemap-companies-${i}.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`;
      }

      sitemapIndex += `
</sitemapindex>`;

      return new Response(sitemapIndex, { headers: corsHeaders });

    } else if (filename === 'sitemap-static.xml') {
      // Generate static sitemap
      const staticXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/about</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/categories</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/companies</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/cv-builder</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/saved-jobs</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>`;

      return new Response(staticXml, { headers: corsHeaders });

    } else if (filename === 'sitemap-categories.xml') {
      // Generate categories sitemap
      const categories = await fetchAllData('categories', 'slug, updated_at', 'name');
      
      let categoriesXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
      
      categories.forEach(category => {
        const lastmod = category.updated_at ? new Date(category.updated_at).toISOString().split('T')[0] : today;
        categoriesXml += `
  <url>
    <loc>${SITE_URL}/categories/${category.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      });
      
      categoriesXml += `
</urlset>`;

      return new Response(categoriesXml, { headers: corsHeaders });

    } else if (filename.startsWith('sitemap-jobs-')) {
      // Generate jobs sitemap chunk
      const pageMatch = filename.match(/sitemap-jobs-(\d+)\.xml/);
      const page = pageMatch ? parseInt(pageMatch[1]) : 1;
      
      const from = (page - 1) * MAX_URLS_PER_FILE;
      const to = from + MAX_URLS_PER_FILE - 1;

      const { data: jobs } = await supabase
        .from('jobs')
        .select('slug, updated_at')
        .eq('is_active', true)
        .order('created_at')
        .range(from, to);

      let jobXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
      
      if (jobs) {
        jobs.forEach(job => {
          const lastmod = job.updated_at ? new Date(job.updated_at).toISOString().split('T')[0] : today;
          jobXml += `
  <url>
    <loc>${SITE_URL}/vacancies/${job.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
        });
      }
      
      jobXml += `
</urlset>`;

      return new Response(jobXml, { headers: corsHeaders });

    } else if (filename.startsWith('sitemap-companies-')) {
      // Generate companies sitemap chunk
      const pageMatch = filename.match(/sitemap-companies-(\d+)\.xml/);
      const page = pageMatch ? parseInt(pageMatch[1]) : 1;
      
      const from = (page - 1) * MAX_URLS_PER_FILE;
      const to = from + MAX_URLS_PER_FILE - 1;

      const { data: companies } = await supabase
        .from('companies')
        .select('slug, updated_at')
        .eq('is_active', true)
        .order('name')
        .range(from, to);

      let companyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
      
      if (companies) {
        companies.forEach(company => {
          const lastmod = company.updated_at ? new Date(company.updated_at).toISOString().split('T')[0] : today;
          companyXml += `
  <url>
    <loc>${SITE_URL}/companies/${company.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/companies/${company.slug}/about</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/companies/${company.slug}/vacancies</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
        });
      }
      
      companyXml += `
</urlset>`;

      return new Response(companyXml, { headers: corsHeaders });

    } else {
      // Default fallback
      const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

      return new Response(fallbackXml, { headers: corsHeaders });
    }

  } catch (error) {
    console.error(`Error serving sitemap ${filename}:`, error);
    
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new Response(fallbackXml, { headers: corsHeaders });
  }
});