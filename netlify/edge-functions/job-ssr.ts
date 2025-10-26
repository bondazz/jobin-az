import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

export default async (request: Request, context: any) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  
  // Detect route type and slug
  const routeType = pathParts[1]; // 'vacancies' or 'companies'
  const slug = pathParts[2];
  
  // Only handle dynamic routes with slugs
  if (!slug || !['vacancies', 'companies'].includes(routeType)) {
    return context.next();
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://igrtzfvphltnoiwedbtz.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzMTc4OTksImV4cCI6MjA0ODg5Mzg5OX0.lP9WW_xHZaCF77Zc2hDCxMrWABrZ92DqXoZjH-4v-J4';
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    let data: any;
    let error: any;
    let seoTitle: string;
    let seoDescription: string;
    let seoKeywords: string;
    let pageUrl: string;
    let structuredData: any = null;

    // Fetch data based on route type
    if (routeType === 'vacancies') {
      const result = await supabase
        .from('jobs')
        .select(`
          *,
          companies(name, logo),
          categories(name)
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
      
      data = result.data;
      error = result.error;

      if (data) {
        seoTitle = data.seo_title || `${data.title} - ${data.companies?.name || 'İş Elanı'} | Jooble.az`;
        seoDescription = data.seo_description || data.description?.substring(0, 160) || 'İş elanı';
        seoKeywords = data.seo_keywords?.join(', ') || data.title;
        pageUrl = `https://jooble.az/vacancies/${slug}`;

        // Job Posting structured data
        structuredData = {
          "@context": "https://schema.org",
          "@type": "JobPosting",
          "title": data.title,
          "description": data.description?.replace(/"/g, '\\"').substring(0, 500),
          "datePosted": data.created_at,
          "hiringOrganization": {
            "@type": "Organization",
            "name": data.companies?.name || 'Şirkət',
            "logo": data.companies?.logo || 'https://jooble.az/placeholder.svg'
          },
          "jobLocation": {
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": data.location
            }
          },
          "employmentType": data.type || 'FULL_TIME',
          ...(data.salary ? {
            "baseSalary": {
              "@type": "MonetaryAmount",
              "currency": "AZN",
              "value": {
                "@type": "QuantitativeValue",
                "value": data.salary
              }
            }
          } : {}),
          "validThrough": data.expiration_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
      }
    } else if (routeType === 'companies') {
      const result = await supabase
        .from('companies')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
      
      data = result.data;
      error = result.error;

      if (data) {
        seoTitle = data.seo_title || `${data.name} - Şirkət Profili | Jooble.az`;
        seoDescription = data.seo_description || data.description?.substring(0, 160) || `${data.name} haqqında məlumat`;
        seoKeywords = data.seo_keywords?.join(', ') || data.name;
        pageUrl = `https://jooble.az/companies/${slug}`;

        // Organization structured data
        structuredData = {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": data.name,
          "description": data.description?.substring(0, 200),
          "logo": data.logo || 'https://jooble.az/placeholder.svg',
          "url": data.website || pageUrl,
          ...(data.address ? { "address": data.address } : {}),
          ...(data.email ? { "email": data.email } : {}),
          ...(data.phone ? { "telephone": data.phone } : {})
        };
      }
    }

    if (error || !data) {
      console.error(`${routeType} not found:`, error);
      return context.next();
    }

    // Fetch the original HTML
    const response = await context.next();
    const html = await response.text();

    const ogImage = routeType === 'vacancies' 
      ? (data.companies?.logo || 'https://jooble.az/placeholder.svg')
      : routeType === 'companies'
      ? (data.logo || 'https://jooble.az/placeholder.svg')
      : 'https://jooble.az/placeholder.svg';

    // Inject meta tags into HTML
    // Clean existing meta tags comprehensively and inject server-side SEO to avoid flicker
    const safeTitle = (seoTitle || '').replace(/"/g, '&quot;');
    const safeDescription = (seoDescription || '').replace(/"/g, '&quot;');
    const safeKeywords = (seoKeywords || '').replace(/"/g, '&quot;');

    const cleanedHtml = html
      // Remove existing title
      .replace(/<title>[\s\S]*?<\/title>/i, '')
      // Remove standard meta tags
      .replace(/<meta[^>]*name=["']description["'][^>]*\/?>(?=)/gi, '')
      .replace(/<meta[^>]*name=["']keywords["'][^>]*\/?>(?=)/gi, '')
      // Remove Open Graph and Twitter tags
      .replace(/<meta[^>]*property=["']og:[^"']+["'][^>]*\/?>(?=)/gi, '')
      .replace(/<meta[^>]*name=["']twitter:[^"']+["'][^>]*\/?>(?=)/gi, '')
      // Remove canonical links
      .replace(/<link[^>]*rel=["']canonical["'][^>]*\/?>(?=)/gi, '');

    const headInjection = `
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}">
    <meta name="keywords" content="${safeKeywords}">
    <meta property="og:title" content="${safeTitle}">
    <meta property="og:description" content="${safeDescription}">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:type" content="website">
    <meta property="og:image" content="${ogImage}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${safeTitle}">
    <meta name="twitter:description" content="${safeDescription}">
    <meta name="twitter:image" content="${ogImage}">
    <link rel="canonical" href="${pageUrl}">
    ${structuredData ? `<!-- Structured Data -->
    <script type="application/ld+json">
    ${JSON.stringify(structuredData, null, 2)}
    </script>` : ''}
    `;

    const modifiedHtml = cleanedHtml.replace('</head>', `${headInjection}\n</head>`);

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

export const config = { path: ['/vacancies/*', '/companies/*'] };
