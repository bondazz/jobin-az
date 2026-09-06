import { NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data: jobs } = await supabase
            .from('jobs')
            .select('slug, updated_at')
            .eq('is_active', true)
            .order('updated_at', { ascending: false });

        const baseUrl = 'https://jooble.az';

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        jobs?.forEach((job) => {
            xml += `
  <url>
    <loc>${baseUrl}/vacancies/${job.slug}</loc>
    <lastmod>${job.updated_at || new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
        });

        xml += '\n</urlset>';

        return new NextResponse(xml, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        console.error('Sitemap main generation error:', error);
        return new NextResponse('Error generating sitemap', { status: 500 });
    }
}
