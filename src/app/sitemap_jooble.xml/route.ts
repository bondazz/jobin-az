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

        const baseUrl = 'https://Jobin.az';

        // Jobin-specific XML format
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:Jobin="http://www.Jobin.org">
  <channel>
    <title>Jobin.az - İş Elanları</title>
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
      <Jobin:company><![CDATA[${company?.name || ''}]]></Jobin:company>
      <Jobin:location><![CDATA[${job.location}]]></Jobin:location>
      <Jobin:category><![CDATA[${category?.name || ''}]]></Jobin:category>
      <Jobin:type><![CDATA[${job.type}]]></Jobin:type>
      ${job.salary ? `<Jobin:salary><![CDATA[${job.salary}]]></Jobin:salary>` : ''}
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
        console.error('Jobin sitemap generation error:', error);
        return new NextResponse('Error generating sitemap', { status: 500 });
    }
}
