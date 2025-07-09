
import { useState } from 'react';
import { Job } from '@/types/job';
import JobListings from '@/components/JobListings';
import JobDetails from '@/components/JobDetails';
import MobileMenu from '@/components/MobileMenu';

const Index = () => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    setSelectedJob(null);
  };

  return (
    <div className="h-full flex bg-gradient-to-br from-background via-primary/3 to-background overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-3">
          <MobileMenu 
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/e888818f-70b8-405b-a5e8-f62f8e842525.png" 
              alt="Jooble"
              className="w-8 h-8 object-contain dark:invert transition-all duration-300"
            />
            <h1 className="font-bold text-lg text-foreground">Jooble</h1>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-w-0 pt-16 lg:pt-0">
        {/* Job Listings - Responsive Column */}
        <div className="w-full lg:w-[650px] xl:w-[680px] border-r border-border animate-fade-in">
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
    </div>
  );
};

export default Index;
