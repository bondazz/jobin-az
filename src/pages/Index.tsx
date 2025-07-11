
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Job } from '@/types/job';
import { mockCategories } from '@/data/mockJobs';
import JobListings from '@/components/JobListings';
import JobDetails from '@/components/JobDetails';
import MobileMenu from '@/components/MobileMenu';
import BottomNavigation from '@/components/BottomNavigation';

const Index = () => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchParams, setSearchParams] = useSearchParams();

  // Check for category filter from URL
  useEffect(() => {
    const categorySlug = searchParams.get('category');
    if (categorySlug) {
      const category = mockCategories.find(c => c.slug === categorySlug);
      if (category) {
        setSelectedCategory(category.name);
      }
    }
  }, [searchParams]);

  const handleJobSelect = (job: Job) => {
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
          <JobDetails job={selectedJob} />
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
          <JobDetails job={selectedJob} />
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
