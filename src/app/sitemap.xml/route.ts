import { NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetch all active jobs
        const { data: jobs } = await supabase
            .from('jobs')
            .select('slug, updated_at')
            .eq('is_active', true)
            .order('updated_at', { ascending: false });

        // Fetch all active companies
        const { data: companies } = await supabase
            .from('companies')
            .select('slug, updated_at')
            .eq('is_active', true);

        // Fetch all active categories
        const { data: categories } = await supabase
            .from('categories')
            .select('slug, updated_at')
            .eq('is_active', true);

        // Fetch all published blogs
        const { data: blogs } = await supabase
            .from('blogs')
            .select('slug, updated_at, published_at')
            .eq('is_active', true)
            .eq('is_published', true)
            .order('published_at', { ascending: false });

        const baseUrl = 'https://jooble.az';
        const now = new Date().toISOString();

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/vacancies</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/companies</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/categories</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;

        // Add job pages
        jobs?.forEach((job) => {
            xml += `
  <url>
    <loc>${baseUrl}/vacancies/${job.slug}</loc>
    <lastmod>${job.updated_at || now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
        });

        // Add company pages
        companies?.forEach((company) => {
            xml += `
  <url>
    <loc>${baseUrl}/companies/${company.slug}</loc>
    <lastmod>${company.updated_at || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
        });

        // Add category pages
        categories?.forEach((category) => {
            xml += `
  <url>
    <loc>${baseUrl}/categories/${category.slug}</loc>
    <lastmod>${category.updated_at || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
        });

        // Add blog pages
        blogs?.forEach((blog) => {
            xml += `
  <url>
    <loc>${baseUrl}/blog/${blog.slug}</loc>
    <lastmod>${blog.updated_at || blog.published_at || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
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
        console.error('Sitemap generation error:', error);
        return new NextResponse('Error generating sitemap', { status: 500 });
    }
}
