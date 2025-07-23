import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching sitemap data with SUPABASE_SERVICE_ROLE_KEY...');
    console.log('Supabase URL:', supabaseUrl);

    // Fetch all data with increased limits for large datasets
    const [jobsData, categoriesData, companiesData] = await Promise.all([
      supabase.from('jobs').select('slug, updated_at, category_id, company_id').eq('is_active', true).limit(100000).order('created_at', { ascending: false }),
      supabase.from('categories').select('id, slug, updated_at').eq('is_active', true).limit(10000).order('name'),
      supabase.from('companies').select('id, slug, updated_at').eq('is_active', true).limit(10000).order('name')
    ]);

    if (jobsData.error) {
      console.error('Error fetching jobs:', jobsData.error);
      throw new Error('Failed to fetch jobs');
    }
    
    if (categoriesData.error) {
      console.error('Error fetching categories:', categoriesData.error);
      throw new Error('Failed to fetch categories');
    }
    
    if (companiesData.error) {
      console.error('Error fetching companies:', companiesData.error);
      throw new Error('Failed to fetch companies');
    }

    const jobs = jobsData.data || [];
    const categories = categoriesData.data || [];
    const companies = companiesData.data || [];

    console.log(`Found ${jobs.length} jobs, ${categories.length} categories, ${companies.length} companies - Total URLs will be approximately ${jobs.length + categories.length + (companies.length * 2) + 7}`);

    // Build sitemap XML
    const baseUrl = 'https://jooble.az';
    const today = new Date().toISOString().split('T')[0];
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/categories</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/companies</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/services</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/cv-builder</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/favorites</loc>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>`;

    // Add job pages - each job gets a vacancy page
    jobs.forEach(job => {
      const lastmod = job.updated_at ? new Date(job.updated_at).toISOString().split('T')[0] : today;
      xml += `
  <url>
    <loc>${baseUrl}/vacancies/${job.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    });

    // Add category pages - main category page and jobs that belong to each category
    categories.forEach(category => {
      const lastmod = category.updated_at ? new Date(category.updated_at).toISOString().split('T')[0] : today;
      xml += `
  <url>
    <loc>${baseUrl}/categories/${category.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      
      // Add only jobs that actually belong to this category
      const categoryJobs = jobs.filter(job => job.category_id === category.id);
      categoryJobs.forEach(job => {
        xml += `
  <url>
    <loc>${baseUrl}/categories/${category.slug}/vacancy/${job.slug}</loc>
    <lastmod>${job.updated_at ? new Date(job.updated_at).toISOString().split('T')[0] : today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      });
    });

    // Add company pages - main company page, vacancies page, and each job within company
    companies.forEach(company => {
      const lastmod = company.updated_at ? new Date(company.updated_at).toISOString().split('T')[0] : today;
      xml += `
  <url>
    <loc>${baseUrl}/companies/${company.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/companies/${company.slug}/vacancies</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      
      // Add only jobs that actually belong to this company
      const companyJobs = jobs.filter(job => job.company_id === company.id);
      companyJobs.forEach(job => {
        xml += `
  <url>
    <loc>${baseUrl}/companies/${company.slug}/vacancy/${job.slug}</loc>
    <lastmod>${job.updated_at ? new Date(job.updated_at).toISOString().split('T')[0] : today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      });
    });

    xml += `
</urlset>`;

    const totalUrls = (xml.match(/<url>/g) || []).length;
    console.log(`Sitemap generated successfully with ${totalUrls} URLs`);
    
    return new Response(xml, {
      headers: corsHeaders,
      status: 200,
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return fallback sitemap
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://jooble.az</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://jooble.az/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://jooble.az/categories</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://jooble.az/companies</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://jooble.az/services</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

    return new Response(fallbackXml, {
      headers: corsHeaders,
      status: 200,
    });
  }
});