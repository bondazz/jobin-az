
import { useState, useEffect, useCallback, memo, Suspense, lazy } from 'react';
import { useSearchParams, useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types/job';
import JobListings from '@/components/JobListings';
import BottomNavigation from '@/components/BottomNavigation';
import MobileHeader from '@/components/MobileHeader';
import AdBanner from '@/components/AdBanner';
import { generatePageSEO, updatePageMeta } from '@/utils/seo';
import { useDynamicSEO } from '@/hooks/useSEO';
import { useReferralCode } from '@/hooks/useReferralCode';

// Lazy load JobDetails for better performance
const JobDetails = lazy(() => import('@/components/JobDetails'));

interface Category {
  id: string;
  name: string;
  slug: string;
}

const Index = () => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [jobData, setJobData] = useState<any>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { jobSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getUrlWithReferral } = useReferralCode();

  // Dynamic SEO for job pages
  useDynamicSEO('job', jobSlug ? jobData : null);

  // SEO setup based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    
    if (!jobSlug) {
      if (currentPath === '/vacancies' || currentPath.startsWith('/vacancies/')) {
        // SEO for vacancies pages but canonical points to home
        updatePageMeta({
          title: "Vakansiyalar | İş Elanları Azərbaycan - Jooble",
          description: "Azərbaycanda aktiv vakansiyalar və iş elanları. Müxtəlif sahələrdə iş imkanları, maaş məlumatları və şirkət təfərrüatları.",
          keywords: "vakansiyalar, iş elanları, Azərbaycan işləri, aktiv elanlar, iş axtarışı",
          url: "/" // Canonical always points to home
        });
      } else if (currentPath === '/aktiv-vakansiya' || currentPath.startsWith('/aktiv-vakansiya/')) {
        // SEO for aktiv-vakansiya pages but canonical points to home
        updatePageMeta({
          title: "Aktiv Vakansiyalar | İş Elanları Azərbaycan - Jooble",
          description: "Azərbaycanda aktiv vakansiyalar və iş elanları. Müxtəlif sahələrdə güncel iş imkanları və yeni əlavə edilən vakansiyalar.",
          keywords: "aktiv vakansiyalar, iş elanları, güncel elanlar, Azərbaycan işləri, yeni vakansiyalar",
          url: "/" // Canonical always points to home
        });
      } else {
        // Default homepage SEO
        const updateSEO = async () => {
          const seoData = await generatePageSEO('home');
          updatePageMeta({
            ...seoData,
            url: "/" // Canonical always points to home
          });
        };
        updateSEO();
      }
    }
  }, [location.pathname, jobSlug]);

  // Generate WebSite structured data for homepage
  const generateWebsiteSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Jooble Azərbaycan",
      "description": "Azərbaycan'ın ən böyük iş axtarış platforması. Minlərlə vakansiya və iş elanı bir yerdə.",
      "url": window.location.origin,
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": window.location.origin + "/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Jooble Azərbaycan",
        "url": window.location.origin
      }
    };
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name');
      
      if (data) setCategories(data);
    };
    
    fetchCategories();
  }, []);

  // Referral click logging
  useEffect(() => {
    const code = searchParams.get('ref');
    if (!code) return;
    const key = `ref_seen_${code}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, '1');
    (async () => {
      try {
        await (supabase.rpc as any)('log_referral_click' as any, { code, ua: navigator.userAgent } as any);
      } catch (e) {
        // ignore
      }
    })();
  }, [searchParams]);
  // Check for category and company filters from URL
  useEffect(() => {
    const categorySlug = searchParams.get('category');
    const companySlug = searchParams.get('company');
    
    if (categorySlug && categories.length > 0) {
      const category = categories.find(c => c.slug === categorySlug);
      if (category) {
        setSelectedCategory(category.name);
      }
    }
    
    if (companySlug) {
      setSelectedCompany(companySlug);
    }
  }, [searchParams, categories]);

  const [selectedCompany, setSelectedCompany] = useState<string>('');

  // Fetch job by slug from URL
  useEffect(() => {
    if (jobSlug) {
      const fetchJobBySlug = async () => {
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            id, application_type, salary, company_id, title, is_active, updated_at, type, location, seo_keywords, seo_description, views, category_id, seo_title, created_at, slug, application_url, tags, description,
            companies (name, logo, is_verified),
            categories (name)
          `)
          .eq('slug', jobSlug)
          .eq('is_active', true)
          .single();

        if (data && !error) {
          // Store raw data for SEO
          setJobData(data);
          
          const transformedJob = {
            id: data.id,
            title: data.title,
            company: data.companies?.name || '',
            company_id: data.company_id,
            companyLogo: data.companies?.logo,
            location: data.location,
            type: data.type as 'full-time' | 'part-time' | 'contract' | 'internship',
            salary: data.salary,
            description: data.description,
            tags: (data.tags || []).filter((tag: string) => 
              ['premium', 'new', 'urgent', 'remote'].includes(tag)
            ) as ('premium' | 'new' | 'urgent' | 'remote')[],
            views: data.views,
            postedAt: formatDate(data.created_at),
            category: data.categories?.name || '',
            applicationUrl: data.application_url
          };
          setSelectedJob(transformedJob);
        }
      };
      
      fetchJobBySlug();
    } else {
      setSelectedJob(null);
      setJobData(null);
    }
  }, [jobSlug]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Bu gün';
    if (diffDays === 2) return 'Dünən';
    if (diffDays <= 7) return `${diffDays - 1} gün əvvəl`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} həftə əvvəl`;
    return `${Math.ceil(diffDays / 30)} ay əvvəl`;
  };

  const handleJobSelect = useCallback(async (job: Job) => {
    // Get job slug from database
    const { data } = await supabase
      .from('jobs')
      .select('slug')
      .eq('id', job.id)
      .single();
    
    if (data?.slug) {
      const urlWithReferral = getUrlWithReferral(`/vacancies/${data.slug}`);
      navigate(urlWithReferral);
    }
    setSelectedJob(job);
  }, [navigate, getUrlWithReferral]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    setSelectedJob(null);
  };

  // Generate aggregate rating structured data for vacancies page
  const generateAggregateRatingSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Vakansiyalar və İş Elanları",
      "description": "Azərbaycanda aktiv vakansiyalar və iş elanları. Müxtəlif sahələrdə ən son iş imkanları.",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.7",
        "reviewCount": "2847",
        "bestRating": "5",
        "worstRating": "1"
      },
      "itemListElement": []
    };
  };

  return (
    <div className="h-full flex bg-gradient-to-br from-background via-primary/3 to-background overflow-hidden">
      {/* WebSite Structured Data for Homepage */}
      {!jobSlug && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateWebsiteSchema())
          }}
        />
      )}
      
      {/* Aggregate Rating Structured Data for Vacancies */}
      {(location.pathname === '/vacancies' || location.pathname.startsWith('/vacancies/')) && !jobSlug && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateAggregateRatingSchema())
          }}
        />
      )}
      
      {/* Mobile Header */}
      <MobileHeader />
      
      {/* Header Advertisement */}
      <AdBanner position="header" className="hidden lg:block absolute top-0 left-72 right-0 p-3 z-10" />
      
      {/* Main Content Area */}
      <div className="flex-1 flex min-w-0 pb-16 xl:pb-0 pt-14 xl:pt-0 lg:pt-20">
        {/* Job Listings - Responsive Column */}
        <div className="w-full lg:w-[400px] xl:w-[450px] border-r border-border animate-fade-in">
          {/* SEO Content Section - Hidden visually but present for SEO */}
          {(location.pathname === '/vacancies' || location.pathname === '/') && !jobSlug && (
            <div className="sr-only">
              <h1>Vakansiyalar və İş Elanları Azərbaycan</h1>
              <p>
                Azərbaycanda son vakansiyalar və iş elanları. Hər gün yeni və aktiv vakansiya elanları əlavə olunur. 
                İş axtaranların ən son iş imkanlarına müraciət edə bilər. Uyğun iş tapmaq üçün CV nizi yükləyin və 
                iş elanları və vakansiyalara müraciət edin. Müxtəlif sahələrdə edə bilər imkanları ilə.
              </p>
            </div>
          )}
          {/* Active Filters */}
          {(selectedCategory || selectedCompany) && (
            <div className="p-3 bg-primary/5 border-b border-border">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">Aktiv filterlər:</span>
                {selectedCategory && (
                  <div className="flex items-center gap-1 bg-primary/20 text-primary text-xs px-2 py-1 rounded">
                    <span>{selectedCategory}</span>
                    <button 
                      onClick={() => {
                        setSelectedCategory('');
                        navigate('/vacancies');
                      }}
                      className="text-primary hover:text-primary/70"
                    >
                      ×
                    </button>
                  </div>
                )}
                {selectedCompany && (
                  <div className="flex items-center gap-1 bg-primary/20 text-primary text-xs px-2 py-1 rounded">
                    <span>Şirkət filtri</span>
                    <button 
                      onClick={() => {
                        setSelectedCompany('');
                        navigate('/vacancies');
                      }}
                      className="text-primary hover:text-primary/70"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          <JobListings
            selectedJob={selectedJob}
            onJobSelect={handleJobSelect}
            selectedCategory={selectedCategory}
            companyFilter={selectedCompany}
          />
        </div>

        {/* Job Details - Desktop Only */}
        <div className="hidden lg:block flex-1 bg-gradient-to-br from-job-details to-primary/3 animate-slide-in-right">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }>
            <JobDetails jobId={selectedJob?.id || null} />
          </Suspense>
          
          {/* Content Advertisement */}
          <div className="p-4">
            <AdBanner position="content" />
          </div>
        </div>
      </div>

      {/* Mobile Job Details Modal */}
      {selectedJob && (
        <div className="lg:hidden fixed inset-0 bg-background z-40 flex flex-col animate-slide-in-right">
          {/* Mobile Header with Logo */}
          <MobileHeader 
            showCloseButton={true} 
            onClose={() => setSelectedJob(null)} 
          />
          {/* Job Details with proper spacing */}
          <div className="flex-1 overflow-y-auto pb-20">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }>
              <JobDetails jobId={selectedJob?.id || null} isMobile={true} />
            </Suspense>
          </div>
        </div>
      )}

      {/* Footer Advertisement */}
      <AdBanner position="footer" className="hidden lg:block absolute bottom-0 left-72 right-0 p-3 bg-background/90 backdrop-blur-sm border-t border-border" />

      {/* Bottom Navigation - Mobile Only */}
      <BottomNavigation 
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
      />
    </div>
  );
};

export default Index;
