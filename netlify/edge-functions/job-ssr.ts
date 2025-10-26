import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

export default async (request: Request, context: any) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  
  // Extract job slug from URL (e.g., /job/slug-name)
  if (pathParts[1] !== 'job' || !pathParts[2]) {
    return context.next();
  }

  const slug = pathParts[2];

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://igrtzfvphltnoiwedbtz.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzMTc4OTksImV4cCI6MjA0ODg5Mzg5OX0.lP9WW_xHZaCF77Zc2hDCxMrWABrZ92DqXoZjH-4v-J4';
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch job data from Supabase
    const { data: job, error } = await supabase
      .from('jobs')
      .select(`
        *,
        companies(name, logo),
        categories(name)
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !job) {
      console.error('Job not found:', error);
      return context.next();
    }

    // Fetch the original HTML
    const response = await context.next();
    const html = await response.text();

    // Prepare SEO data
    const seoTitle = job.seo_title || `${job.title} - ${job.companies?.name || 'İş Elanı'} | Jooble.az`;
    const seoDescription = job.seo_description || job.description?.substring(0, 160) || 'İş elanı';
    const seoKeywords = job.seo_keywords?.join(', ') || job.title;
    const jobUrl = `https://jooble.az/job/${slug}`;
    const companyLogo = job.companies?.logo || 'https://jooble.az/placeholder.svg';

    // Inject meta tags into HTML
    const modifiedHtml = html
      .replace(
        /<title>.*?<\/title>/i,
        `<title>${seoTitle}</title>`
      )
      .replace(
        /<meta\s+name="description"\s+content=".*?">/i,
        `<meta name="description" content="${seoDescription}">`
      )
      .replace(
        /<meta\s+name="keywords"\s+content=".*?">/i,
        `<meta name="keywords" content="${seoKeywords}">`
      )
      .replace(
        '</head>',
        `
    <!-- Job-specific SEO Meta Tags -->
    <meta property="og:title" content="${seoTitle}">
    <meta property="og:description" content="${seoDescription}">
    <meta property="og:url" content="${jobUrl}">
    <meta property="og:type" content="website">
    <meta property="og:image" content="${companyLogo}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${seoTitle}">
    <meta name="twitter:description" content="${seoDescription}">
    <meta name="twitter:image" content="${companyLogo}">
    <link rel="canonical" href="${jobUrl}">
    
    <!-- Structured Data for Job Posting -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": "${job.title}",
      "description": "${job.description?.replace(/"/g, '\\"').substring(0, 500)}",
      "datePosted": "${job.created_at}",
      "hiringOrganization": {
        "@type": "Organization",
        "name": "${job.companies?.name || 'Şirkət'}",
        "logo": "${companyLogo}"
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "${job.location}"
        }
      },
      "employmentType": "${job.type || 'FULL_TIME'}",
      ${job.salary ? `"baseSalary": {
        "@type": "MonetaryAmount",
        "currency": "AZN",
        "value": {
          "@type": "QuantitativeValue",
          "value": "${job.salary}"
        }
      },` : ''}
      "validThrough": "${job.expiration_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()}"
    }
    </script>
  </head>`
      );

    return new Response(modifiedHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=600',
      },
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return context.next();
  }
};

export const config = { path: '/job/*' };
