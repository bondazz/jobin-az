import { Job } from '@/types/job';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart } from 'lucide-react';
import VerifyBadge from '@/components/ui/verify-badge';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
interface JobCardProps {
  job: Job;
  isSelected?: boolean;
  onClick: () => void;
  isAlternate?: boolean;
}

type Company = Tables<'companies'>;
const JobCard = ({
  job,
  isSelected,
  onClick,
  isAlternate
}: JobCardProps) => {
  const [isSaved, setIsSaved] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  
  useEffect(() => {
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    setIsSaved(savedJobs.includes(job.id));
    
    // Fetch company data if job has company_id
    if (job.company_id) {
      fetchCompany();
    }
  }, [job.id, job.company_id]);

  const handleSaveToggle = (e: React.MouseEvent) => {
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
  };

  const fetchCompany = async () => {
    if (!job.company_id) return;
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', job.company_id)
        .single();

      if (error) throw error;
      setCompany(data);
    } catch (error) {
      console.error('Error fetching company:', error);
    }
  };

  // Filter to only show premium tags
  const premiumTags = job.tags.filter(tag => tag === 'premium');
  return <div onClick={onClick} className={`
        group cursor-pointer p-3 rounded-lg border transition-all duration-200 ease-smooth
        hover:shadow-card-hover hover:-translate-y-0.5 animate-fade-in
        w-full max-w-full min-w-0 h-[60px] flex flex-row items-center justify-between backdrop-blur-sm relative
        ${isSelected ? 'border-primary bg-gradient-to-r from-primary/20 to-primary/5 shadow-elegant ring-1 ring-primary/50' : job.tags.includes('premium') ? 'bg-job-card-premium border-job-tag-premium/40 hover:border-job-tag-premium/60 hover:shadow-premium relative overflow-hidden' : isAlternate ? 'bg-job-card-alt border-border/50 hover:border-primary/40 hover:shadow-card-hover' : 'bg-job-card border-border/50 hover:border-primary/40 hover:shadow-card-hover'}
      `}>
      
      {/* Premium badge - positioned at top border */}
      {premiumTags.length > 0 && <div className="absolute -top-px right-[3px] z-10">
          <Badge variant="premium" className="text-[7px] rounded-sm font-bold px-[13px] py-0 mx-[26px] my-[48px]">
            Premium
          </Badge>
        </div>}

      {/* Left Section - Company & Job Info */}
      <div className="flex items-center gap-2 flex-1 min-w-0 relative z-10">
        <div className="relative flex-shrink-0">
          {company?.logo ? (
            <img src={company.logo} alt={company.name} className="w-8 h-8 rounded-md object-cover" />
          ) : (
            <div className={`w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-xs shadow-sm ${job.tags?.includes('premium') ? 'bg-gradient-premium' : 'bg-gradient-primary'}`}>
              {(company?.name || job.title).charAt(0)}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors duration-200 truncate">
            {job.title}
          </h3>
          <div className="flex items-center gap-2 mt-0">
            <div className="flex items-center gap-1">
              <p className="text-muted-foreground text-xs font-medium truncate">
                {company?.name || 'Şirkət'}
              </p>
              {company?.is_verified && <VerifyBadge size={12} className="ml-0.5" />}
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
};
export default JobCard;