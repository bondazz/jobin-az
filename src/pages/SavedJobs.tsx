import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bookmark, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import JobListings from '@/components/JobListings';
import JobDetails from '@/components/JobDetails';
import { Job } from '@/types/job';
import { mockJobs } from '@/data/mockJobs';
import { generatePageSEO, generateJobSEO, updatePageMeta } from '@/utils/seo';
import BottomNavigation from '@/components/BottomNavigation';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const { jobId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const seoData = generatePageSEO('favorites');
    updatePageMeta(seoData);
  }, []);

  useEffect(() => {
    const updateSavedJobs = () => {
      const savedJobIds = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      const jobs = mockJobs.filter(job => savedJobIds.includes(job.id));
      setSavedJobs(jobs);
      
      // Auto-select job from URL
      if (jobId && jobs.length > 0) {
        const foundJob = jobs.find(job => job.id === jobId);
        if (foundJob) {
          setSelectedJob(foundJob);
        }
      }
    };
    
    updateSavedJobs();
    
    // Listen for storage changes (when jobs are saved/unsaved)
    const handleStorageChange = () => updateSavedJobs();
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-page storage updates
    const handleCustomStorageChange = () => updateSavedJobs();
    window.addEventListener('localStorageUpdate', handleCustomStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdate', handleCustomStorageChange);
    };
  }, [jobId]);

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    navigate(`/favorites/${job.id}`);
    
    // Update SEO for selected job
    const jobSEO = generateJobSEO(job.title, job.company, job.category);
    updatePageMeta(jobSEO);
  };

  const handleJobUnsave = (jobId: string) => {
    const savedJobIds = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    const updatedSavedJobIds = savedJobIds.filter((id: string) => id !== jobId);
    localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobIds));
    
    // Dispatch custom event to update the counter
    window.dispatchEvent(new Event('localStorageUpdate'));
    
    // If the unsaved job was selected, clear selection
    if (selectedJob?.id === jobId) {
      setSelectedJob(null);
      navigate('/favorites');
    }
  };

  return (
    <div className="h-full flex bg-gradient-to-br from-background via-primary/3 to-background overflow-hidden">
      <div className="flex-1 flex min-w-0 pb-16 xl:pb-0">
        {/* Saved Jobs List */}
        <div className="w-full lg:w-[400px] xl:w-[450px] border-r border-border animate-fade-in">
          <div className="flex-1 flex flex-col h-full bg-background">
            {/* Mobile/Tablet Sticky Header with Logo */}
            <div className="lg:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
              <div className="flex justify-center items-center py-3 px-4">
                <img src="/lovable-uploads/e888818f-70b8-405b-a5e8-f62f8e842525.png" alt="Logo" className="h-12 w-auto object-contain" />
              </div>
            </div>

            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-background via-primary/8 to-accent/5 border-b border-border/30 max-h-[73px]">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-60"></div>
              
              <div className="relative px-4 py-2 h-[73px] flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                    <Bookmark className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="text-lg font-bold text-foreground">Seçilmiş Elanlar</h1>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    {savedJobs.length}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Saved Jobs Content */}
            {savedJobs.length > 0 ? (
              <div className="flex-1 overflow-y-auto p-2 bg-gradient-to-b from-transparent to-primary/5">
                <div className="flex flex-col gap-2 w-full max-w-full px-2">
                  {savedJobs.map((job, index) => (
                    <div
                      key={job.id}
                      onClick={() => handleJobSelect(job)}
                      className={`group cursor-pointer p-3 rounded-lg border transition-all duration-200 ease-smooth
                        hover:shadow-card-hover hover:-translate-y-0.5 animate-fade-in
                        w-full max-w-full min-w-0 h-[80px] flex flex-row items-center justify-between backdrop-blur-sm relative
                        ${selectedJob?.id === job.id 
                          ? 'border-primary bg-gradient-to-r from-primary/20 to-primary/5 shadow-elegant ring-1 ring-primary/50'
                          : job.tags.includes('premium') 
                            ? 'bg-job-card-premium border-job-tag-premium/40 hover:border-job-tag-premium/60 hover:shadow-premium'
                            : 'bg-job-card border-border/50 hover:border-primary/40 hover:shadow-card-hover'
                        }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Premium badge */}
                      {job.tags.includes('premium') && (
                        <div className="absolute -top-px right-[3px] z-10">
                          <Badge variant="premium" className="text-[7px] rounded-sm font-bold py-px px-[10px]">
                            Premium
                          </Badge>
                        </div>
                      )}

                      {/* Left Section - Company & Job Info */}
                      <div className="flex items-center gap-2 flex-1 min-w-0 relative z-10">
                        <div className="relative flex-shrink-0">
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center text-white font-bold text-xs shadow-sm ${job.tags.includes('premium') ? 'bg-gradient-premium' : 'bg-gradient-primary'}`}>
                            {job.company.charAt(0)}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors duration-200 truncate">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-0">
                            <div className="flex items-center gap-1">
                              <p className="text-muted-foreground text-xs font-medium truncate">{job.company}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-muted-foreground">{job.postedAt}</span>
                            <span className="text-[10px] text-primary font-medium">{job.salary}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Heart Icon */}
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 relative z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJobUnsave(job.id);
                          }}
                          className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors duration-200 group"
                        >
                          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bookmark className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Heç bir elan seçilməyib</h2>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    İş elanlarını seçmək üçün ürək ikonuna klikləyin
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Job Details */}
        <div className="hidden lg:block flex-1 bg-gradient-to-br from-job-details to-primary/3 animate-slide-in-right">
          {selectedJob ? (
            <div className="h-full overflow-y-auto">
              <JobDetails job={selectedJob} />
            </div>
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
          <JobDetails job={selectedJob} />
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