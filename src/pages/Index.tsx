
import { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types/job';
import JobListings from '@/components/JobListings';
import JobDetails from '@/components/JobDetails';
import MobileMenu from '@/components/MobileMenu';
import BottomNavigation from '@/components/BottomNavigation';
import MobileHeader from '@/components/MobileHeader';
import AdBanner from '@/components/AdBanner';
import { generatePageSEO, updatePageMeta } from '@/utils/seo';

interface Category {
  id: string;
  name: string;
  slug: string;
}

const Index = () => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { jobSlug } = useParams();
  const navigate = useNavigate();

  // SEO setup
  useEffect(() => {
    const seoData = generatePageSEO('vacancies');
    updatePageMeta(seoData);
  }, []);

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
            *,
            companies (name, logo, is_verified),
            categories (name)
          `)
          .eq('slug', jobSlug)
          .eq('is_active', true)
          .single();

        if (data && !error) {
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
            requirements: data.requirements || [],
            benefits: data.benefits || [],
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

  const handleJobSelect = async (job: Job) => {
    // Get job slug from database
    const { data } = await supabase
      .from('jobs')
      .select('slug')
      .eq('id', job.id)
      .single();
    
    if (data?.slug) {
      navigate(`/vacancies/${data.slug}`);
    }
    setSelectedJob(job);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    setSelectedJob(null);
  };

  return (
    <div className="h-full flex bg-gradient-to-br from-background via-primary/3 to-background overflow-hidden">
      {/* Mobile Header */}
      <MobileHeader />
      
      {/* Header Advertisement */}
      <AdBanner position="header" className="hidden lg:block absolute top-0 left-72 right-0 p-3 z-10" />
      
      {/* Main Content Area */}
      <div className="flex-1 flex min-w-0 pb-16 xl:pb-0 pt-14 xl:pt-0 lg:pt-20">
        {/* Job Listings - Responsive Column */}
        <div className="w-full lg:w-[400px] xl:w-[450px] border-r border-border animate-fade-in">
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
          <JobDetails jobId={selectedJob?.id || null} />
          
          {/* Content Advertisement */}
          <div className="p-4">
            <AdBanner position="content" />
          </div>
        </div>
      </div>

      {/* Mobile Job Details Modal */}
      {selectedJob && (
        <div className="lg:hidden fixed inset-0 bg-background z-50 flex flex-col animate-slide-in-right">
          {/* Mobile Header with Logo */}
          <MobileHeader 
            showCloseButton={true} 
            onClose={() => setSelectedJob(null)} 
          />
          {/* Job Details with proper spacing */}
          <div className="flex-1 overflow-y-auto pb-20">
            <JobDetails jobId={selectedJob?.id || null} isMobile={true} />
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
