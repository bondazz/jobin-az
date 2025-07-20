import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types/job';
import JobCard from './JobCard';
import AdBanner from './AdBanner';
import { Search, MapPin } from 'lucide-react';
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

  // Fetch jobs from database
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        let query = supabase.from('jobs').select(`
            *,
            companies (name, logo, is_verified),
            categories (name)
          `).eq('is_active', true);

        // Filter by company if companyId is provided
        if (companyId) {
          query = query.eq('company_id', companyId);
        }
        const {
          data,
          error
        } = await query.order('created_at', {
          ascending: false
        });
        if (error) throw error;

        // Transform data to match Job interface
        const transformedJobs = data?.map(job => ({
          id: job.id,
          title: job.title,
          company: job.companies?.name || '',
          company_id: job.company_id,
          companyLogo: job.companies?.logo,
          location: job.location,
          type: job.type as 'full-time' | 'part-time' | 'contract' | 'internship',
          salary: job.salary,
          description: job.description,
          tags: (job.tags || []).filter((tag: string) => ['premium', 'new', 'urgent', 'remote'].includes(tag)) as ('premium' | 'new' | 'urgent' | 'remote')[],
          views: job.views,
          postedAt: formatDate(job.created_at),
          category: job.categories?.name || '',
          applicationUrl: job.application_url,
          applicationType: job.application_type as 'website' | 'email',
          applicationEmail: job.application_email
        })) || [];
        setJobs(transformedJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
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
  const filteredJobs = useMemo(() => {
    let jobsToFilter = jobs;

    // If showing only saved jobs, filter by saved job IDs first
    if (showOnlySaved) {
      const savedJobIds = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      jobsToFilter = jobs.filter(job => savedJobIds.includes(job.id));
    }
    const filtered = jobsToFilter.filter(job => {
      const matchesSearch = searchQuery === '' || job.title.toLowerCase().includes(searchQuery.toLowerCase()) || job.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation = locationFilter === '' || job.location.toLowerCase().includes(locationFilter.toLowerCase());
      const matchesCategory = !selectedCategory || job.category === selectedCategory;
      const matchesCompany = !companyFilter || job.company_id === companyFilter;
      return matchesSearch && matchesLocation && matchesCategory && matchesCompany;
    });

    // Default sorting by newest with premium jobs first
    let sortedJobs = [...filtered];
    // Separate premium and regular jobs
    const premiumJobs = sortedJobs.filter(job => job.tags?.includes('premium'));
    const regularJobs = sortedJobs.filter(job => !job.tags?.includes('premium'));

    // Randomize premium jobs on each render
    const shuffledPremium = [...premiumJobs].sort(() => Math.random() - 0.5);

    // Sort regular jobs by posting date (newest first)
    const sortedRegular = [...regularJobs].sort((a, b) => {
      const getDateValue = (postedAt: string) => {
        if (postedAt === 'Today') return Date.now();
        if (postedAt === 'Yesterday') return Date.now() - 86400000;
        const match = postedAt.match(/(\d+) (days?|weeks?|months?) ago/);
        if (match) {
          const [, num, unit] = match;
          const multiplier = unit.includes('day') ? 1 : unit.includes('week') ? 7 : 30;
          return Date.now() - parseInt(num) * multiplier * 86400000;
        }
        return Date.now() - parseInt(postedAt) * 86400000;
      };
      return getDateValue(b.postedAt) - getDateValue(a.postedAt);
    });
    sortedJobs = [...shuffledPremium, ...sortedRegular];
    return sortedJobs.slice(0, 20);
  }, [jobs, searchQuery, locationFilter, selectedCategory, companyFilter, showOnlySaved]);
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
          
          <div className="relative z-10 p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center justify-center max-w-3xl mx-auto">
              {/* Job Search Input */}
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="İş axtarın..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/60 backdrop-blur-sm border-border/60 focus:border-primary/60 text-sm h-9 sm:h-10 w-full"
                />
              </div>
              
              {/* Location Filter */}
              <div className="relative flex-1 w-full sm:max-w-xs">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Şəhər"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10 bg-background/60 backdrop-blur-sm border-border/60 focus:border-primary/60 text-sm h-9 sm:h-10 w-full"
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
            animationDelay: `${index * 50}ms`
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
      </div>
    </div>;
};
export default JobListings;