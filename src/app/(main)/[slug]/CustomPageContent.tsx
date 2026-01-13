'use client';

import { useEffect, useRef, useState, useCallback, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types/job';
import JobListings from '@/components/JobListings';
import MobileHeader from '@/components/MobileHeader';
import AdBanner from '@/components/AdBanner';
import PushNotificationBanner from '@/components/PushNotificationBanner';

const JobDetails = lazy(() => import('@/components/JobDetails'));

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
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Process content links for dofollow
  useEffect(() => {
    if (contentRef.current && page?.content) {
      const links = contentRef.current.querySelectorAll('a');
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
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
          // External links open in new tab
          if (href.startsWith('http') && !href.includes('jobin.az')) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener');
          }
        }
      });
    }
  }, [page?.content]);

  const handleJobSelect = useCallback((job: Job) => {
    if (job.slug) {
      router.push(`/vacancies/${job.slug}`, { scroll: false });
    }
    setSelectedJob(job);
  }, [router]);

  // This component should never receive null page (server handles 404)
  // But keep fallback just in case
  if (!page) {
    return null;
  }

  return (
    <div className="h-full flex bg-gradient-to-br from-background via-primary/3 to-background overflow-hidden">
      {/* Mobile Header */}
      <MobileHeader isJobPage={false} />

      {/* Header Advertisement */}
      <AdBanner position="header" className="hidden lg:block absolute top-0 left-72 right-0 p-3 z-10" />

      {/* Main Content Area - Same structure as /vacancies */}
      <div className="flex-1 flex min-w-0 pb-16 xl:pb-0 pt-14 xl:pt-0 lg:pt-20">
        {/* Job Listings - Left/Center Column (same as /vacancies) */}
        <div className="w-full lg:w-[500px] xl:w-[580px] 2xl:w-[650px] border-r border-border animate-fade-in">
          <JobListings
            selectedJobId={selectedJob?.id || null}
            onJobSelect={handleJobSelect}
            selectedCategory=""
            companyFilter=""
          />
        </div>

        {/* Custom Page Content - Right Column (mənim yazdığım mətn) */}
        <div className="hidden lg:block flex-1 bg-gradient-to-br from-job-details to-primary/3 animate-slide-in-right overflow-y-auto">
          <div className="p-6 lg:p-8">
            {/* Page Title */}
            <h1 className="text-2xl xl:text-3xl font-bold text-primary mb-4">
              {page.seo_title}
            </h1>
            
            {/* Page Content */}
            {page.content && (
              <div 
                ref={contentRef}
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
                  prose-img:rounded-lg prose-img:shadow-md"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            )}

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

          {/* Content Advertisement */}
          <div className="p-4">
            <AdBanner position="content" />
          </div>
        </div>
      </div>

      {/* Mobile Job Details Modal */}
      {selectedJob && (
        <div className="lg:hidden fixed inset-0 bg-background z-40 flex flex-col animate-slide-in-right">
          <MobileHeader
            showCloseButton={true}
            onClose={() => setSelectedJob(null)}
            isJobPage={true}
          />
          <div className="flex-1 overflow-y-auto pb-20">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }>
              <JobDetails jobId={selectedJob?.id || null} isMobile={true} primaryHeading={false} />
            </Suspense>
          </div>
        </div>
      )}

      {/* Footer Advertisement */}
      <AdBanner position="footer" className="hidden lg:block absolute bottom-0 left-72 right-0 p-3 bg-background/90 backdrop-blur-sm border-t border-border" />

      {/* Push Notification Banner */}
      <PushNotificationBanner />
    </div>
  );
}