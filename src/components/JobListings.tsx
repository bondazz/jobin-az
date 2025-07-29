import { useState, useMemo, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types/job';
import JobCard from './JobCard';
import AdBanner from './AdBanner';
import { Search, MapPin, Loader2 } from 'lucide-react';

interface JobListingsProps {
  selectedJob: Job | null;
  onJobSelect: (job: Job) => void;
  selectedCategory?: string;
  companyFilter?: string;
  showHeader?: boolean;
  showOnlySaved?: boolean;
  companyId?: string;
}

const JobListings = ({
  selectedJob,
  onJobSelect,
  selectedCategory,
  companyFilter,
  showHeader = true,
  showOnlySaved = false,
  companyId
}: JobListingsProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const JOBS_PER_PAGE = 25;

  // Optimize job fetching - get companies in batch with pagination
  const fetchJobs = useCallback(async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setOffset(0);
      }

      const currentOffset = isLoadMore ? offset : 0;
      
      // Get jobs with companies in one query
      let query = supabase.from('jobs').select(`
          id, title, location, type, salary, tags, views, created_at, company_id,
          companies!inner (id, name, logo, is_verified),
          categories!inner (name)
        `).eq('is_active', true)
        .range(currentOffset, currentOffset + JOBS_PER_PAGE - 1);

      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      // Transform with companies already included
      const transformedJobs = data?.map(job => ({
        id: job.id,
        title: job.title,
        company: job.companies?.name || '',
        company_id: job.company_id,
        companyLogo: job.companies?.logo,
        isVerified: job.companies?.is_verified || false,
        location: job.location,
        type: job.type as 'full-time' | 'part-time' | 'contract' | 'internship',
        salary: job.salary,
        description: '', // Don't load description for list view
        tags: (job.tags || []).filter((tag: string) => 
          tag === 'premium' || tag === 'new' || tag === 'urgent' || tag === 'remote'
        ) as ('premium' | 'new' | 'urgent' | 'remote')[],
        views: job.views,
        postedAt: formatDate(job.created_at),
        category: job.categories?.name || '',
        applicationUrl: '',
        applicationType: 'website' as const,
        applicationEmail: ''
      })) || [];
      
      if (isLoadMore) {
        setJobs(prev => [...prev, ...transformedJobs]);
      } else {
        setJobs(transformedJobs);
      }

      // Check if there are more jobs
      setHasMore(transformedJobs.length === JOBS_PER_PAGE);
      setOffset(currentOffset + JOBS_PER_PAGE);
      
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [companyId, offset]);

  useEffect(() => {
    fetchJobs(false);
  }, [companyId]);
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

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      
      if (scrollTop + clientHeight >= scrollHeight - 1000 && hasMore && !loadingMore && !loading) {
        fetchJobs(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore, loading, fetchJobs]);

  // Reset when filters change
  useEffect(() => {
    setOffset(0);
    fetchJobs(false);
  }, [selectedCategory, companyFilter, showOnlySaved]);
  
  // Debounced search for performance
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [debouncedLocationFilter, setDebouncedLocationFilter] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLocationFilter(locationFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [locationFilter]);

  const filteredJobs = useMemo(() => {
    // Early return for empty jobs
    if (jobs.length === 0) return [];
    
    let jobsToFilter = jobs;

    // Optimized saved jobs filtering
    if (showOnlySaved) {
      const savedJobIds = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      if (savedJobIds.length === 0) return [];
      jobsToFilter = jobs.filter(job => savedJobIds.includes(job.id));
    }
    
    // Optimized filtering with early exits
    const searchLower = debouncedSearchQuery.toLowerCase();
    const locationLower = debouncedLocationFilter.toLowerCase();
    
    const filtered = jobsToFilter.filter(job => {
      // Quick category check first (fastest)
      if (selectedCategory && job.category !== selectedCategory) return false;
      if (companyFilter && job.company_id !== companyFilter) return false;
      
      // Search checks last (slower)
      if (searchLower && !job.title.toLowerCase().includes(searchLower) && 
          !job.company.toLowerCase().includes(searchLower)) return false;
      if (locationLower && !job.location.toLowerCase().includes(locationLower)) return false;
      
      return true;
    });

    // Simple premium sorting - just check first tag
    const result = [];
    const premiumJobs = [];
    const regularJobs = [];
    
    for (const job of filtered) {
      if (job.tags?.[0] === 'premium') {
        premiumJobs.push(job);
      } else {
        regularJobs.push(job);
      }
    }

    return [...premiumJobs, ...regularJobs];
  }, [jobs, debouncedSearchQuery, debouncedLocationFilter, selectedCategory, companyFilter, showOnlySaved]);
  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      'Technology': 'Texnologiya',
      'Marketing': 'Marketinq',
      'Finance': 'Maliyyə',
      'Healthcare': 'Səhiyyə',
      'Education': 'Təhsil',
      'Design': 'Dizayn',
      'Sales': 'Satış',
      'Engineering': 'Mühəndislik'
    };
    return categoryMap[category] || category;
  };
  return <div className="flex-1 flex flex-col h-full bg-background">
      {/* Mobile/Tablet Sticky Header with Logo */}
      {showHeader && <div className="lg:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
          
        </div>}

      {/* Compact Search Section - Max height 73px */}
      {showHeader && !companyId && <div className="relative overflow-hidden bg-gradient-to-br from-background via-primary/8 to-accent/5 border-b border-border/30 max-h-[73px]">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-60"></div>
          
          <div className="relative z-10 p-2 sm:p-3">
            <div className="flex flex-row gap-2 items-center justify-center max-w-4xl mx-auto">
              {/* Job Search Input */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3 sm:w-4 sm:h-4" />
                <Input
                  placeholder="İş axtarın..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 sm:pl-10 bg-background/60 backdrop-blur-sm border-border/60 focus:border-primary/60 text-xs sm:text-sm h-8 sm:h-9 w-full"
                />
              </div>
              
              {/* Location Filter */}
              <div className="relative flex-1 min-w-0">
                <MapPin className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3 sm:w-4 sm:h-4" />
                <Input
                  placeholder="Şəhər"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-7 sm:pl-10 bg-background/60 backdrop-blur-sm border-border/60 focus:border-primary/60 text-xs sm:text-sm h-8 sm:h-9 w-full"
                />
              </div>
            </div>
          </div>
        </div>}

      {/* Job List - Responsive Container */}
      <div className="flex-1 overflow-y-auto p-2 bg-gradient-to-b from-transparent to-primary/5 w-full max-w-[100%] lg:max-w-[calc(100%+207px)] mx-auto lg:min-h-[calc(100vh-200px)] lg:px-0 py-0">
        <div className="flex flex-col gap-2 justify-center items-center w-full max-w-full px-2 py-[12px] lg:max-w-[550px]">
          {loading ? <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div> : filteredJobs.length > 0 ? filteredJobs.map((job, index) => <div key={`job-${job.id}`} className="w-full max-w-full min-w-0">
                {/* Advertisement Banner every 6 jobs */}
                {index > 0 && index % 6 === 0 && <AdBanner position="job_listing" className="mb-2 animate-fade-in" />}
                
                 <div className="animate-fade-in w-full" style={{
            animationDelay: `${index * 20}ms` // Reduced for better performance
          }}>
                   <JobCard job={job} isSelected={selectedJob?.id === job.id} onClick={() => onJobSelect(job)} isAlternate={index % 2 === 1} />
                 </div>
              </div>) : <div className="flex flex-col items-center justify-center py-16 text-muted-foreground animate-fade-in">
              <div className="relative mb-4">
                <Search className="w-12 h-12 opacity-30" />
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl"></div>
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Heç bir iş tapılmadı</h3>
              <p className="text-sm text-center mb-4 max-w-sm leading-relaxed">
                Axtarış kriteriyalarınızı dəyişdirin və ya fərqli kateqoriyaları araşdırın
              </p>
              <Button variant="outline" className="mt-2 px-4 py-2.5 rounded-lg border-primary/30 text-primary hover:bg-primary hover:text-white transition-all duration-300 hover:shadow-lg font-medium text-sm" onClick={() => {
            setSearchQuery('');
            setLocationFilter('');
          }}>
                Süzgəcləri təmizlə
              </Button>
            </div>}
        </div>
        
        {/* Load More Button / Loading Indicator */}
        {hasMore && !loading && (
          <div className="flex justify-center py-8">
            {loadingMore ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Daha çox elan yüklənir...</span>
              </div>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => fetchJobs(true)}
                className="px-6 py-2 border-primary/30 text-primary hover:bg-primary hover:text-white transition-all duration-300"
              >
                Daha çox elan
              </Button>
            )}
          </div>
        )}
      </div>
    </div>;
};
export default JobListings;