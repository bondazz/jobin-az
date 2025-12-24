'use client';

import { useEffect } from 'react';
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

interface CustomPageContentProps {
  page: CustomPage | null;
}

export default function CustomPageContent({ page }: CustomPageContentProps) {
  // Process links to ensure dofollow
  useEffect(() => {
    if (page?.content) {
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

  if (!page) {
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

  // Extract plain text from HTML for sidebar display
  const extractTextFromHtml = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  // Extract headings from content for sidebar
  const extractHeadings = (html: string): string[] => {
    if (typeof window === 'undefined') return [];
    const div = document.createElement('div');
    div.innerHTML = html;
    const headings = div.querySelectorAll('h2, h3');
    return Array.from(headings).map(h => h.textContent || '').filter(Boolean).slice(0, 8);
  };

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

          {/* Right Side - Desktop Only - SEO Content like in the screenshot */}
          <div className="hidden lg:block flex-1 bg-gradient-to-br from-job-details to-primary/3 overflow-y-auto">
            <div className="p-6 lg:p-8">
              {/* Main Title */}
              <h1 className="text-2xl xl:text-3xl font-bold text-primary mb-4">
                {page.seo_title}
              </h1>
              
              {/* Description */}
              {page.seo_description && (
                <p className="text-foreground/80 text-sm leading-relaxed mb-6">
                  {page.seo_description}
                </p>
              )}

              {/* Quick Links Section */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6">
                <Link href="/vacancies" className="text-primary hover:underline text-sm font-medium">
                  Ən Son İş Elanları 2026
                </Link>
                <Link href="/categories" className="text-primary hover:underline text-sm font-medium">
                  Tələbə və təcrübəçi iş elanları
                </Link>
                <Link href="/companies" className="text-primary hover:underline text-sm font-medium">
                  Bu həftənin ən çox baxılan vakansiyaları
                </Link>
                <Link href="/vacancies?salary=high" className="text-primary hover:underline text-sm font-medium">
                  Ən çox maaş təklif edən vakansiyalar
                </Link>
                <Link href="/regions" className="text-primary hover:underline text-sm font-medium">
                  Şəhərlər üzrə iş elanları
                </Link>
                <Link href="/vacancies?type=remote" className="text-primary hover:underline text-sm font-medium">
                  Evdən işləmək (remote) iş imkanları
                </Link>
                <Link href="/categories" className="text-primary hover:underline text-sm font-medium">
                  Sahələr üzrə vakansiyalar
                </Link>
              </div>

              {/* Additional Info */}
              <div className="border-t border-border/50 pt-6">
                <p className="text-foreground/70 text-xs leading-relaxed">
                  2026-cı il üçün hazırlanan iş elanları və vakansiyalar siyahımız real vaxtda yenilənir. Hər bir elan şirkət tərəfindən təsdiqlənir və istifadəçilərə dəqiq maaş aralığı, tələblər, vəzifə təsviri və müraciət linki təqdim olunur. İstər ofisdaxili, istər remote iş axtarırsınız? Burada bütün vakansiyaları rahatlıqla tapa biləcəksiniz.
                </p>
              </div>

              {/* Keywords Tags */}
              {page.seo_keywords && page.seo_keywords.length > 0 && (
                <div className="mt-6 pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Açar sözlər:</p>
                  <div className="flex flex-wrap gap-2">
                    {page.seo_keywords.slice(0, 10).map((keyword, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
