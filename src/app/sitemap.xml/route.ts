import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Advanced Sitemap Interceptor (Worker-style)
 * Proxies the external Jooble sitemap and dynamically rewrites 
 * all domains to jobin.az at runtime for perfect SEO alignment.
 */
export async function GET() {
  try {
    const response = await fetch('https://storage.jooble.az/sitemap.xml', {
      cache: 'no-store', // Always get fresh for the worker, but we'll cache the response
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch master sitemap: ${response.status}`);
    }

    let xml = await response.text();

    // The Master Rewrite: Transform every Jooble entity to Jobin
    // This makes Google think these links are native to our domain
    xml = xml.replace(/jooble\.az/g, 'jobin.az')
      .replace(/Jooble\.az/g, 'Jobin.az')
      .replace(/jooble/g, 'jobin');

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
        'X-Robots-Tag': 'noindex' // Sitemap itself shouldn't be indexed, just used by bots
      },
    });
  } catch (error) {
    console.error('Sitemap Interceptor Error:', error);
    // Fallback to a minimal sitemap if the proxy fails
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://jobin.az/</loc><priority>1.0</priority></url>
</urlset>`;
    return new NextResponse(fallbackXml, {
      headers: { 'Content-Type': 'application/xml' }
    });
  }
}
