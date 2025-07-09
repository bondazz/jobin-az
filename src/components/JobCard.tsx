
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

  return (
    <div 
      onClick={onClick} 
      className={`
        group cursor-pointer p-3 rounded-xl border transition-all duration-300 ease-smooth
        hover:shadow-card-hover hover:-translate-y-0.5 hover:scale-[1.01] animate-fade-in
        w-full max-w-[620px] h-[65px] flex flex-row items-center justify-between backdrop-blur-sm relative
        ${isSelected ? 'border-primary bg-gradient-to-r from-primary/15 to-primary/5 shadow-elegant ring-2 ring-primary/40' : 
          job.tags.includes('premium') ? 'bg-gradient-to-r from-job-tag-premium/10 to-transparent border-job-tag-premium/30 hover:border-job-tag-premium/50 hover:shadow-premium relative overflow-hidden' : 
          isAlternate ? 'bg-gradient-surface border-border/60 hover:border-primary/50 hover:shadow-card-hover' : 
          'bg-card border-border/60 hover:border-primary/50 hover:shadow-card-hover'}
      `}
    >
      
      {/* Premium PRO Badge in Top Right Corner */}
      {premiumTags.length > 0 && (
        <div className="absolute -top-1 -right-1 z-10">
          <Badge variant="premium" className="text-[8px] py-0.5 px-1.5 rounded-md font-bold">
            PRO
          </Badge>
        </div>
      )}

      {/* Left Section - Company & Job Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0 relative z-10">
        <div className="relative flex-shrink-0">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md ${job.tags.includes('premium') ? 'bg-gradient-premium' : 'bg-gradient-primary'}`}>
            {job.company.charAt(0)}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors duration-300 truncate">
            {job.title}
          </h3>
          <div className="flex items-center gap-3 mt-0.5">
            <div className="flex items-center gap-1">
              <p className="text-muted-foreground text-xs font-medium truncate">{job.company}</p>
              {isVerifiedCompany(job.company) && <VerifyBadge size={12} className="ml-1" />}
            </div>
            <span className="text-muted-foreground text-xs truncate">{job.location}</span>
          </div>
        </div>
      </div>

      {/* Right Section - Stats & Save */}
      <div className="flex items-center gap-2 flex-shrink-0 relative z-10">
        <div className="flex flex-col items-end gap-0.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="text-success text-xs font-bold">₼</span>
            <span>|</span>
            <span>{job.postedAt}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{job.views}</span>
            </div>
            <button
              onClick={handleSaveClick}
              className={`p-1 rounded-md transition-all duration-300 hover:scale-110 ${
                isSaved 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
