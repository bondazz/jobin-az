import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BOT_USER_AGENTS = [
  'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 'yandexbot',
  'facebookexternalhit', 'twitterbot', 'rogerbot', 'linkedinbot', 'embedly',
  'quora link preview', 'showyoubot', 'outbrain', 'pinterest', 'developers.google.com/+/web/snippet',
  'slackbot', 'vkshare', 'w3c_validator', 'whatsapp', 'telegrambot', 'validator.schema.org'
];

const PRERENDER_TOKEN = 'WdZtNbkh09B6xRFySBJ2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, user-agent',
};

function isBot(userAgent: string): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some(bot => ua.includes(bot));
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const userAgent = req.headers.get('user-agent') || '';
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get('url');

    console.log('Request received:', {
      userAgent,
      targetUrl,
      isBot: isBot(userAgent)
    });

    // If not a bot or no target URL, return a simple response
    if (!targetUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing url parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // If not a bot, return indication to proceed with normal rendering
    if (!isBot(userAgent)) {
      return new Response(
        JSON.stringify({ bot: false, message: 'Not a bot user-agent' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Bot detected - proxy to Prerender.io
    // Parse the target URL to get scheme, host, and path
    const targetUrlObj = new URL(targetUrl);
    const scheme = targetUrlObj.protocol.replace(':', '');
    const host = targetUrlObj.host;
    const requestUri = targetUrlObj.pathname + targetUrlObj.search;
    
    // Construct prerender URL in exact format: https://service.prerender.io/$scheme://$host$request_uri
    const prerenderUrl = `https://service.prerender.io/${scheme}://${host}${requestUri}`;
    console.log('Proxying to Prerender.io:', prerenderUrl);

    const prerenderResponse = await fetch(prerenderUrl, {
      headers: {
        'X-Prerender-Token': PRERENDER_TOKEN,
        'User-Agent': userAgent,
      },
    });

    const prerenderHtml = await prerenderResponse.text();
    
    console.log('Prerender response:', {
      status: prerenderResponse.status,
      contentLength: prerenderHtml.length
    });

    // Return the pre-rendered HTML with proper headers
    const baseHeaders = {
      ...corsHeaders,
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Prerendered': 'true',
    };

    // For HEAD requests, return headers only (no body) to support curl -I and CDN probes
    if (req.method === 'HEAD') {
      return new Response(null, {
        status: prerenderResponse.status,
        headers: baseHeaders,
      });
    }

    return new Response(prerenderHtml, {
      status: prerenderResponse.status,
      headers: baseHeaders,
    });

  } catch (error) {
    console.error('Prerender proxy error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
