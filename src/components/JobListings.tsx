import { useState, useMemo, useEffect, useCallback, useRef, memo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types/job';
import JobCard from './JobCard';
import AdBanner from './AdBanner';
import { Search, MapPin, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
interface JobListingsProps {
  selectedJobId: string | null;
  onJobSelect: (job: Job) => void;
  selectedCategory?: string;
  companyFilter?: string;
  showHeader?: boolean;
  showOnlySaved?: boolean;
  companyId?: string;
  initialJobs?: Job[];
}

const JobListings = ({
  selectedJobId,
  onJobSelect,
  selectedCategory,
  companyFilter,
  showHeader = true,
  showOnlySaved = false,
  companyId,
  initialJobs = []
}: JobListingsProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const [jobs, setJobs] = useState<Job[]>(() => {
    // Use initialJobs if provided (SSR)
    if (initialJobs.length > 0) {
      return initialJobs;
    }
    // Otherwise try sessionStorage (client-side navigation)
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('jobListings_data');
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [loading, setLoading] = useState(() => {
    // If initialJobs provided, no loading needed
    if (initialJobs.length > 0) return false;
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('jobListings_data');
    }
    return true;
  });

  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [displayCount, setDisplayCount] = useState(15);
  const JOBS_PER_PAGE = 25;

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (jobs.length > 0) {
      sessionStorage.setItem('jobListings_data', JSON.stringify(jobs));
    }
  }, [jobs]);

  const normalizeTurkish = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');
  };

  const formatDate = (dateString: string) => {
    const BAKU_OFFSET = 4 * 60;
    const jobDate = new Date(dateString);
    const jobBakuTime = new Date(jobDate.getTime() + BAKU_OFFSET * 60 * 1000);
    const now = new Date();
    const nowBakuTime = new Date(now.getTime() + BAKU_OFFSET * 60 * 1000);
    const jobDay = new Date(jobBakuTime.getFullYear(), jobBakuTime.getMonth(), jobBakuTime.getDate());
    const today = new Date(nowBakuTime.getFullYear(), nowBakuTime.getMonth(), nowBakuTime.getDate());
    const diffTime = today.getTime() - jobDay.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Bu gün';
    if (diffDays === 1) return 'Dünən';
    if (diffDays <= 7) return `${diffDays} gün əvvəl`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} həftə əvvəl`;
    return `${Math.ceil(diffDays / 30)} ay əvvəl`;
  };

  const fetchJobs = useCallback(async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        if (jobs.length === 0) {
          setLoading(true);
        }
        setOffset(0);
      }
      const currentOffset = isLoadMore ? offset : 0;

      const selectFields = `
          id, title, location, type, salary, tags, views, created_at, company_id, expiration_date, slug,
          companies(id, name, logo, is_verified, slug),
          categories(name)
        `;

      const transform = (data: any[] | null): Job[] => (data || []).map((job: any) => ({
        id: job.id,
        slug: job.slug,
        title: job.title,
        company: job.companies?.name || '',
        company_id: job.company_id || undefined,
        companyLogo: job.companies?.logo || undefined,
        companySlug: job.companies?.slug || undefined,
        isVerified: job.companies?.is_verified || false,
        location: job.location,
        type: job.type as 'full-time' | 'part-time' | 'contract' | 'internship',
        salary: job.salary || undefined,
        description: '',
        tags: (job.tags || []).filter((tag: string) => tag === 'premium' || tag === 'new' || tag === 'urgent' || tag === 'remote') as ('premium' | 'new' | 'urgent' | 'remote')[],
        views: job.views,
        postedAt: formatDate(job.created_at),
        category: job.categories?.name || '',
        applicationUrl: '',
        applicationType: 'website' as const,
        applicationEmail: '',
        expiration_date: job.expiration_date
      }));

      if (isLoadMore) {
        let regularQuery = supabase.from('jobs').select(selectFields).eq('is_active', true).or('expiration_date.is.null,expiration_date.gt.' + new Date().toISOString()).range(currentOffset, currentOffset + JOBS_PER_PAGE - 1).order('created_at', {
          ascending: false
        });
        if (companyId) regularQuery = regularQuery.eq('company_id', companyId);
        const {
          data: regularData,
          error: regularError
        } = await regularQuery;
        if (regularError) throw regularError;
        const regularTransformed = transform(regularData);
        setJobs(prev => {
          const seen = new Set(prev.map(j => j.id));
          const filteredNew = regularTransformed.filter(j => !seen.has(j.id));
          return [...prev, ...filteredNew];
        });
        setHasMore(regularTransformed.length === JOBS_PER_PAGE);
        setOffset(currentOffset + JOBS_PER_PAGE);
      } else {
        let premiumQuery = supabase.from('jobs').select(selectFields).eq('is_active', true).or('expiration_date.is.null,expiration_date.gt.' + new Date().toISOString()).overlaps('tags', ['premium']).order('created_at', {
          ascending: false
        });
        if (companyId) premiumQuery = premiumQuery.eq('company_id', companyId);
        let regularQuery = supabase.from('jobs').select(selectFields).eq('is_active', true).or('expiration_date.is.null,expiration_date.gt.' + new Date().toISOString()).range(0, JOBS_PER_PAGE - 1).order('created_at', {
          ascending: false
        });
        if (companyId) regularQuery = regularQuery.eq('company_id', companyId);
        const [{
          data: premiumData,
          error: premiumError
        }, {
          data: regularData,
          error: regularError
        }] = await Promise.all([premiumQuery, regularQuery]);
        if (premiumError) throw premiumError;
        if (regularError) throw regularError;
        const premiumTransformed = transform(premiumData);
        const regularTransformed = transform(regularData);

        const seen = new Set<string>();
        const merged: Job[] = [];
        for (const j of [...premiumTransformed, ...regularTransformed]) {
          if (!seen.has(j.id)) {
            seen.add(j.id);
            merged.push(j);
          }
        }
        setJobs(merged);
        setHasMore(regularTransformed.length === JOBS_PER_PAGE);
        setOffset(JOBS_PER_PAGE);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [companyId, offset, jobs.length]);

  useEffect(() => {
    fetchJobs(false);
  }, [companyId]);

  useEffect(() => {
    setOffset(0);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('jobListings_scroll');
      sessionStorage.removeItem('jobListings_data');
    }
  }, [selectedCategory, companyFilter, showOnlySaved]);

  const normalizedSearchQuery = normalizeTurkish(searchQuery);
  const normalizedLocationFilter = normalizeTurkish(locationFilter);
  const filteredJobs = useMemo(() => {
    if (jobs.length === 0) return [];
    let jobsToFilter = jobs;

    if (showOnlySaved) {
      const savedJobIds = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      if (savedJobIds.length === 0) return [];
      jobsToFilter = jobs.filter(job => savedJobIds.includes(job.id));
    }

    const filtered = jobsToFilter.filter(job => {
      if (selectedCategory && job.category !== selectedCategory) return false;
      if (companyFilter && job.company_id !== companyFilter) return false;

      if (normalizedSearchQuery) {
        const normalizedTitle = normalizeTurkish(job.title);
        const normalizedCompany = normalizeTurkish(job.company);
        if (!normalizedTitle.includes(normalizedSearchQuery) && !normalizedCompany.includes(normalizedSearchQuery)) {
          return false;
        }
      }
      if (normalizedLocationFilter) {
        const normalizedLocation = normalizeTurkish(job.location);
        if (!normalizedLocation.includes(normalizedLocationFilter)) return false;
      }
      return true;
    });

    const premiumJobs: Job[] = [];
    const regularJobs: Job[] = [];
    for (const job of filtered) {
      if (job.tags?.includes('premium')) {
        premiumJobs.push(job);
      } else {
        regularJobs.push(job);
      }
    }
    return [...premiumJobs, ...regularJobs];
  }, [jobs, normalizedSearchQuery, normalizedLocationFilter, selectedCategory, companyFilter, showOnlySaved]);

  const displayedJobs = useMemo(() => {
    return filteredJobs.slice(0, displayCount);
  }, [filteredJobs, displayCount]);

  useEffect(() => {
    setDisplayCount(15);
  }, [searchQuery, locationFilter, selectedCategory, companyFilter, showOnlySaved]);

  useEffect(() => {
    const handleScroll = () => {
      let scrollTop: number;
      let scrollHeight: number;
      let clientHeight: number;

      if (scrollRef.current) {
        scrollTop = scrollRef.current.scrollTop;
        scrollHeight = scrollRef.current.scrollHeight;
        clientHeight = scrollRef.current.clientHeight;

        if (typeof window !== 'undefined') {
          sessionStorage.setItem('jobListings_scroll', scrollTop.toString());
        }
      } else {
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        scrollHeight = document.documentElement.scrollHeight;
        clientHeight = window.innerHeight;
      }

      if (scrollTop + clientHeight >= scrollHeight - 500) {
        if (displayCount < filteredJobs.length) {
          setDisplayCount(prev => Math.min(prev + 15, filteredJobs.length));
        } else if (hasMore && !loadingMore && !loading) {
          fetchJobs(true);
        }
      }
    };

    const target = scrollRef.current;
    if (target) {
      target.addEventListener('scroll', handleScroll, { passive: true });
    } else {
      window.addEventListener('scroll', handleScroll, { passive: true } as AddEventListenerOptions);
    }

    return () => {
      if (target) {
        target.removeEventListener('scroll', handleScroll);
      } else {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [hasMore, loadingMore, loading, fetchJobs, displayCount, filteredJobs.length]);

  useEffect(() => {
    if (filteredJobs.length < displayCount && hasMore && !loading && !loadingMore) {
      fetchJobs(true);
    }
  }, [filteredJobs.length, displayCount, hasMore, loading, loadingMore, fetchJobs]);

  useEffect(() => {
    if (!loading && jobs.length > 0 && scrollRef.current) {
      const savedScroll = sessionStorage.getItem('jobListings_scroll');
      if (savedScroll) {
        const scrollTop = parseInt(savedScroll, 10);
        if (!isNaN(scrollTop) && scrollTop > 0) {
          requestAnimationFrame(() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTop = scrollTop;
            }
          });
        }
      }
    }
  }, [loading, jobs.length]);

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {showHeader && (
        <div className="lg:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm"></div>
      )}

      {showHeader && !companyId && !selectedCategory}

      {showHeader && !companyId && (
        <div className="relative overflow-hidden bg-gradient-to-br from-background via-primary/8 to-accent/5 border-b border-border/30 max-h-[73px]">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-60"></div>
          <div className="relative z-10 p-2 sm:p-3">
            <div className="flex flex-row gap-2 items-center justify-center max-w-4xl mx-auto">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3 sm:w-4 sm:h-4" />
                <Input placeholder="İş axtarın..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-7 sm:pl-10 bg-background/60 backdrop-blur-sm border-border/60 focus:border-primary/60 text-xs sm:text-sm h-8 sm:h-9 w-full" />
              </div>
              <div className="relative flex-1 min-w-0">
                <MapPin className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3 sm:w-4 sm:h-4" />
                <Input placeholder="Şəhər" value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="pl-7 sm:pl-10 bg-background/60 backdrop-blur-sm border-border/60 focus:border-primary/60 text-xs sm:text-sm h-8 sm:h-9 w-full" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job List - Responsive Container */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 bg-gradient-to-b from-transparent to-primary/5 w-full mx-auto lg:min-h-[calc(100vh-200px)] lg:px-2 xl:px-3 py-0">
        <div className="flex flex-col gap-2 justify-center items-center w-full px-1.5 sm:px-2 py-[12px] lg:max-w-full mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : displayedJobs.length > 0 ? (
            displayedJobs.map((job, index) => (
              <div key={`job-${job.id}`} className="w-full">
                {/* Advertisement Banner every 6 jobs */}
                {index > 0 && index % 6 === 0 && <AdBanner position="job_listing" className="mb-2 animate-fade-in" />}
                <div className="animate-fade-in w-full" style={{ animationDelay: `${index * 20}ms` }}>
                  <JobCard job={job} isSelected={selectedJobId === job.id} onClick={() => onJobSelect(job)} isAlternate={index % 2 === 1} />
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground animate-fade-in">
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
            </div>
          )}
        </div>

        {loadingMore && (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Yüklənir...</span>
            </div>
          </div>
        )}

        {/* SEO Pagination Links - Real <a href> for Google bots */}
        {!loading && filteredJobs.length > 0 && (
          <nav aria-label="Vakansiyalar səhifələri" className="flex justify-center items-center gap-2 py-6 border-t border-border/30 mt-4">
            {/* Previous page link */}
            {displayCount > 15 && (
              <Link 
                href={`/vacancies?page=${Math.max(1, Math.floor(displayCount / 15) - 1)}`}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors rounded-md border border-border/50 hover:border-primary/30"
              >
                <ChevronLeft className="w-3 h-3" />
                <span className="hidden sm:inline">Əvvəlki</span>
              </Link>
            )}

            {/* Page number links - show up to 5 pages */}
            {(() => {
              const totalPages = Math.ceil(filteredJobs.length / 15);
              const currentPage = Math.ceil(displayCount / 15);
              const pages = [];
              const startPage = Math.max(1, currentPage - 2);
              const endPage = Math.min(totalPages, startPage + 4);

              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <Link
                    key={i}
                    href={`/vacancies?page=${i}`}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      i === currentPage
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-primary border border-border/50 hover:border-primary/30'
                    }`}
                  >
                    {i}
                  </Link>
                );
              }
              return pages;
            })()}

            {/* Next page link */}
            {displayCount < filteredJobs.length && (
              <Link
                href={`/vacancies?page=${Math.floor(displayCount / 15) + 1}`}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors rounded-md border border-border/50 hover:border-primary/30"
              >
                <span className="hidden sm:inline">Sonrakı</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  );
};

export default memo(JobListings, (prevProps, nextProps) => {
  return (
    prevProps.selectedCategory === nextProps.selectedCategory &&
    prevProps.companyFilter === nextProps.companyFilter &&
    prevProps.showOnlySaved === nextProps.showOnlySaved &&
    prevProps.companyId === nextProps.companyId
  );
});
