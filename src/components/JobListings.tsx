
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockJobs } from '@/data/mockJobs';
import { Job } from '@/types/job';
import JobCard from './JobCard';
import { Search, Filter, MapPin } from 'lucide-react';

interface JobListingsProps {
  selectedJob: Job | null;
  onJobSelect: (job: Job) => void;
  selectedCategory?: string;
}

const JobListings = ({ selectedJob, onJobSelect, selectedCategory }: JobListingsProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const filteredJobs = useMemo(() => {
    return mockJobs.filter((job) => {
      const matchesSearch = searchQuery === '' || 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLocation = locationFilter === '' ||
        job.location.toLowerCase().includes(locationFilter.toLowerCase());
      
      const matchesCategory = !selectedCategory || 
        job.category === selectedCategory;

      return matchesSearch && matchesLocation && matchesCategory;
    });
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
      {/* Search Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-background to-primary/5 backdrop-blur-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <h2 className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                {selectedCategory ? `${getCategoryLabel(selectedCategory)} İşləri` : 'Bütün İşlər'}
              </h2>
              <div className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-gradient-primary rounded-full"></div>
            </div>
            <Badge 
              variant="secondary" 
              className="px-3 py-1.5 text-xs font-bold bg-primary/10 text-primary border border-primary/20 animate-bounce-in"
            >
              {filteredJobs.length}
            </Badge>
          </div>
          
          <div className="flex gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
              <Input
                placeholder="İş, şirkət axtarın..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-3 py-2.5 bg-background/80 backdrop-blur-sm border-border/50 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 text-sm"
              />
            </div>
            <div className="relative group">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
              <Input
                placeholder="Məkan"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-10 pr-3 py-2.5 w-40 bg-background/80 backdrop-blur-sm border-border/50 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 text-sm"
              />
            </div>
            <Button 
              variant="outline" 
              className="px-4 py-2.5 rounded-lg border-primary/30 text-primary hover:bg-primary hover:text-white transition-all duration-300 hover:shadow-lg font-medium text-sm"
            >
              <Filter className="w-4 h-4 mr-1.5" />
              Süzgəc
            </Button>
          </div>
        </div>
      </div>

      {/* Job List */}
      <div className="flex-1 overflow-y-auto p-2 bg-gradient-to-b from-transparent to-primary/5">
        <div className="flex flex-col gap-2 justify-center items-center">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job, index) => (
              <div 
                key={job.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <JobCard
                  job={job}
                  isSelected={selectedJob?.id === job.id}
                  onClick={() => onJobSelect(job)}
                  isAlternate={index % 2 === 1}
                />
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
