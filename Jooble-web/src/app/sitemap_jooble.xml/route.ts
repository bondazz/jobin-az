import { NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data: jobs } = await supabase
            .from('jobs')
            .select(`
        id,
        title,
        slug,
        location,
        type,
        salary,
        created_at,
        updated_at,
        companies!inner(name, logo, website),
        categories!inner(name)
      `)
            .eq('is_active', true)
            .order('updated_at', { ascending: false })
            .limit(1000);

        const baseUrl = 'https://jooble.az';

        // Jooble-specific XML format
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:jooble="http://www.jooble.org">
  <channel>
    <title>Jooble.az - İş Elanları</title>
    <link>${baseUrl}</link>
    <description>Azərbaycanda ən yeni iş elanları və vakansiyalar</description>`;

        jobs?.forEach((job) => {
            const company = job.companies as any;
            const category = job.categories as any;

            xml += `
    <item>
      <title><![CDATA[${job.title}]]></title>
      <link>${baseUrl}/vacancies/${job.slug}</link>
      <description><![CDATA[${job.title} - ${company?.name}]]></description>
      <jooble:company><![CDATA[${company?.name || ''}]]></jooble:company>
      <jooble:location><![CDATA[${job.location}]]></jooble:location>
      <jooble:category><![CDATA[${category?.name || ''}]]></jooble:category>
      <jooble:type><![CDATA[${job.type}]]></jooble:type>
      ${job.salary ? `<jooble:salary><![CDATA[${job.salary}]]></jooble:salary>` : ''}
      <pubDate>${new Date(job.created_at).toUTCString()}</pubDate>
      <guid>${baseUrl}/vacancies/${job.slug}</guid>
    </item>`;
        });

        xml += `
  </channel>
</rss>`;

        return new NextResponse(xml, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        console.error('Jooble sitemap generation error:', error);
        return new NextResponse('Error generating sitemap', { status: 500 });
    }
}
