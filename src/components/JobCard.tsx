
import { Job } from '@/types/job';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import VerifyBadge from '@/components/ui/verify-badge';
import PremiumIcon from '@/components/ui/premium-icon';

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
  const isVerifiedCompany = (company: string) => {
    const verifiedCompanies = ['Google', 'Apple', 'Microsoft', 'Meta', 'Amazon', 'Netflix', 'Tesla', 'Spotify'];
    return verifiedCompanies.includes(company);
  };

  // Convert salary from $ to AZN (assuming 1 USD = 1.7 AZN)
  const convertSalaryToAZN = (salary?: string) => {
    if (!salary) return null;
    return salary.replace(/\$(\d+)/g, (match, amount) => {
      const aznAmount = Math.round(parseFloat(amount) * 1.7);
      return `${aznAmount} ₼`;
    });
  };

  // Filter to only show premium tags
  const premiumTags = job.tags.filter(tag => tag === 'premium');

  return <div onClick={onClick} className={`
        group cursor-pointer p-4 rounded-xl border transition-all duration-300 ease-smooth
        hover:shadow-card-hover hover:-translate-y-1 hover:scale-[1.02] animate-fade-in
        w-[620px] h-[70px] flex flex-row items-center justify-between backdrop-blur-sm
        ${isSelected ? 'border-primary bg-gradient-to-r from-primary/15 to-primary/5 shadow-elegant ring-2 ring-primary/40' : job.tags.includes('premium') ? 'bg-gradient-to-r from-job-tag-premium/10 to-transparent border-job-tag-premium/30 hover:border-job-tag-premium/50 hover:shadow-premium relative overflow-hidden' : isAlternate ? 'bg-gradient-surface border-border/60 hover:border-primary/50 hover:shadow-card-hover' : 'bg-card border-border/60 hover:border-primary/50 hover:shadow-card-hover'}
        ${job.tags.includes('premium') ? 'before:absolute before:inset-0 before:rounded-xl before:p-[2px] before:bg-gradient-to-r before:from-transparent before:via-job-tag-premium/50 before:to-transparent before:animate-pulse before:-z-10' : ''}
      `}>
      
      {/* Moving gold blur effect for premium cards */}
      {job.tags.includes('premium') && (
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div className="absolute -inset-2 bg-gradient-to-r from-transparent via-job-tag-premium/30 to-transparent blur-sm animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-transparent via-job-tag-premium/40 to-transparent blur-md animate-pulse" 
                 style={{ 
                   animation: 'slide-right 3s ease-in-out infinite',
                   animationDelay: '0s'
                 }}></div>
          </div>
        </div>
      )}

      {/* Left Section - Company & Job Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0 relative z-10">
        <div className="relative flex-shrink-0">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md ${job.tags.includes('premium') ? 'bg-gradient-premium' : 'bg-gradient-primary'}`}>
            {job.company.charAt(0)}
          </div>
          {job.tags.includes('premium') && <div className="absolute -top-1 -right-1">
              <PremiumIcon size={20} />
            </div>}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors duration-300 truncate">
            {job.title}
          </h3>
          <div className="flex items-center gap-4 mt-1.5">
            <div className="flex items-center gap-1">
              <p className="text-muted-foreground text-sm font-medium truncate">{job.company}</p>
              {isVerifiedCompany(job.company) && <VerifyBadge size={14} className="ml-1" />}
            </div>
            <span className="text-muted-foreground text-sm truncate">{job.location}</span>
            <span className="text-muted-foreground text-sm">{job.postedAt}</span>
          </div>
        </div>
      </div>

      {/* Right Section - Tags & Actions */}
      <div className="flex items-center gap-3 flex-shrink-0 relative z-10">
        {premiumTags.length > 0 && (
          <div className="flex gap-1">
            {premiumTags.map(tag => <Badge key={tag} variant="premium" className="text-xs">
                <PremiumIcon size={16} className="mr-1" />
                PREMİUM
              </Badge>)}
          </div>
        )}
        
        <div className="flex items-center gap-2 text-muted-foreground">
          {job.salary && <div className="flex items-center gap-1">
              <span className="text-green-500 text-sm font-bold">₼</span>
            </div>}
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span className="text-xs font-medium">{job.views}</span>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slide-right {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(400%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>;
};

export default JobCard;
