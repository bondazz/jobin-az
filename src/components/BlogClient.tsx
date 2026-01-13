"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import BlogListings from '@/components/BlogListings';
import BlogDetails from '@/components/BlogDetails';
import MobileHeader from '@/components/MobileHeader';
import SEOBreadcrumb from '@/components/SEOBreadcrumb';

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  h1_title: string | null;
  published_at: string | null;
  updated_at: string;
  reading_time_minutes: number | null;
  views: number | null;
  blog_authors: {
    id: string;
    name: string;
    slug: string;
    bio: string | null;
    avatar_url: string | null;
    website: string | null;
    twitter: string | null;
    linkedin: string | null;
  } | null;
}

const BlogClient = () => {
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const params = useParams();
  const blogSlug = params?.slug as string | undefined;
  const router = useRouter();
  const pathname = usePathname();

  // Fetch blog by slug from URL
  useEffect(() => {
    if (blogSlug) {
      const fetchBlogBySlug = async () => {
        const { data, error } = await supabase
          .from('blogs')
          .select(`
            *,
            blog_authors (
              id,
              name,
              slug,
              bio,
              avatar_url,
              website,
              twitter,
              linkedin
            )
          `)
          .eq('slug', blogSlug)
          .eq('is_published', true)
          .eq('is_active', true)
          .single();

        if (data && !error) {
          setSelectedBlog(data);
        }
      };

      fetchBlogBySlug();
    } else {
      setSelectedBlog(null);
    }
  }, [blogSlug]);

  // Clear selected blog when navigating to blog list
  useEffect(() => {
    if (pathname === '/blog' && selectedBlog) {
      setSelectedBlog(null);
    }
  }, [pathname, selectedBlog]);

  const handleBlogSelect = useCallback((blog: Blog) => {
    router.push(`/blog/${blog.slug}`, { scroll: false });
    setSelectedBlog(blog);
  }, [router]);

  const handleClose = useCallback(() => {
    setSelectedBlog(null);
    router.push('/blog');
  }, [router]);

  // Generate Blog list schema
  const generateBlogListSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Jobin.az Bloq",
      "description": "Karyera inkişafı, iş axtarışı və əmək bazarı haqqında məqalələr",
      "url": "https://Jobin.az/blog",
      "publisher": {
        "@type": "Organization",
        "name": "Jobin.az",
        "logo": {
          "@type": "ImageObject",
          "url": "https://Jobin.az/icons/icon-512x512.jpg"
        }
      }
    };
  };

  return (
    <div className="h-full flex bg-gradient-to-br from-background via-primary/3 to-background overflow-hidden">
      {/* Blog List Schema */}
      {!blogSlug && pathname === '/blog' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateBlogListSchema())
          }}
        />
      )}

      {/* Mobile Header */}
      <MobileHeader isJobPage={!!blogSlug} />

      {/* Main Content Area */}
      <div className="flex-1 flex min-w-0 pb-16 xl:pb-0 pt-14 xl:pt-0">
        {/* Blog Listings - Responsive Column */}
        <div className="w-full lg:w-[500px] xl:w-[580px] 2xl:w-[650px] border-r border-border animate-fade-in">
          {/* SEO Content Section - Only on blog list */}
          {pathname === '/blog' && !blogSlug && (
            <>
              <SEOBreadcrumb 
                items={[
                  { label: "Bloq" }
                ]} 
                visuallyHidden={true}
              />
              <div className="sr-only">
                <h2>Bloq Məqalələri - Karyera və İş Axtarışı</h2>
                <p>
                  Jobin.az bloqu ilə karyera inkişafı, iş axtarışı məsləhətləri, CV hazırlama qaydaları 
                  və müsahibə hazırlığı haqqında ən son məqalələri oxuyun.
                </p>
              </div>
            </>
          )}
          <BlogListings
            selectedBlogId={selectedBlog?.id || null}
            onBlogSelect={handleBlogSelect}
          />
        </div>

        {/* Blog Details - Desktop Only */}
        <div className="hidden lg:block flex-1 bg-gradient-to-br from-job-details to-primary/3 animate-slide-in-right">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }>
            <BlogDetails blogId={selectedBlog?.id || null} />
          </Suspense>
        </div>
      </div>

      {/* Mobile Blog Details Modal */}
      {selectedBlog && (
        <div className="lg:hidden fixed inset-0 bg-background z-40 flex flex-col animate-slide-in-right">
          <MobileHeader
            showCloseButton={true}
            onClose={handleClose}
            isJobPage={true}
          />
          <div className="flex-1 overflow-y-auto pb-20">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }>
              <BlogDetails blogId={selectedBlog?.id || null} isMobile={true} />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogClient;
