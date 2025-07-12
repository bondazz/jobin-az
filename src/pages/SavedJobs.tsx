import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import JobListings from '@/components/JobListings';
import JobDetails from '@/components/JobDetails';
import { Job } from '@/types/job';
import { generatePageSEO, updatePageMeta } from '@/utils/seo';
import BottomNavigation from '@/components/BottomNavigation';

const SavedJobs = () => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const { jobId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const seoData = generatePageSEO('favorites');
    updatePageMeta(seoData);
  }, []);

  useEffect(() => {
    if (jobId) {
      setSelectedJob({ id: jobId } as Job);
    }
  }, [jobId]);

  const handleJobSelect = async (job: Job) => {
    setSelectedJob(job);
    navigate(`/favorites/${job.id}`);
  };

  return (
    <div className="h-full flex bg-background overflow-hidden">
      <div className="flex-1 flex min-w-0 pb-16 xl:pb-0">
        {/* Mobile/Tablet Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-40 p-4">
          <div className="flex items-center justify-center">
            <button
              onClick={() => navigate('/')}
              className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent"
            >
              JobBoard
            </button>
          </div>
        </div>

        {/* Saved Jobs List */}
        <div className="w-full lg:w-[400px] xl:w-[450px] border-r border-border animate-fade-in pt-16 lg:pt-0">
          <div className="lg:hidden p-4 border-b border-border">
            <div className="relative">
              <input
                type="text"
                placeholder="Elanları axtar..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                🔍
              </div>
            </div>
          </div>
          <JobListings
            selectedJob={selectedJob}
            onJobSelect={handleJobSelect}
            showOnlySaved={true}
            showHeader={false}
          />
        </div>

        {/* Right Section - Job Details */}
        <div className="hidden lg:block flex-1 bg-background animate-slide-in-right">
          {selectedJob ? (
            <JobDetails jobId={selectedJob.id} />
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bookmark className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Elan Seçin</h2>
                <p className="text-muted-foreground text-sm max-w-sm">
                  Sol tərəfdən bir elan seçin və ətraflı məlumat alın
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Job Details Modal */}
      {selectedJob && (
        <div className="lg:hidden fixed inset-0 bg-background z-50 overflow-y-auto animate-slide-in-right">
          {/* Mobile Header */}
          <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between shadow-sm z-10">
            <button
              onClick={() => navigate('/')}
              className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent"
            >
              JobBoard
            </button>
            <button
              onClick={() => {
                setSelectedJob(null);
                navigate('/favorites');
              }}
              className="w-8 h-8 rounded-lg bg-muted/50 hover:bg-destructive/20 hover:text-destructive text-muted-foreground transition-all duration-300 flex items-center justify-center text-lg font-bold"
            >
              ×
            </button>
          </div>
          <div className="pb-20">
            <JobDetails jobId={selectedJob.id} isMobile={true} />
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation 
        selectedCategory=""
        onCategorySelect={() => {}}
      />
    </div>
  );
};

export default SavedJobs;