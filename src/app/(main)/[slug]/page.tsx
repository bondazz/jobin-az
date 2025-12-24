'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import Link from 'next/link';
import MobileHeader from '@/components/MobileHeader';

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
  const slug = decodeURIComponent(params?.slug as string || '');
  const [page, setPage] = useState<CustomPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchPage() {
      if (!slug) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        // Try with the slug as-is first, then with leading slash
        const slugsToTry = [slug, `/${slug}`];
        
        for (const trySlug of slugsToTry) {
          const { data, error: fetchError } = await supabase
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
        setError(true);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching custom page:', err);
        setError(true);
        setLoading(false);
      }
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

      // Process content to ensure all links are dofollow (remove rel="nofollow" if present)
      // and add proper target attributes
      const processLinks = () => {
        const container = document.querySelector('.custom-page-content');
        if (container) {
          const links = container.querySelectorAll('a');
          links.forEach(link => {
            // Remove nofollow to ensure dofollow
            const rel = link.getAttribute('rel');
            if (rel) {
              const newRel = rel.replace(/nofollow/gi, '').trim();
              if (newRel) {
                link.setAttribute('rel', newRel);
              } else {
                link.removeAttribute('rel');
              }
            }
            // Add target blank for external links
            const href = link.getAttribute('href');
            if (href && (href.startsWith('http://') || href.startsWith('https://')) && !href.includes('jooble.az')) {
              link.setAttribute('target', '_blank');
              link.setAttribute('rel', 'noopener');
            }
          });
        }
      };

      // Run after content is rendered
      setTimeout(processLinks, 100);
    }
  }, [page]);

  if (loading) {
    return (
      <>
        {/* Mobile Header */}
        <MobileHeader />
        
        <div className="h-full flex bg-gradient-to-br from-background via-primary/3 to-background overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 flex min-w-0 pb-16 xl:pb-0 pt-14 xl:pt-0">
            {/* Content Area - Same width as JobListings */}
            <div className="w-full lg:w-[500px] xl:w-[580px] 2xl:w-[650px] border-r border-border flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>

            {/* Right Side - Desktop Only */}
            <div className="hidden lg:block flex-1 bg-gradient-to-br from-job-details to-primary/3"></div>
          </div>
        </div>
      </>
    );
  }

  if (error || !page) {
    return (
      <>
        {/* Mobile Header */}
        <MobileHeader />
        
        <div className="h-full flex bg-gradient-to-br from-background via-primary/3 to-background overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 flex min-w-0 pb-16 xl:pb-0 pt-14 xl:pt-0">
            {/* Content Area */}
            <div className="w-full lg:w-[500px] xl:w-[580px] 2xl:w-[650px] border-r border-border flex items-center justify-center">
              <div className="text-center p-6">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-xl text-muted-foreground mb-4">Səhifə tapılmadı</p>
                <Link href="/" className="text-primary hover:underline">
                  Ana səhifəyə qayıt
                </Link>
              </div>
            </div>

            {/* Right Side - Desktop Only */}
            <div className="hidden lg:block flex-1 bg-gradient-to-br from-job-details to-primary/3"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Mobile Header */}
      <MobileHeader />
      
      <div className="h-full flex bg-gradient-to-br from-background via-primary/3 to-background overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex min-w-0 pb-16 xl:pb-0 pt-14 xl:pt-0">
          {/* Content Area - Same width as JobListings */}
          <div className="w-full lg:w-[500px] xl:w-[580px] 2xl:w-[650px] border-r border-border overflow-y-auto">
            <article className="p-4 lg:p-6">
              <h1 className="text-2xl lg:text-3xl font-bold mb-6 text-foreground">{page.seo_title}</h1>
              {page.content && (
                <div 
                  className="custom-page-content prose prose-sm lg:prose-base dark:prose-invert max-w-none
                    prose-headings:text-foreground 
                    prose-p:text-foreground/90 
                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-foreground
                    prose-ul:text-foreground/90
                    prose-ol:text-foreground/90
                    prose-li:text-foreground/90
                    prose-blockquote:text-foreground/80 prose-blockquote:border-primary
                    prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:rounded
                    prose-pre:bg-muted prose-pre:text-foreground
                    prose-img:rounded-lg prose-img:shadow-md
                    prose-table:text-foreground/90
                    prose-th:text-foreground prose-th:bg-muted
                    prose-td:text-foreground/90"
                  dangerouslySetInnerHTML={{ __html: page.content }} 
                />
              )}
            </article>
          </div>

          {/* Right Side - Desktop Only */}
          <div className="hidden lg:block flex-1 bg-gradient-to-br from-job-details to-primary/3">
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center p-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-lg font-medium">SEO Səhifəsi</p>
                <p className="text-sm text-muted-foreground mt-2">Bu səhifə məlumat məqsədlidir</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
