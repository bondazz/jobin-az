import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Ultimate Sitemap Interceptor & Transpiler
 * Fetches the master sitemap from Jooble Storage and performs 
 * a deep domain-level transpilation to jobin.az at wire speed.
 */
export async function GET() {
  try {
    // Fetch the raw XML from the source storage
    const response = await fetch('https://storage.jooble.az/sitemap.xml', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'application/xml, text/xml, */*'
      },
      next: { revalidate: 3600 } // Cache at the fetch level
    });

    if (!response.ok) {
      throw new Error(`Master Sitemap unreachable: ${response.status}`);
    }

    const rawXml = await response.text();

    // Deep Transpilation Logic:
    // 1. Convert all variations of jooble.az (with or without www) to jobin.az
    // 2. Ensure all branding inside tags is also updated
    // 3. Handle case-insensitivity for robustness
    let transpiledXml = rawXml
      .replace(/https?:\/\/(www\.)?jooble\.az/gi, 'https://jobin.az')
      .replace(/jooble\.az/gi, 'jobin.az')
      .replace(/jooble/gi, 'jobin');

    // Return the exact transpiled structure with high-performance headers
    return new NextResponse(transpiledXml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
        'X-Content-Type-Options': 'nosniff',
        'X-Robots-Tag': 'noindex'
      },
    });
  } catch (error) {
    console.error('Sitemap Transpiler Error:', error);

    // Safety Fallback (Internal generated sitemap if proxy fails)
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://jobin.az/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
</urlset>`;

    return new NextResponse(fallback, {
      headers: { 'Content-Type': 'application/xml' }
    });
  }
}
