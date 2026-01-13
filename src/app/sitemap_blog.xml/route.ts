import { NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

export const dynamic = 'force-dynamic';

// Format date to ISO 8601 with timezone offset (e.g., 2026-01-06T18:30:00+04:00)
function formatDateWithTimezone(dateString: string): string {
    const date = new Date(dateString);
    const offset = '+04:00'; // Azerbaijan timezone
    const isoString = date.toISOString().replace('Z', '');
    return isoString.substring(0, 19) + offset;
}

// Escape XML special characters
function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export async function GET() {
    try {
        // Fetch all published blogs with keywords
        const { data: blogs } = await supabase
            .from('blogs')
            .select('slug, updated_at, published_at, featured_image, title, seo_keywords')
            .eq('is_active', true)
            .eq('is_published', true)
            .order('published_at', { ascending: false });

        const baseUrl = 'https://Jobin.az';
        const siteName = 'Jobin.az';
        const now = new Date().toISOString();

        // XML with image and news sitemap namespaces (order matching the reference)
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
<url>
  <loc>${baseUrl}/blog</loc>
  <lastmod>${formatDateWithTimezone(now)}</lastmod>
  <changefreq>daily</changefreq>
  <priority>0.8</priority>
</url>`;

        blogs?.forEach((blog) => {
            const publishDate = blog.published_at || blog.updated_at || new Date().toISOString();
            const formattedDate = formatDateWithTimezone(publishDate);
            
            // Format keywords - join array or use empty string
            const keywords = blog.seo_keywords?.length 
                ? blog.seo_keywords.join(',') 
                : '';

            xml += `
<url>
  <loc>${baseUrl}/blog/${blog.slug}</loc>`;
            
            // Add image if available (image comes before news in the reference)
            if (blog.featured_image) {
                const imageUrl = blog.featured_image.startsWith('http') 
                    ? blog.featured_image 
                    : baseUrl + blog.featured_image;
                xml += `
  <image:image>
    <image:loc>${escapeXml(imageUrl)}</image:loc>
  </image:image>`;
            }
            
            // Add news tag for all articles (not just recent ones)
            xml += `
  <news:news>
    <news:publication>
      <news:name>${siteName}</news:name>
      <news:language>az</news:language>
    </news:publication>
    <news:publication_date>${formattedDate}</news:publication_date>
    <news:title>${escapeXml(blog.title)}</news:title>`;
            
            // Add keywords if available
            if (keywords) {
                xml += `
    <news:keywords>${escapeXml(keywords)}</news:keywords>`;
            }
            
            xml += `
  </news:news>
</url>`;
        });

        xml += '\n</urlset>';

        return new NextResponse(xml, {
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=1800', // 30 minutes cache
            },
        });
    } catch (error) {
        console.error('Blog sitemap generation error:', error);
        return new NextResponse('Error generating blog sitemap', { status: 500 });
    }
}
