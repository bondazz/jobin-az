
import { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types/job';
import JobListings from '@/components/JobListings';
import JobDetails from '@/components/JobDetails';
import MobileMenu from '@/components/MobileMenu';
import BottomNavigation from '@/components/BottomNavigation';
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

  // Check for category filter from URL
  useEffect(() => {
    const categorySlug = searchParams.get('category');
    if (categorySlug && categories.length > 0) {
      const category = categories.find(c => c.slug === categorySlug);
      if (category) {
        setSelectedCategory(category.name);
      }
    }
  }, [searchParams, categories]);

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

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
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
      {/* Main Content Area - No mobile header needed */}
      <div className="flex-1 flex min-w-0 pb-16 xl:pb-0">
        {/* Job Listings - Responsive Column */}
        <div className="w-full lg:w-[400px] xl:w-[450px] border-r border-border animate-fade-in">
          <JobListings
            selectedJob={selectedJob}
            onJobSelect={handleJobSelect}
            selectedCategory={selectedCategory}
          />
        </div>

        {/* Job Details - Desktop Only */}
        <div className="hidden lg:block flex-1 bg-gradient-to-br from-job-details to-primary/3 animate-slide-in-right">
                  <JobDetails jobId={selectedJob?.id || null} />
        </div>
      </div>

      {/* Mobile Job Details Modal */}
      {selectedJob && (
        <div className="lg:hidden fixed inset-0 bg-background z-50 overflow-y-auto animate-slide-in-right">
          <div className="sticky top-0 bg-gradient-to-r from-background to-primary/8 border-b border-border p-4 flex items-center justify-between shadow-sm">
            <h2 className="font-bold text-lg text-foreground">İş Təfərrüatları</h2>
            <button
              onClick={() => setSelectedJob(null)}
              className="w-8 h-8 rounded-lg bg-muted/50 hover:bg-destructive/20 hover:text-destructive text-muted-foreground transition-all duration-300 flex items-center justify-center text-lg font-bold"
            >
              ×
            </button>
          </div>
          <JobDetails jobId={selectedJob?.id || null} />
        </div>
      )}

      {/* Bottom Navigation - Mobile Only */}
      <BottomNavigation 
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
      />
    </div>
  );
};

export default Index;
