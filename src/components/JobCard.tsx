import { Job } from '@/types/job';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart } from 'lucide-react';
import VerifyBadge from '@/components/ui/verify-badge';
import { useState, useEffect, useCallback, memo } from 'react';
import { LazyImage } from '@/components/ui/lazy-image';
import { useReferralCode } from '@/hooks/useReferralCode';

interface JobCardProps {
  job: Job;
  isSelected?: boolean;
  onClick: () => void;
  isAlternate?: boolean;
  companyData?: {
    name: string;
    logo?: string;
    is_verified: boolean;
  };
}

const JobCard = memo(({
  job,
  isSelected,
  onClick,
  isAlternate,
  companyData
}: JobCardProps) => {
  const [isSaved, setIsSaved] = useState(false);
  const { getUrlWithReferral } = useReferralCode();
  
  useEffect(() => {
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    setIsSaved(savedJobs.includes(job.id));
  }, [job.id]);

  const handleSaveToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    let updatedSavedJobs;
    
    if (isSaved) {
      // Remove from saved
      updatedSavedJobs = savedJobs.filter((id: string) => id !== job.id);
    } else {
      // Add to saved
      updatedSavedJobs = [...savedJobs, job.id];
    }
    
    localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
    setIsSaved(!isSaved);
    
    // Dispatch storage event to update sidebar count
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'savedJobs',
      newValue: JSON.stringify(updatedSavedJobs)
    }));
  }, [isSaved, job.id]);


  // Filter to only show premium tags
  const premiumTags = job.tags.filter(tag => tag === 'premium');
  return <div onClick={onClick} className={`
        group cursor-pointer p-2.5 sm:p-3 rounded-lg border transition-all duration-200 ease-smooth relative z-0
        hover:shadow-card-hover hover:-translate-y-0.5 hover:z-[5] animate-fade-in
        w-full min-h-[60px] flex flex-row items-center justify-between backdrop-blur-sm
        ${isSelected ? 'border-primary bg-gradient-to-r from-primary/20 to-primary/5 shadow-elegant ring-1 ring-primary/50 z-[5]' : job.tags.includes('premium') ? 'bg-job-card-premium border-job-tag-premium/40 hover:border-job-tag-premium/60 hover:shadow-premium overflow-hidden' : isAlternate ? 'bg-job-card-alt border-border/50 hover:border-primary/40 hover:shadow-card-hover' : 'bg-job-card border-border/50 hover:border-primary/40 hover:shadow-card-hover'}
      `}>
      
      {/* Premium badge - positioned at top border */}
      {premiumTags.length > 0 && <div className="absolute -top-px right-[3px] z-10">
          <Badge variant="premium" className="text-[7px] rounded-sm font-bold px-[13px] py-0 mx-[26px] my-[48px]">
            Premium
          </Badge>
        </div>}

      {/* Left Section - Company & Job Info */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0 relative z-10">
        <div className="relative flex-shrink-0">
          {job.companyLogo ? (
            <LazyImage 
              src={job.companyLogo} 
              alt={job.company} 
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-md object-cover"
              fallback={
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center text-white font-bold text-xs shadow-sm ${job.tags?.includes('premium') ? 'bg-gradient-premium' : 'bg-gradient-primary'}`}>
                  {(job.company || job.title).charAt(0)}
                </div>
              }
            />
          ) : (
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center text-white font-bold text-xs shadow-sm ${job.tags?.includes('premium') ? 'bg-gradient-premium' : 'bg-gradient-primary'}`}>
              {(job.company || job.title).charAt(0)}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0 overflow-hidden">
          <h3 className="font-semibold text-[11px] sm:text-xs text-foreground group-hover:text-primary transition-colors duration-200 truncate leading-tight">
            {job.title}
          </h3>
          <div className="flex items-center gap-1 sm:gap-2 mt-0.5">
            <div className="flex items-center gap-0.5 sm:gap-1 min-w-0">
              <p className="text-muted-foreground text-[10px] sm:text-xs font-medium truncate">
                {job.company || 'Şirkət'}
              </p>
              {job.isVerified && <VerifyBadge size={10} className="ml-0.5 flex-shrink-0" />}
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Single Row with all elements separated by | */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 relative z-10 text-xs text-muted-foreground">
        {/* Salary (if exists) */}
        {job.salary && <>
            <span className="font-bold text-orange-500 hidden sm:inline">₼</span>
            <span className="text-muted-foreground hidden sm:inline">|</span>
          </>}
        
        {/* Posted Date */}
        <span className="text-[10px] sm:text-xs">{job.postedAt}</span>
        <span className="text-muted-foreground hidden sm:inline">|</span>
        
        {/* Views with Eye Icon */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <Eye className="w-3 h-3" />
          <span className="text-[10px] sm:text-xs">{job.views}</span>
        </div>
        <span className="text-muted-foreground hidden sm:inline">|</span>
        
        {/* Save Button with Heart Icon */}
        <button onClick={handleSaveToggle} className={`p-0.5 rounded-sm transition-all duration-200 hover:scale-110 ${isSaved ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-primary'}`}>
          <Heart className={`w-3 h-3 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>;
});

export default JobCard;