// Cloudflare Worker for SEO-friendly prerendering
// Deploy this to Cloudflare Workers and set it to run on jooble.az/*

const BOT_USER_AGENTS = [
  'googlebot',
  'bingbot',
  'slurp',
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegrambot',
  'slackbot',
  'pinterest'
];

const PRERENDER_EDGE_FUNCTION = 'https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/prerender-proxy';

function isBot(userAgent) {
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some(bot => ua.includes(bot));
}

async function handleRequest(request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';

  console.log('Request:', { url: url.pathname, userAgent, isBot: isBot(userAgent) });

  // Let non-bot traffic pass through
  if (!isBot(userAgent)) {
    return fetch(request);
  }

  try {
    // Call the prerender edge function
    const prerenderUrl = `${PRERENDER_EDGE_FUNCTION}?url=${encodeURIComponent(url.href)}`;
    
    const response = await fetch(prerenderUrl, {
      headers: {
        'user-agent': userAgent
      }
    });

    // If prerender successful, return it
    if (response.ok) {
      const html = await response.text();
      
      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
          'X-Prerendered': 'true',
          'X-Prerender-Worker': 'cloudflare'
        }
      });
    }

    // Fallback to original request
    console.log('Prerender failed, falling back to origin');
    return fetch(request);

  } catch (error) {
    console.error('Worker error:', error);
    return fetch(request);
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
