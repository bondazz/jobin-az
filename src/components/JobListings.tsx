import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockJobs } from '@/data/mockJobs';
import { Job } from '@/types/job';
import JobCard from './JobCard';
import { Search, MapPin } from 'lucide-react';

interface JobListingsProps {
  selectedJob: Job | null;
  onJobSelect: (job: Job) => void;
  selectedCategory?: string;
}

const JobListings = ({
  selectedJob,
  onJobSelect,
  selectedCategory
}: JobListingsProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const filteredJobs = useMemo(() => {
    const filtered = mockJobs.filter(job => {
      const matchesSearch = searchQuery === '' || job.title.toLowerCase().includes(searchQuery.toLowerCase()) || job.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation = locationFilter === '' || job.location.toLowerCase().includes(locationFilter.toLowerCase());
      const matchesCategory = !selectedCategory || job.category === selectedCategory;
      return matchesSearch && matchesLocation && matchesCategory;
    });

    // Default sorting by newest with premium jobs first
    let sortedJobs = [...filtered];
    // Separate premium and regular jobs
    const premiumJobs = sortedJobs.filter(job => job.tags.includes('premium'));
    const regularJobs = sortedJobs.filter(job => !job.tags.includes('premium'));

    // Randomize premium jobs on each render
    const shuffledPremium = [...premiumJobs].sort(() => Math.random() - 0.5);

    // Sort regular jobs by posting date (newest first)
    const sortedRegular = [...regularJobs].sort((a, b) => {
      const getDateValue = (postedAt: string) => {
        if (postedAt === 'Today') return Date.now();
        if (postedAt === 'Yesterday') return Date.now() - 86400000;
        return Date.now() - parseInt(postedAt) * 86400000;
      };
      return getDateValue(b.postedAt) - getDateValue(a.postedAt);
    });
    sortedJobs = [...shuffledPremium, ...sortedRegular];
    
    return sortedJobs.slice(0, 20);
  }, [searchQuery, locationFilter, selectedCategory]);

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

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Mobile/Tablet Sticky Header with Logo */}
      <div className="lg:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="flex justify-center items-center py-3 px-4">
          <img 
            src="/lovable-uploads/e888818f-70b8-405b-a5e8-f62f8e842525.png" 
            alt="Logo" 
            className="h-12 w-auto object-contain" 
          />
        </div>
      </div>

      {/* Compact Search Section - Max height 73px */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-primary/8 to-accent/5 border-b border-border/30 max-h-[73px]">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-60"></div>
        
        <div className="relative px-4 py-2 h-[73px] flex items-center justify-center">
          {/* Centered Search Inputs with Job Count */}
          <div className="flex items-center gap-4 w-full max-w-4xl justify-center">
            {/* Job Count Badge */}
            <div className="hidden sm:flex items-center">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30 px-3 py-1 text-sm font-medium">
                {filteredJobs.length} vakansiya
              </Badge>
            </div>

            {/* Responsive Search Inputs */}
            <div className="flex gap-3 flex-1 max-w-lg">
              <div className="relative flex-1 min-w-[160px] max-w-[240px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Axtarış..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 h-9 bg-background/80 backdrop-blur-sm border-border/50 rounded-lg text-sm w-full"
                />
              </div>
              <div className="relative flex-1 min-w-[140px] max-w-[200px]">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Yer..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-9 pr-3 py-2 h-9 bg-background/80 backdrop-blur-sm border-border/50 rounded-lg text-sm w-full"
                />
              </div>
            </div>

            {/* Mobile Job Count */}
            <div className="sm:hidden">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30 px-2 py-1 text-xs">
                {filteredJobs.length}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Job List */}
      <div className="flex-1 overflow-y-auto p-2 bg-gradient-to-b from-transparent to-primary/5">
        <div className="flex flex-col gap-2 justify-center items-center max-w-full">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job, index) => (
              <div key={`job-${job.id}`} className="w-full max-w-[620px]">
                {/* Advertisement Banner every 6 jobs */}
                {index > 0 && index % 6 === 0 && (
                  <div className="w-full h-[100px] bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl mb-2 flex items-center justify-center animate-fade-in">
                    <div className="text-center">
                      <p className="text-sm font-bold text-primary">Reklam Yeri</p>
                      <p className="text-xs text-muted-foreground">Banner Reklamı</p>
                    </div>
                  </div>
                )}
                
                <div 
                  className="animate-fade-in w-full" 
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <JobCard 
                    job={job} 
                    isSelected={selectedJob?.id === job.id} 
                    onClick={() => onJobSelect(job)} 
                    isAlternate={index % 2 === 1} 
                  />
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
              <Button 
                variant="outline" 
                className="mt-2 px-4 py-2.5 rounded-lg border-primary/30 text-primary hover:bg-primary hover:text-white transition-all duration-300 hover:shadow-lg font-medium text-sm"
                onClick={() => {
                  setSearchQuery('');
                  setLocationFilter('');
                }}
              >
                Süzgəcləri təmizlə
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobListings;
