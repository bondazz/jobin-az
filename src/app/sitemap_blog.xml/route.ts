import { NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetch all published blogs
        const { data: blogs } = await supabase
            .from('blogs')
            .select('slug, updated_at, published_at, featured_image, title')
            .eq('is_active', true)
            .eq('is_published', true)
            .order('published_at', { ascending: false });

        const baseUrl = 'https://jooble.az';
        const now = new Date().toISOString();

        // XML with news sitemap namespace for better SEO
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;

        blogs?.forEach((blog) => {
            const lastmod = blog.updated_at || blog.published_at || now;
            
            xml += `
  <url>
    <loc>${baseUrl}/blog/${blog.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>`;
            
            // Add news tag for recent articles (within last 2 days)
            const publishedDate = new Date(blog.published_at || now);
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            
            if (publishedDate >= twoDaysAgo) {
                xml += `
    <news:news>
      <news:publication>
        <news:name>Kontakt Home</news:name>
        <news:language>az</news:language>
      </news:publication>
      <news:publication_date>${blog.published_at || now}</news:publication_date>
      <news:title><![CDATA[${blog.title}]]></news:title>
    </news:news>`;
            }
            
            // Add image if available
            if (blog.featured_image) {
                xml += `
    <image:image>
      <image:loc>${blog.featured_image.startsWith('http') ? blog.featured_image : baseUrl + blog.featured_image}</image:loc>
      <image:title><![CDATA[${blog.title}]]></image:title>
    </image:image>`;
            }
            
            xml += `
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
        console.error('Blog sitemap generation error:', error);
        return new NextResponse('Error generating blog sitemap', { status: 500 });
    }
}
