import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockJobs } from '@/data/mockJobs';
import { Job } from '@/types/job';
import JobCard from './JobCard';
import { Search, MapPin, TrendingUp, Calendar } from 'lucide-react';

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
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'premium'>('newest');

  const filteredJobs = useMemo(() => {
    const filtered = mockJobs.filter(job => {
      const matchesSearch = searchQuery === '' || job.title.toLowerCase().includes(searchQuery.toLowerCase()) || job.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation = locationFilter === '' || job.location.toLowerCase().includes(locationFilter.toLowerCase());
      const matchesCategory = !selectedCategory || job.category === selectedCategory;
      return matchesSearch && matchesLocation && matchesCategory;
    });

    // Separate premium and regular jobs
    const premiumJobs = filtered.filter(job => job.tags.includes('premium'));
    const regularJobs = filtered.filter(job => !job.tags.includes('premium'));

    // Randomize premium jobs on each render
    const shuffledPremium = [...premiumJobs].sort(() => Math.random() - 0.5);

    // Sort regular jobs by posting date (newest first)
    const sortedRegular = [...regularJobs].sort((a, b) => {
      const dateA = new Date(a.postedAt === 'Today' ? Date.now() : a.postedAt === 'Yesterday' ? Date.now() - 86400000 : Date.now() - parseInt(a.postedAt) * 86400000);
      const dateB = new Date(b.postedAt === 'Today' ? Date.now() : b.postedAt === 'Yesterday' ? Date.now() - 86400000 : Date.now() - parseInt(b.postedAt) * 86400000);
      return dateB.getTime() - dateA.getTime();
    });

    // Combine: premium first, then regular
    return [...shuffledPremium, ...sortedRegular].slice(0, 20);
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

  // Daily and monthly job statistics
  const dailyJobCount = 127;
  const monthlyJobCount = 3420;

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

      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-primary/8 to-accent/5 border-b border-border/30">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-60"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-48 bg-primary/10 rounded-full blur-3xl opacity-30"></div>
        
        <div className="relative p-6 lg:p-8">
          {/* Main Header Button */}
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-gradient-to-r from-background to-primary/10 backdrop-blur-sm border border-primary/20 rounded-2xl px-8 py-4 shadow-elegant hover:shadow-glow transition-all duration-300">
                <h1 className="text-xl lg:text-2xl font-bold text-primary text-center tracking-wide">
                  Vakansiyaların Sayı
                </h1>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-gradient-to-br from-background/90 to-primary/5 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-all duration-300 min-w-[160px]">
                <div className="flex items-center justify-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{dailyJobCount}</div>
                    <div className="text-sm text-muted-foreground font-medium">Günlük Yeni</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 to-primary/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-gradient-to-br from-background/90 to-accent/5 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-all duration-300 min-w-[160px]">
                <div className="flex items-center justify-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Calendar className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{monthlyJobCount}</div>
                    <div className="text-sm text-muted-foreground font-medium">Aylıq İlan</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sorting Buttons */}
          <div className="flex justify-center mb-6">
            <div className="flex bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl p-1 shadow-sm">
              {[
                { key: 'newest', label: 'Ən yeni' },
                { key: 'popular', label: 'Populyar' },
                { key: 'premium', label: 'Premium' }
              ].map((sort) => (
                <button
                  key={sort.key}
                  onClick={() => setSortBy(sort.key as 'newest' | 'popular' | 'premium')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    sortBy === sort.key
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {sort.label}
                </button>
              ))}
            </div>
          </div>

          {/* Compact Search Section */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
              <Input 
                placeholder="İş, şirkət axtarın..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-background/80 backdrop-blur-sm border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 text-sm shadow-sm"
              />
            </div>
            <div className="relative group sm:w-48">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
              <Input 
                placeholder="Məkan" 
                value={locationFilter} 
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-background/80 backdrop-blur-sm border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 text-sm shadow-sm"
              />
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
                
                <div className="animate-fade-in w-full" style={{ animationDelay: `${index * 50}ms` }}>
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
