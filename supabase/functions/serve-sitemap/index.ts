import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=1800, s-maxage=3600',
  'Vary': 'Accept-Encoding',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SITE_URL = "https://jooble.az";
const MAX_URLS_PER_FILE = 5000; // Increased for better efficiency

// Enhanced URL rewriting with self-reference support
const ensureJoobleLinks = (xmlContent: string): string => {
  return xmlContent
    // Fix any malformed URLs first
    .replace(/(<loc>)\s*([^<]*?)\s*(<\/loc>)/g, (match, start, url, end) => {
      url = url.trim();
      
      // Already correct jooble.az URL
      if (url.startsWith('https://jooble.az/')) {
        return `${start}${url}${end}`;
      }
      
      // Supabase function URLs - convert to jooble.az
      if (url.includes('supabase.co/functions/')) {
        const pathMatch = url.match(/\/functions\/v1\/serve-sitemap\?file=(.+?)(?:&|$)/);
        if (pathMatch) {
          return `${start}${SITE_URL}/${pathMatch[1]}${end}`;
        }
      }
      
      // Relative paths
      if (url.startsWith('/')) {
        return `${start}${SITE_URL}${url}${end}`;
      }
      
      // XML files without domain
      if (url.endsWith('.xml') && !url.startsWith('http')) {
        return `${start}${SITE_URL}/${url}${end}`;
      }
      
      // Other relative URLs
      if (!url.startsWith('http')) {
        return `${start}${SITE_URL}/${url}${end}`;
      }
      
      // External URLs that aren't jooble.az - keep as is
      return match;
    })
    // Ensure all sitemap references are self-referential to jooble.az
    .replace(/(<loc>)([^<]*)(sitemap[^<]*\.xml)([^<]*)(<\/loc>)/g, (match, start, prefix, filename, suffix, end) => {
      return `${start}${SITE_URL}/${filename}${end}`;
    });
};

// Optimized data fetching with caching hints
const fetchBatchData = async (supabase: any, table: string, select: string, orderBy?: string, limit?: number) => {
  const query = supabase
    .from(table)
    .select(select)
    .eq('is_active', true);
    
  if (orderBy) query.order(orderBy);
  if (limit) query.limit(limit);
  
  const { data, error, count } = await query;
  if (error) {
    console.error(`Error fetching ${table}:`, error);
    throw error;
  }
  
  return { data: data || [], count: count || 0 };
};

