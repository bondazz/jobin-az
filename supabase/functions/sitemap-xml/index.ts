import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SITE_URL = "https://jooble.az";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const section = url.searchParams.get('section');
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const pageSize = 5000;

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    console.log('Generating sitemap with section:', section, 'page:', page);
    console.log('Supabase URL:', SUPABASE_URL);

    const today = new Date().toISOString().split('T')[0];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Handle different sections
    if (section === 'static') {
      // Static pages only
      xml += `
  <url>
    <loc>${SITE_URL}</loc>
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
    <loc>${SITE_URL}/services</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/cv-builder</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/favorites</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>`;
    } else if (section === 'categories') {
      // Categories and their job URLs
      const { data: categories } = await supabase
        .from('categories')
        .select('id, slug, updated_at')
        .eq('is_active', true)
        .order('name');

      const { data: jobs } = await supabase
        .from('jobs')
        .select('slug, updated_at, category_id')
        .eq('is_active', true)
        .order('created_at');

      if (categories) {
        categories.forEach(category => {
          const lastmod = category.updated_at ? new Date(category.updated_at).toISOString().split('T')[0] : today;
          xml += `
  <url>
    <loc>${SITE_URL}/categories/${category.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
          
          // Add jobs for this category
          if (jobs) {
            const categoryJobs = jobs.filter(job => job.category_id === category.id);
            categoryJobs.forEach(job => {
              xml += `
  <url>
    <loc>${SITE_URL}/categories/${category.slug}/vacancy/${job.slug}</loc>
    <lastmod>${job.updated_at ? new Date(job.updated_at).toISOString().split('T')[0] : today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
            });
          }
        });
      }
    } else if (section === 'jobs') {
      // Paginated jobs
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data: jobs } = await supabase
        .from('jobs')
        .select('slug, updated_at')
        .eq('is_active', true)
        .order('created_at')
        .range(from, to);

      if (jobs) {
        jobs.forEach(job => {
          const lastmod = job.updated_at ? new Date(job.updated_at).toISOString().split('T')[0] : today;
          xml += `
  <url>
    <loc>${SITE_URL}/vacancies/${job.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
        });
      }
    } else if (section === 'companies') {
      // Paginated companies
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data: companies } = await supabase
        .from('companies')
        .select('id, slug, updated_at')
        .eq('is_active', true)
        .order('name')
        .range(from, to);

      const { data: jobs } = await supabase
        .from('jobs')
        .select('slug, updated_at, company_id')
        .eq('is_active', true)
        .order('created_at');

      if (companies) {
        companies.forEach(company => {
          const lastmod = company.updated_at ? new Date(company.updated_at).toISOString().split('T')[0] : today;
          xml += `
  <url>
    <loc>${SITE_URL}/companies/${company.slug}</loc>
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
          
          // Add jobs for this company
          if (jobs) {
            const companyJobs = jobs.filter(job => job.company_id === company.id);
            companyJobs.forEach(job => {
              xml += `
  <url>
    <loc>${SITE_URL}/companies/${company.slug}/vacancy/${job.slug}</loc>
    <lastmod>${job.updated_at ? new Date(job.updated_at).toISOString().split('T')[0] : today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
            });
          }
        });
      }
    } else {
      // Full sitemap - all URLs
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

      // Static pages
      xml += `
  <url>
    <loc>${SITE_URL}</loc>
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
    <loc>${SITE_URL}/services</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/cv-builder</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/favorites</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>`;

      // Job pages
      jobs.forEach(job => {
        const lastmod = job.updated_at ? new Date(job.updated_at).toISOString().split('T')[0] : today;
        xml += `
  <url>
    <loc>${SITE_URL}/vacancies/${job.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
      });

      // Category pages and their jobs
      categories.forEach(category => {
        const lastmod = category.updated_at ? new Date(category.updated_at).toISOString().split('T')[0] : today;
        xml += `
  <url>
    <loc>${SITE_URL}/categories/${category.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        
        const categoryJobs = jobs.filter(job => job.category_id === category.id);
        categoryJobs.forEach(job => {
          xml += `
  <url>
    <loc>${SITE_URL}/categories/${category.slug}/vacancy/${job.slug}</loc>
    <lastmod>${job.updated_at ? new Date(job.updated_at).toISOString().split('T')[0] : today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        });
      });

      // Company pages and their jobs
      companies.forEach(company => {
        const lastmod = company.updated_at ? new Date(company.updated_at).toISOString().split('T')[0] : today;
        xml += `
  <url>
    <loc>${SITE_URL}/companies/${company.slug}</loc>
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
        
        const companyJobs = jobs.filter(job => job.company_id === company.id);
        companyJobs.forEach(job => {
          xml += `
  <url>
    <loc>${SITE_URL}/companies/${company.slug}/vacancy/${job.slug}</loc>
    <lastmod>${job.updated_at ? new Date(job.updated_at).toISOString().split('T')[0] : today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
        });
      });
    }

    xml += `
</urlset>`;

    const totalUrls = (xml.match(/<url>/g) || []).length;
    console.log(`Sitemap generated with ${totalUrls} URLs for section: ${section || 'full'}, page: ${page}`);
    
    return new Response(xml, {
      headers: corsHeaders,
      status: 200,
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new Response(fallbackXml, {
      headers: corsHeaders,
      status: 200,
    });
  }
});