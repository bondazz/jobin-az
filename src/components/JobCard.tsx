
import { Job } from '@/types/job';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart } from 'lucide-react';
import VerifyBadge from '@/components/ui/verify-badge';
import { useState, useEffect } from 'react';

interface JobCardProps {
  job: Job;
  isSelected?: boolean;
  onClick: () => void;
  isAlternate?: boolean;
}

const JobCard = ({
  job,
  isSelected,
  onClick,
  isAlternate
}: JobCardProps) => {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    setIsSaved(savedJobs.includes(job.id));
  }, [job.id]);

  const isVerifiedCompany = (company: string) => {
    const verifiedCompanies = ['Google', 'Apple', 'Microsoft', 'Meta', 'Amazon', 'Netflix', 'Tesla', 'Spotify'];
    return verifiedCompanies.includes(company);
  };

  // Filter to only show premium tags
  const premiumTags = job.tags.filter(tag => tag === 'premium');

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    if (isSaved) {
      const updatedSaved = savedJobs.filter((id: string) => id !== job.id);
      localStorage.setItem('savedJobs', JSON.stringify(updatedSaved));
      setIsSaved(false);
    } else {
      savedJobs.push(job.id);
      localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
      setIsSaved(true);
    }
  };

  return <div onClick={onClick} className={`
        group cursor-pointer p-2 rounded-lg border transition-all duration-200 ease-smooth
        hover:shadow-card-hover hover:-translate-y-0.5 animate-fade-in
        w-[600px] min-w-[610px] h-[45px] flex flex-row items-center justify-between backdrop-blur-sm relative
        ${isSelected ? 'border-primary bg-gradient-to-r from-primary/20 to-primary/5 shadow-elegant ring-1 ring-primary/50' : job.tags.includes('premium') ? 'bg-job-card-premium border-job-tag-premium/40 hover:border-job-tag-premium/60 hover:shadow-premium relative overflow-hidden' : isAlternate ? 'bg-job-card-alt border-border/50 hover:border-primary/40 hover:shadow-card-hover' : 'bg-job-card border-border/50 hover:border-primary/40 hover:shadow-card-hover'}
      `}>
      
      {/* Premium badge - positioned at top border */}
      {premiumTags.length > 0 && <div className="absolute -top-px right-[3px] z-10">
          <Badge variant="premium" className="text-[7px] rounded-sm font-bold py-px px-[10px] mx-[64px] my-[32px]">
            Premium
          </Badge>
        </div>}

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
              {isVerifiedCompany(job.company) && <VerifyBadge size={10} className="ml-0.5" />}
            </div>
            <span className="text-muted-foreground text-xs truncate">{job.location}</span>
          </div>
        </div>
      </div>

      {/* Right Section - Single Row with all elements separated by | */}
      <div className="flex items-center gap-2 flex-shrink-0 relative z-10 text-xs text-muted-foreground">
        {/* Salary (if exists) */}
        {job.salary && (
          <>
            <span className="font-bold text-orange-500">₼</span>
            <span className="text-muted-foreground">|</span>
          </>
        )}
        
        {/* Posted Date */}
        <span>{job.postedAt}</span>
        <span className="text-muted-foreground">|</span>
        
        {/* Views with Eye Icon */}
        <div className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          <span>{job.views}</span>
        </div>
        <span className="text-muted-foreground">|</span>
        
        {/* Save Button with Heart Icon */}
        <button onClick={handleSaveClick} className={`p-0.5 rounded-sm transition-all duration-200 hover:scale-110 ${isSaved ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-primary'}`}>
          <Heart className={`w-3 h-3 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>;
};

export default JobCard;
