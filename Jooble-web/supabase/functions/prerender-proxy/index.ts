import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const BOT_USER_AGENTS = [
  'googlebot',
  'bingbot',
  'slurp',
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'facebookexternalhit',
  'twitterbot',
  'rogerbot',
  'linkedinbot',
  'embedly',
  'quora link preview',
  'showyoubot',
  'outbrain',
  'pinterest',
  'slackbot',
  'vkShare',
  'W3C_Validator',
  'whatsapp',
  'telegrambot',
  'validator.schema.org'
];

const PRERENDER_TOKEN = 'WdZtNbkh09B6xRFySBJ2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  const isKnownBot = BOT_USER_AGENTS.some(bot => ua.includes(bot));
  console.log(`🤖 Bot Check: ${ua.substring(0, 60)}... => ${isKnownBot}`);
  return isKnownBot;
}

async function fetchPageData(supabase: any, pathname: string) {
  console.log(`📄 Fetching data for: ${pathname}`);
  const pathParts = pathname.split('/').filter(Boolean);
  
  if (pathParts.length === 0) {
    console.log('🏠 Home page detected');
    const { data: settings } = await supabase
      .from('site_settings')
      .select('key, value');
    
    const settingsObj: Record<string, string> = {};
    settings?.forEach((s: any) => {
      settingsObj[s.key] = s.value;
    });
    
    return {
      title: settingsObj.site_title || 'Jooble Azərbaycan',
      description: settingsObj.site_description || 'İş elanları və vakansiyalar',
      keywords: settingsObj.site_keywords || 'iş elanları, vakansiya',
      type: 'website',
      url: 'https://jooble.az/'
    };
  }
  
  const [section, slug] = pathParts;
  
  if (section === 'companies' && slug) {
    console.log(`🏢 Company page: ${slug}`);
    const { data: company } = await supabase
      .from('companies')
      .select('*, jobs(count)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    
    if (company) {
      console.log(`✅ Company found: ${company.name}`);
      return {
        title: company.seo_title || `${company.name} | Şirkət Profili - Jooble`,
        description: company.seo_description || `${company.name} şirkəti haqqında məlumat və vakansiyalar`,
        keywords: company.seo_keywords?.join(', ') || `${company.name}, vakansiya`,
        type: 'organization',
        data: company,
        url: `https://jooble.az/companies/${slug}`
      };
    }
    console.log('❌ Company not found');
  }
  
  if (section === 'categories' && slug) {
    console.log(`📂 Category page: ${slug}`);
    const { data: category } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    
    if (category) {
      console.log(`✅ Category found: ${category.name}`);
      return {
        title: category.seo_title || `${category.name} Vakansiyaları - Jooble`,
        description: category.seo_description || `${category.name} sahəsində aktiv vakansiyalar`,
        keywords: category.seo_keywords?.join(', ') || `${category.name}, vakansiya`,
        type: 'category',
        data: category,
        url: `https://jooble.az/categories/${slug}`
      };
    }
    console.log('❌ Category not found');
  }
  
  if (section === 'vacancies' && slug) {
    console.log(`💼 Job page: ${slug}`);
    const { data: job } = await supabase
      .from('jobs')
      .select('*, company:companies(*), category:categories(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    
    if (job) {
      console.log(`✅ Job found: ${job.title}`);
      return {
        title: job.seo_title || `${job.title} | ${job.company?.name || 'İş Elanı'}`,
        description: job.seo_description || `${job.company?.name}də ${job.title} vakansiyası`,
        keywords: job.seo_keywords?.join(', ') || `${job.title}, vakansiya`,
        type: 'job',
        data: job,
        url: `https://jooble.az/vacancies/${slug}`
      };
    }
    console.log('❌ Job not found');
  }
  
  console.log('❌ No page data found');
  return null;
}

function generateStructuredData(pageData: any, url: string) {
  const { type, data } = pageData;
  const baseUrl = 'https://jooble.az';
  
  if (type === 'website') {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": pageData.title,
      "description": pageData.description,
      "url": url,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${baseUrl}/?search={search_term_string}`,
        "query-input": "required name=search_term_string"
      },
      "inLanguage": "az",
      "publisher": {
        "@type": "Organization",
        "name": "Jooble Azərbaycan",
        "url": baseUrl
      }
    };
  }
  
  if (type === 'organization' && data) {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": data.name,
      "description": data.description || pageData.description,
      "url": pageData.url || url,
      "logo": data.logo,
      "address": data.address ? {
        "@type": "PostalAddress",
        "streetAddress": data.address,
        "addressCountry": "AZ"
      } : undefined,
      "email": data.email,
      "telephone": data.phone,
      "sameAs": data.website ? [data.website] : []
    };
  }
  
  if (type === 'category' && data) {
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": `${data.name} Vakansiyaları`,
      "description": pageData.description,
      "url": pageData.url || url,
      "inLanguage": "az",
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Ana Səhifə",
            "item": baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": data.name,
            "item": pageData.url || url
          }
        ]
      }
    };
  }
  
  if (type === 'job' && data) {
    return {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": data.title,
      "description": data.description,
      "identifier": {
        "@type": "PropertyValue",
        "name": "Job ID",
        "value": data.id
      },
      "datePosted": data.created_at,
      "validThrough": data.expiration_date,
      "employmentType": data.type?.toUpperCase() || "FULL_TIME",
      "hiringOrganization": {
        "@type": "Organization",
        "name": data.company?.name || "Jooble",
        "logo": data.company?.logo || "",
        "url": data.company?.website || baseUrl
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": data.location,
          "addressCountry": "AZ"
        }
      },
      "baseSalary": data.salary ? {
        "@type": "MonetaryAmount",
        "currency": "AZN",
        "value": {
          "@type": "QuantitativeValue",
          "value": data.salary
        }
      } : undefined,
      "url": pageData.url || url,
      "industry": data.category?.name
    };
  }
  
  return null;
}

function generateHTML(pageData: any, url: string) {
  const structuredData = generateStructuredData(pageData, url);
  
  // Escape HTML to prevent XSS
  const escapeHtml = (text: string) => text
    ?.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;') || '';

  const safeTitle = escapeHtml(pageData.title);
  const safeDescription = escapeHtml(pageData.description);
  const safeKeywords = escapeHtml(pageData.keywords || '');
  
  return `<!DOCTYPE html>
<html lang="az">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}">
  <meta name="keywords" content="${safeKeywords}">
  <link rel="canonical" href="${url}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="language" content="Azerbaijani">
  <meta name="geo.region" content="AZ">
  
  <!-- Open Graph -->
  <meta property="og:type" content="${pageData.type === 'job' ? 'article' : pageData.type === 'organization' ? 'profile' : 'website'}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDescription}">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="Jooble Azərbaycan">
  <meta property="og:locale" content="az_AZ">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDescription}">
  
  ${structuredData ? `<script type="application/ld+json">${JSON.stringify(structuredData, null, 2)}</script>` : ''}
  
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      line-height: 1.6; 
      max-width: 1200px; 
      margin: 0 auto; 
      padding: 20px;
      color: #333;
    }
    h1 { 
      color: #1a1a1a; 
      margin-bottom: 1rem;
      font-size: 2rem;
    }
    p { margin-bottom: 1rem; }
    .content { margin-top: 2rem; }
  </style>
</head>
<body>
  <header>
    <h1>${safeTitle}</h1>
  </header>
  <main class="content">
    <p>${safeDescription}</p>
    ${pageData.type === 'job' && pageData.data?.location ? `<p><strong>Yer:</strong> ${escapeHtml(pageData.data.location)}</p>` : ''}
    ${pageData.type === 'job' && pageData.data?.salary ? `<p><strong>Maaş:</strong> ${escapeHtml(pageData.data.salary)}</p>` : ''}
    ${pageData.type === 'job' && pageData.data?.type ? `<p><strong>İş növü:</strong> ${escapeHtml(pageData.data.type)}</p>` : ''}
    ${pageData.type === 'organization' && pageData.data?.website ? `<p><strong>Vebsayt:</strong> <a href="${escapeHtml(pageData.data.website)}">${escapeHtml(pageData.data.website)}</a></p>` : ''}
  </main>
  <footer style="margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #eee;">
    <p><small>© 2025 Jooble Azərbaycan. Bütün hüquqlar qorunur.</small></p>
  </footer>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const userAgent = req.headers.get('user-agent') || '';
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get('url');
    
    console.log('===========================================');
    console.log(`🔍 Request: ${targetUrl}`);
    console.log(`👤 UA: ${userAgent.substring(0, 80)}...`);
    
    if (!targetUrl) {
      console.log('❌ Missing URL parameter');
      return new Response('Missing url parameter', { status: 400 });
    }

    if (!isBot(userAgent)) {
      console.log('❌ Not a bot - skipping prerender');
      console.log('===========================================');
      return new Response('Not a bot', { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    }

    console.log('✅ Bot detected - generating prerender');

    // First try Prerender.io service
    const targetUrlObj = new URL(targetUrl);
    const scheme = targetUrlObj.protocol.replace(':', '');
    const host = targetUrlObj.host;
    const requestUri = targetUrlObj.pathname + targetUrlObj.search;
    const prerenderUrl = `https://service.prerender.io/${scheme}://${host}${requestUri}`;
    
    console.log(`🚀 Trying Prerender.io: ${prerenderUrl}`);

    try {
      const prerenderResponse = await fetch(prerenderUrl, {
        headers: {
          'X-Prerender-Token': PRERENDER_TOKEN,
          'User-Agent': userAgent,
        },
        signal: AbortSignal.timeout(5000)
      });

      if (prerenderResponse.ok) {
        const html = await prerenderResponse.text();
        console.log(`✅ Prerender.io success (${html.length} chars)`);
        console.log('===========================================');
        
        return new Response(html, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=7200',
            'X-Prerendered': 'true',
            'X-Prerender-Source': 'prerender.io',
            'Vary': 'User-Agent'
          }
        });
      } else {
        console.log(`⚠️ Prerender.io returned ${prerenderResponse.status}`);
      }
    } catch (prerenderError) {
      console.error(`❌ Prerender.io error: ${prerenderError.message}`);
    }

    // Fallback: Generate HTML from Supabase data
    console.log('🔄 Falling back to Supabase dynamic generation');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const pathname = targetUrlObj.pathname;
    const pageData = await fetchPageData(supabase, pathname);
    
    if (!pageData) {
      console.log('❌ Page not found in database');
      console.log('===========================================');
      return new Response('Page not found', { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    }

    const html = generateHTML(pageData, targetUrl);
    console.log(`✅ Generated HTML (${html.length} chars)`);
    console.log(`📝 Title: ${pageData.title}`);
    console.log(`📄 Type: ${pageData.type}`);
    console.log('===========================================');

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=7200',
        'X-Prerendered': 'true',
        'X-Prerender-Source': 'supabase-dynamic',
        'X-Page-Type': pageData.type,
        'Vary': 'User-Agent'
      }
    });

  } catch (error) {
    console.error(`💥 Fatal error: ${error.message}`);
    console.log('===========================================');
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
