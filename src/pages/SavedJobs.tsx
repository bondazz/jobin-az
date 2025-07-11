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
    <div className="h-full flex bg-gradient-to-br from-background via-primary/3 to-background overflow-hidden">
      <div className="flex-1 flex min-w-0 pb-16 xl:pb-0">
        {/* Saved Jobs List */}
        <div className="w-full lg:w-[400px] xl:w-[450px] border-r border-border animate-fade-in">
          <JobListings
            selectedJob={selectedJob}
            onJobSelect={handleJobSelect}
            showOnlySaved={true}
            showHeader={false}
          />
        </div>

        {/* Right Section - Job Details */}
        <div className="hidden lg:block flex-1 bg-gradient-to-br from-job-details to-primary/3 animate-slide-in-right">
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
          <div className="sticky top-0 bg-gradient-to-r from-background to-primary/8 border-b border-border p-4 flex items-center justify-between shadow-sm">
            <h2 className="font-bold text-lg text-foreground">İş Təfərrüatları</h2>
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
          <JobDetails jobId={selectedJob.id} />
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