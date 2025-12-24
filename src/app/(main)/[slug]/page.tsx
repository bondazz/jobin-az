'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import Head from 'next/head';

interface CustomPage {
  id: string;
  slug: string;
  seo_title: string;
  seo_description: string | null;
  seo_keywords: string[] | null;
  canonical_url: string | null;
  content: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  schema_type: string | null;
  is_active: boolean;
}

export default function CustomPageRoute() {
  const params = useParams();
  const slug = params?.slug as string;
  const [page, setPage] = useState<CustomPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    async function fetchPage() {
      if (!slug) {
        setNotFoundState(true);
        setLoading(false);
        return;
      }

      // Try with the slug as-is first, then with leading slash
      const slugsToTry = [slug, `/${slug}`];
      
      for (const trySlug of slugsToTry) {
        const { data, error } = await supabase
          .from('custom_pages')
          .select('*')
          .eq('slug', trySlug)
          .eq('is_active', true)
          .maybeSingle();

        if (data) {
          setPage(data);
          setLoading(false);
          return;
        }
      }

      // Not found in custom_pages
      setNotFoundState(true);
      setLoading(false);
    }

    fetchPage();
  }, [slug]);

  useEffect(() => {
    if (page) {
      // Update document title
      document.title = page.seo_title;

      // Update meta tags
      const updateMeta = (name: string, content: string | null, isProperty = false) => {
        if (!content) return;
        const attr = isProperty ? 'property' : 'name';
        let meta = document.querySelector(`meta[${attr}="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute(attr, name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      updateMeta('description', page.seo_description);
      updateMeta('keywords', page.seo_keywords?.join(', ') || null);
      updateMeta('og:title', page.og_title || page.seo_title, true);
      updateMeta('og:description', page.og_description || page.seo_description, true);
      updateMeta('og:image', page.og_image, true);
      updateMeta('og:url', page.canonical_url || `https://jooble.az${page.slug.startsWith('/') ? page.slug : '/' + page.slug}`, true);
      updateMeta('og:type', 'website', true);
      updateMeta('twitter:card', 'summary_large_image');
      updateMeta('twitter:title', page.twitter_title || page.seo_title);
      updateMeta('twitter:description', page.twitter_description || page.seo_description);
      updateMeta('twitter:image', page.og_image);

      // Update canonical
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', page.canonical_url || `https://jooble.az${page.slug.startsWith('/') ? page.slug : '/' + page.slug}`);

      // Add JSON-LD schema
      const existingSchema = document.querySelector('script[type="application/ld+json"][data-custom-page]');
      if (existingSchema) {
        existingSchema.remove();
      }

      const schema = {
        '@context': 'https://schema.org',
        '@type': page.schema_type || 'WebPage',
        name: page.seo_title,
        description: page.seo_description,
        url: page.canonical_url || `https://jooble.az${page.slug.startsWith('/') ? page.slug : '/' + page.slug}`,
        image: page.og_image,
        publisher: {
          '@type': 'Organization',
          name: 'Jooble.az',
          logo: {
            '@type': 'ImageObject',
            url: 'https://jooble.az/icons/icon-512x512.jpg'
          }
        }
      };

      const schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.setAttribute('data-custom-page', 'true');
      schemaScript.textContent = JSON.stringify(schema);
      document.head.appendChild(schemaScript);
    }
  }, [page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (notFoundState || !page) {
    // Return the Next.js not found
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="prose prose-lg dark:prose-invert max-w-none">
        <h1 className="text-3xl font-bold mb-6">{page.seo_title}</h1>
        {page.content && (
          <div 
            className="custom-page-content"
            dangerouslySetInnerHTML={{ __html: page.content }} 
          />
        )}
      </article>
    </div>
  );
}