// Function to fetch XML from external sources with jooble.az rewriting
const fetchSourceXml = async (supabase: any, sourceUrl?: string, storagePath?: string): Promise<string | null> => {
  try {
    if (sourceUrl) {
      console.log(`Fetching XML from URL: ${sourceUrl}`);
      const response = await fetch(sourceUrl, {
        headers: { 'User-Agent': 'jooble.az-sitemap-bot/1.0' }
      });
      if (response.ok) {
        const xmlContent = await response.text();
        return ensureJoobleLinks(xmlContent);
      }
    }
    
    if (storagePath) {
      console.log(`Fetching XML from storage: ${storagePath}`);
      const { data, error } = await supabase.storage
        .from('sitemaps')
        .download(storagePath);
      
      if (!error && data) {
        const xmlContent = await data.text();
        return ensureJoobleLinks(xmlContent);
      }
    }
  } catch (error) {
    console.error('Error fetching source XML:', error);
  }
  
  return null;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const filename = url.searchParams.get('file') || 'sitemap.xml';
  const sourceUrl = url.searchParams.get('source_url');
  const storagePath = url.searchParams.get('storage_path');
  
  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const today = new Date().toISOString().split('T')[0];
    
    console.log(`Serving sitemap: ${filename}`);

    // Check if we need to fetch and rewrite external XML with self-referencing
    if (sourceUrl || storagePath) {
      console.log('Attempting to fetch external XML source with jooble.az rewriting');
      const sourceXml = await fetchSourceXml(supabase, sourceUrl, storagePath);
      if (sourceXml) {
        // Ensure all sitemap links reference jooble.az properly
        const perfectedXml = ensureJoobleLinks(sourceXml);
        return new Response(perfectedXml, { headers: corsHeaders });
      }
      console.log('External source failed, falling back to dynamic generation');
    }

    // Enhanced data fetching with count optimization
    const fetchAllData = async (table: string, select: string, orderBy?: string, countOnly = false) => {
      if (countOnly) {
        const { count } = await supabase
          .from(table)
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true);
        return { data: [], count: count || 0 };
      }

      let allData: any[] = [];
      let from = 0;
      const batchSize = 2000; // Increased batch size for efficiency
      
      while (true) {
        const query = supabase
          .from(table)
          .select(select)
          .eq('is_active', true)
          .range(from, from + batchSize - 1);
          
        if (orderBy) query.order(orderBy);
        
        const { data, error } = await query;
        
        if (error) {
          console.error(`Error fetching ${table} from ${from}:`, error);
          throw error;
        }
        if (!data || data.length === 0) break;
        
        allData = allData.concat(data);
        console.log(`Fetched ${allData.length} ${table} records so far`);
        
        if (data.length < batchSize) break;
        from += batchSize;
      }
      
      return { data: allData, count: allData.length };
    };

    if (filename === 'sitemap.xml' || filename === 'sitemap_index.xml') {
      // Generate perfect sitemap index with self-referencing
      console.log('Generating dynamic sitemap index with self-references');
      
      const [jobsResult, categoriesResult, companiesResult] = await Promise.all([
        fetchAllData('jobs', 'id', 'created_at', true),
        fetchAllData('categories', 'id', 'name', true),
        fetchAllData('companies', 'id', 'name', true)
      ]);

      const jobChunks = Math.max(1, Math.ceil(jobsResult.count / MAX_URLS_PER_FILE));
      const companyChunks = Math.max(1, Math.ceil(companiesResult.count / MAX_URLS_PER_FILE));

      console.log(`Creating sitemap index: ${jobsResult.count} jobs (${jobChunks} chunks), ${companiesResult.count} companies (${companyChunks} chunks), ${categoriesResult.count} categories`);

      let sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static pages sitemap -->
  <sitemap>
    <loc>${SITE_URL}/sitemap-static.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <!-- Categories sitemap -->
  <sitemap>
    <loc>${SITE_URL}/sitemap-categories.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`;

      // Add job sitemap chunks with self-referencing
      for (let i = 1; i <= jobChunks; i++) {
        sitemapIndex += `
  <!-- Jobs chunk ${i} of ${jobChunks} -->
  <sitemap>
    <loc>${SITE_URL}/sitemap-jobs-${i}.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`;
      }

      // Add company sitemap chunks with self-referencing
      for (let i = 1; i <= companyChunks; i++) {
        sitemapIndex += `
  <!-- Companies chunk ${i} of ${companyChunks} -->
  <sitemap>
    <loc>${SITE_URL}/sitemap-companies-${i}.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`;
      }

      sitemapIndex += `
</sitemapindex>`;

      // Ensure all internal references point to jooble.az
      const perfectedIndex = ensureJoobleLinks(sitemapIndex);
      return new Response(perfectedIndex, { headers: corsHeaders });

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
      // Generate optimized categories sitemap
      console.log('Generating categories sitemap');
      const categoriesResult = await fetchAllData('categories', 'slug, updated_at', 'name');
      const categories = categoriesResult.data;
      
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

      console.log(`Generated categories sitemap with ${categories.length} categories`);
      const perfectedXml = ensureJoobleLinks(categoriesXml);
      return new Response(perfectedXml, { headers: corsHeaders });

    } else if (filename.startsWith('sitemap-jobs-')) {
      // Generate optimized jobs sitemap chunk
      const pageMatch = filename.match(/sitemap-jobs-(\d+)\.xml/);
      const page = pageMatch ? parseInt(pageMatch[1]) : 1;
      
      console.log(`Generating jobs sitemap chunk ${page}`);
      
      const from = (page - 1) * MAX_URLS_PER_FILE;
      const to = from + MAX_URLS_PER_FILE - 1;

      const { data: jobs, error } = await supabase
        .from('jobs')
        .select('slug, updated_at, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error(`Error fetching jobs chunk ${page}:`, error);
        throw error;
      }

      let jobXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
      
      if (jobs && jobs.length > 0) {
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
        console.log(`Generated jobs chunk ${page} with ${jobs.length} jobs`);
      } else {
        console.log(`Jobs chunk ${page} is empty`);
      }
      
      jobXml += `
</urlset>`;

      const perfectedXml = ensureJoobleLinks(jobXml);
      return new Response(perfectedXml, { headers: corsHeaders });

    } else if (filename.startsWith('sitemap-companies-')) {
      // Generate optimized companies sitemap chunk
      const pageMatch = filename.match(/sitemap-companies-(\d+)\.xml/);
      const page = pageMatch ? parseInt(pageMatch[1]) : 1;
      
      console.log(`Generating companies sitemap chunk ${page}`);
      
      const from = (page - 1) * MAX_URLS_PER_FILE;
      const to = from + MAX_URLS_PER_FILE - 1;

      const { data: companies, error } = await supabase
        .from('companies')
        .select('slug, updated_at, created_at')
        .eq('is_active', true)
        .order('name')
        .range(from, to);

      if (error) {
        console.error(`Error fetching companies chunk ${page}:`, error);
        throw error;
      }

      let companyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
      
      if (companies && companies.length > 0) {
        companies.forEach(company => {
          const lastmod = company.updated_at ? new Date(company.updated_at).toISOString().split('T')[0] : today;
          // Main company page
          companyXml += `
  <url>
    <loc>${SITE_URL}/companies/${company.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
          // About page
          companyXml += `
  <url>
    <loc>${SITE_URL}/companies/${company.slug}/about</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
          // Vacancies page
          companyXml += `
  <url>
    <loc>${SITE_URL}/companies/${company.slug}/vacancies</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
        });
        console.log(`Generated companies chunk ${page} with ${companies.length} companies (${companies.length * 3} URLs)`);
      } else {
        console.log(`Companies chunk ${page} is empty`);
      }
      
      companyXml += `
</urlset>`;

      const perfectedXml = ensureJoobleLinks(companyXml);
      return new Response(perfectedXml, { headers: corsHeaders });

    } else {
      // Enhanced fallback with common files support
      console.log(`Attempting to serve unknown sitemap file: ${filename}`);
      
      // Handle common sitemap variants
      if (filename === 'sitemap_main.xml' || filename === 'sitemapjooble.xml') {
        return new Response(await generateMainSitemap(today), { headers: corsHeaders });
      }
      
      // Default homepage fallback
      const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

      const perfectedXml = ensureJoobleLinks(fallbackXml);
      return new Response(perfectedXml, { headers: corsHeaders });
    }

  } catch (error) {
    console.error(`Critical error serving sitemap ${filename}:`, error);
    
    // Generate intelligent fallback based on requested file
    let fallbackXml;
    if (filename.includes('index')) {
      fallbackXml = await generateMainSitemap(new Date().toISOString().split('T')[0]);
    } else {
      fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    }

    const perfectedFallback = ensureJoobleLinks(fallbackXml);
    return new Response(perfectedFallback, { 
      headers: { ...corsHeaders, 'X-Sitemap-Error': 'fallback-generated' }
    });
  }
});

// Helper function for main sitemap generation
async function generateMainSitemap(today: string): Promise<string> {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;
}