import { useState, useEffect, Suspense, lazy } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import JobSidebar from "@/components/JobSidebar";
import AdBanner from "@/components/AdBanner";
import BottomNavigation from "@/components/BottomNavigation";
import MobileHeader from "@/components/MobileHeader";
import JobListings from "@/components/JobListings";
import { Job } from "@/types/job";
import { useSEO, useDynamicSEO } from "@/hooks/useSEO";
import { useReferralCode } from "@/hooks/useReferralCode";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";

const JobDetails = lazy(() => import("@/components/JobDetails"));

interface Category {
  id: string;
  name: string;
  slug: string;
}

const Vacancies = () => {
  const { jobSlug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const isMobile = useIsMobile();
  
  const { getUrlWithReferral } = useReferralCode();

  // Simple referral click logging function
  const logReferralClick = (referralId: string) => {
    console.log('Referral click logged:', referralId);
    // Add actual logging logic here if needed
  };

  // Static SEO for vacancies page
  useSEO({
    title: "Vakansiyalar | İş Elanları Azərbaycan - Jooble",
    description: "Azərbaycanda aktiv vakansiyalar və iş elanları. Müxtəlif sahələrdə iş imkanları, maaş məlumatları və şirkət təfərrüatları.",
    keywords: "vakansiyalar, iş elanları, Azərbaycan işləri, aktiv elanlar, iş axtarışı",
    url: "/vacancies"
  });

  // Dynamic SEO for specific job
  useDynamicSEO('job', selectedJob);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name');
      
      if (data) {
        setCategories(data);
      }
    };

    fetchCategories();
  }, []);

  // Handle referral clicks
  useEffect(() => {
    const referralId = searchParams.get('ref');
    if (referralId) {
      logReferralClick(referralId);
    }
  }, [searchParams, logReferralClick]);

  // Handle filters from URL
  useEffect(() => {
    const category = searchParams.get('category');
    const company = searchParams.get('company');
    
    if (category) setSelectedCategory(category);
    if (company) setSelectedCompany(company);
  }, [searchParams]);

  // Fetch specific job by slug
  useEffect(() => {
    const fetchJobBySlug = async () => {
      if (!jobSlug) {
        setSelectedJob(null);
        return;
      }

      const { data: job } = await supabase
        .from('jobs')
        .select(`
          *,
          companies!inner(*),
          categories!inner(*)
        `)
        .eq('slug', jobSlug)
        .eq('is_active', true)
        .single();

      if (job) {
        // Transform database job to Job type
        const transformedJob: Job = {
          id: job.id,
          slug: job.slug,
          title: job.title,
          company: job.companies?.name || '',
          company_id: job.company_id,
          companyLogo: job.companies?.logo,
          isVerified: job.companies?.is_verified || false,
          location: job.location,
          type: job.type as 'full-time' | 'part-time' | 'contract' | 'internship',
          salary: job.salary,
          description: job.description || '',
          tags: (job.tags || []).filter((tag: string) =>
            tag === 'premium' || tag === 'new' || tag === 'urgent' || tag === 'remote'
          ) as ('premium' | 'new' | 'urgent' | 'remote')[],
          views: job.views || 0,
          postedAt: formatDate(job.created_at),
          category: job.categories?.name || '',
          applicationUrl: job.application_url,
          applicationType: job.application_type === 'email' ? 'email' : 'website',
          applicationEmail: job.application_email
        };
        setSelectedJob(transformedJob);
      } else {
        navigate('/vacancies');
      }
    };

    fetchJobBySlug();
  }, [jobSlug, navigate]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return "Bu gün";
    if (diffInHours < 48) return "Dünən";
    return `${Math.floor(diffInHours / 24)} gün əvvəl`;
  };

  const handleJobSelect = (job: Job) => {
    if (job.slug) {
      window.location.href = `/vacancies/${job.slug}`;
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(prev => prev === category ? "" : category);
    setSelectedJob(null);
  };

  return (
    <>
      {/* Structured Data for Vacancies Page */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Vakansiyalar",
          "description": "Azərbaycanda aktiv vakansiyalar və iş elanları",
          "url": "https://jooble.az/vacancies",
          "mainEntity": {
            "@type": "ItemList",
            "name": "İş Elanları"
          }
        })}
      </script>

      <div className="min-h-screen bg-background">
        {isMobile && <MobileHeader />}
        
        <div className="container mx-auto px-4 py-4 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3">
              <JobSidebar 
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
              />
              <div className="mt-6">
                <AdBanner position="sidebar" />
              </div>
            </div>
            
            <div className="lg:col-span-6">
              <JobListings
                selectedJob={selectedJob}
                onJobSelect={handleJobSelect}
                selectedCategory={selectedCategory}
                companyFilter={selectedCompany}
              />
            </div>
            
            <div className="lg:col-span-3">
              {selectedJob ? (
                <div className="sticky top-4">
                  <Suspense fallback={
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-3/4" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  }>
                    <JobDetails jobId={selectedJob.id} />
                  </Suspense>
                </div>
              ) : (
                <div className="sticky top-4">
                  <AdBanner position="details" />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {isMobile && <BottomNavigation onCategorySelect={handleCategorySelect} />}
      </div>
    </>
  );
};

export default Vacancies;