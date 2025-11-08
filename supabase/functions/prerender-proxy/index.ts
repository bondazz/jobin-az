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
  return BOT_USER_AGENTS.some(bot => ua.includes(bot));
}

async function fetchPageData(supabase: any, pathname: string) {
  const pathParts = pathname.split('/').filter(Boolean);
  
  if (pathParts.length === 0) {
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
      type: 'website'
    };
  }
  
  const [section, slug] = pathParts;
  
  if (section === 'companies' && slug) {
    const { data: company } = await supabase
      .from('companies')
      .select('*, jobs(count)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    
    if (company) {
      return {
        title: company.seo_title || `${company.name} | Şirkət Profili - Jooble`,
        description: company.seo_description || `${company.name} şirkəti haqqında məlumat və vakansiyalar`,
        keywords: company.seo_keywords?.join(', ') || `${company.name}, vakansiya`,
        type: 'organization',
        data: company
      };
    }
  }
  
  if (section === 'categories' && slug) {
    const { data: category } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    
    if (category) {
      return {
        title: category.seo_title || `${category.name} Vakansiyaları - Jooble`,
        description: category.seo_description || `${category.name} sahəsində aktiv vakansiyalar`,
        keywords: category.seo_keywords?.join(', ') || `${category.name}, vakansiya`,
        type: 'category',
        data: category
      };
    }
  }
  
  if (section === 'vacancies' && slug) {
    const { data: job } = await supabase
      .from('jobs')
      .select('*, company:companies(*), category:categories(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    
    if (job) {
      return {
        title: job.seo_title || `${job.title} | ${job.company?.name || 'İş Elanı'}`,
        description: job.seo_description || `${job.company?.name}də ${job.title} vakansiyası`,
        keywords: job.seo_keywords?.join(', ') || `${job.title}, vakansiya`,
        type: 'job',
        data: job
      };
    }
  }
  
  return null;
}

function generateStructuredData(pageData: any, url: string) {
  const { type, data } = pageData;
  
  if (type === 'website') {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": pageData.title,
      "description": pageData.description,
      "url": url
    };
  }
  
  if (type === 'organization' && data) {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": data.name,
      "description": data.description,
      "url": url,
      "logo": data.logo_url
    };
  }
  
  if (type === 'job' && data) {
    return {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": data.title,
      "description": data.description,
      "datePosted": data.created_at,
      "validThrough": data.expire_at,
      "employmentType": data.employment_type,
      "hiringOrganization": {
        "@type": "Organization",
        "name": data.company?.name,
        "logo": data.company?.logo_url
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": data.location,
          "addressCountry": "AZ"
        }
      }
    };
  }
  
  return null;
}

function generateHTML(pageData: any, url: string) {
  const structuredData = generateStructuredData(pageData, url);
  
  return `<!DOCTYPE html>
<html lang="az">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageData.title}</title>
  <meta name="description" content="${pageData.description}">
  <meta name="keywords" content="${pageData.keywords}">
  <link rel="canonical" href="${url}">
  
  <!-- Open Graph -->
  <meta property="og:type" content="${pageData.type === 'job' ? 'article' : pageData.type === 'organization' ? 'profile' : 'website'}">
  <meta property="og:title" content="${pageData.title}">
  <meta property="og:description" content="${pageData.description}">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="Jooble Azərbaycan">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${pageData.title}">
  <meta name="twitter:description" content="${pageData.description}">
  
  ${structuredData ? `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>` : ''}
</head>
<body>
  <h1>${pageData.title}</h1>
  <div>${pageData.description}</div>
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
    
    if (!targetUrl) {
      return new Response('Missing url parameter', { status: 400 });
    }

    console.log('Prerender request:', { userAgent, targetUrl, isBot: isBot(userAgent) });

    if (!isBot(userAgent)) {
      return new Response('Not a bot', { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    }

    // First try Prerender.io service
    const targetUrlObj = new URL(targetUrl);
    const scheme = targetUrlObj.protocol.replace(':', '');
    const host = targetUrlObj.host;
    const requestUri = targetUrlObj.pathname + targetUrlObj.search;
    const prerenderUrl = `https://service.prerender.io/${scheme}://${host}${requestUri}`;
    
    console.log('Trying Prerender.io:', prerenderUrl);

    try {
      const prerenderResponse = await fetch(prerenderUrl, {
        headers: {
          'X-Prerender-Token': PRERENDER_TOKEN,
          'User-Agent': userAgent,
        },
      });

      if (prerenderResponse.ok) {
        const html = await prerenderResponse.text();
        console.log('Prerender.io success');
        
        return new Response(html, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
            'X-Prerendered': 'true',
            'X-Prerender-Source': 'prerender.io'
          }
        });
      }
    } catch (prerenderError) {
      console.error('Prerender.io failed:', prerenderError);
    }

    // Fallback: Generate HTML from Supabase data
    console.log('Falling back to Supabase data');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const pathname = targetUrlObj.pathname;
    const pageData = await fetchPageData(supabase, pathname);
    
    if (!pageData) {
      return new Response('Page not found', { status: 404 });
    }

    const html = generateHTML(pageData, targetUrl);

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'X-Prerendered': 'true',
        'X-Prerender-Source': 'supabase'
      }
    });

  } catch (error) {
    console.error('Prerender error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
