import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
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

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const today = new Date().toISOString().split('T')[0];
    
    console.log('Starting sitemap generation...');

    // Fetch all data from database
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

    const [jobs, categories, companies] = await Promise.all([
      fetchAllData('jobs', 'slug, updated_at, category_id, company_id', 'created_at'),
      fetchAllData('categories', 'id, slug, updated_at', 'name'),
      fetchAllData('companies', 'id, slug, updated_at', 'name')
    ]);

    console.log(`Found ${jobs.length} jobs, ${categories.length} categories, ${companies.length} companies`);

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

    // Generate categories sitemap
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

    // Generate jobs sitemaps (chunked)
    const jobChunks = [];
    for (let i = 0; i < jobs.length; i += MAX_URLS_PER_FILE) {
      const chunk = jobs.slice(i, i + MAX_URLS_PER_FILE);
      let jobXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
      
      chunk.forEach(job => {
        const lastmod = job.updated_at ? new Date(job.updated_at).toISOString().split('T')[0] : today;
        jobXml += `
  <url>
    <loc>${SITE_URL}/vacancies/${job.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
      });
      
      jobXml += `
</urlset>`;
      jobChunks.push(jobXml);
    }

    // Generate companies sitemaps (chunked)
    const companyChunks = [];
    for (let i = 0; i < companies.length; i += MAX_URLS_PER_FILE) {
      const chunk = companies.slice(i, i + MAX_URLS_PER_FILE);
      let companyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
      
      chunk.forEach(company => {
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
      
      companyXml += `
</urlset>`;
      companyChunks.push(companyXml);
    }

    // Generate sitemap index
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
    for (let i = 0; i < jobChunks.length; i++) {
      sitemapIndex += `
  <sitemap>
    <loc>${SITE_URL}/sitemap-jobs-${i + 1}.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`;
    }

    // Add company sitemap entries
    for (let i = 0; i < companyChunks.length; i++) {
      sitemapIndex += `
  <sitemap>
    <loc>${SITE_URL}/sitemap-companies-${i + 1}.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`;
    }

    sitemapIndex += `
</sitemapindex>`;

    // Store files in Supabase storage for serving
    const { error: uploadError } = await supabase.storage
      .from('sitemaps')
      .upload('sitemap-index.xml', sitemapIndex, {
        contentType: 'application/xml',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading sitemap index:', uploadError);
    }

    // Upload static sitemap
    await supabase.storage
      .from('sitemaps')
      .upload('sitemap-static.xml', staticXml, {
        contentType: 'application/xml',
        upsert: true
      });

    // Upload categories sitemap
    await supabase.storage
      .from('sitemaps')
      .upload('sitemap-categories.xml', categoriesXml, {
        contentType: 'application/xml',
        upsert: true
      });

    // Upload job sitemaps
    for (let i = 0; i < jobChunks.length; i++) {
      await supabase.storage
        .from('sitemaps')
        .upload(`sitemap-jobs-${i + 1}.xml`, jobChunks[i], {
          contentType: 'application/xml',
          upsert: true
        });
    }

    // Upload company sitemaps
    for (let i = 0; i < companyChunks.length; i++) {
      await supabase.storage
        .from('sitemaps')
        .upload(`sitemap-companies-${i + 1}.xml`, companyChunks[i], {
          contentType: 'application/xml',
          upsert: true
        });
    }

    const stats = {
      totalUrls: jobs.length + categories.length + companies.length * 3 + 6, // 6 static pages
      staticPages: 6,
      categories: categories.length,
      jobs: jobs.length,
      jobFiles: jobChunks.length,
      companies: companies.length * 3, // Each company has 3 pages
      companyFiles: companyChunks.length,
      generatedAt: new Date().toISOString()
    };

    console.log('Sitemap generation completed:', stats);

    return new Response(JSON.stringify({
      success: true,
      message: 'Bütün sitemap faylları uğurla yaradıldı',
      stats
    }), {
      headers: corsHeaders,
      status: 200,
    });

  } catch (error) {
    console.error('Error generating sitemaps:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Sitemap yaradılarkən xəta baş verdi'
    }), {
      headers: corsHeaders,
      status: 500,
    });
  }
});