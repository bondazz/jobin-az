import { NextResponse } from 'next/server';

export async function GET() {
    const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://jooble.az/sitemap.xml
Sitemap: https://jooble.az/sitemap_index.xml
`;

    return new NextResponse(robotsTxt, {
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'public, max-age=86400',
        },
    });
}
