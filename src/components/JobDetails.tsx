import { Job } from '@/types/job';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Calendar, 
  Eye, 
  Briefcase,
  Users,
  Star,
  Mail,
  Check
} from 'lucide-react';
import PremiumIcon from '@/components/ui/premium-icon';
import VerifyBadge from '@/components/ui/verify-badge';
import { useState } from 'react';

interface JobDetailsProps {
  job: Job | null;
}

const JobDetails = ({ job }: JobDetailsProps) => {
  const [emailCopied, setEmailCopied] = useState(false);

  if (!job) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-background to-primary/10">
        <div className="text-center animate-fade-in">
          <div className="relative mb-6">
            <Briefcase className="w-16 h-16 md:w-20 md:h-20 mx-auto opacity-30" />
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl"></div>
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">Təfərrüat üçün iş seçin</h3>
          <p className="text-sm md:text-base text-muted-foreground">Tam məlumat üçün hər hansı iş elanına klikləyin</p>
        </div>
      </div>
    );
  }

  const getJobTypeLabel = (type: string) => {
    switch (type) {
      case 'full-time':
        return 'Tam zamanlı';
      case 'part-time':
        return 'Yarım zamanlı';
      case 'contract':
        return 'Müqavilə';
      case 'internship':
        return 'Təcrübə';
      default:
        return type;
    }
  };

  const convertSalaryToAZN = (salary?: string) => {
    if (!salary) return null;
    return salary.replace(/\$(\d+)/g, (match, amount) => {
      const aznAmount = Math.round(parseFloat(amount) * 1.7);
      return `${aznAmount} ₼`;
    });
  };

  const isVerifiedCompany = (company: string) => {
    const verifiedCompanies = ['Google', 'Apple', 'Microsoft', 'Meta', 'Amazon', 'Netflix', 'Tesla', 'Spotify'];
    return verifiedCompanies.includes(company);
  };

  const handleApplyClick = () => {
    const email = 'hr@jooble.az';
    const subject = `${job.title} vəzifəsinə müraciət`;
    const body = `Salam,\n\n${job.company} şirkətindəki ${job.title} vəzifəsinə müraciət etmək istəyirəm.\n\nHörmətlə,`;
    
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    
    // Copy email to clipboard
    navigator.clipboard.writeText(email).then(() => {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    });
  };

  // Filter to only show premium tags
  const premiumTags = job.tags.filter(tag => tag === 'premium');

  return (
    <div className="relative h-full overflow-y-auto bg-gradient-to-br from-job-details to-primary/5">
      <div className="p-4 md:p-6 lg:p-8 pb-24 animate-fade-in">
        {/* Enhanced Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 mb-4 md:mb-6">
            <div className="relative mx-auto md:mx-0">
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-elegant ${
                job.tags.includes('premium') ? 'bg-gradient-premium' : 'bg-gradient-primary'
              }`}>
                {job.company.charAt(0)}
              </div>
              {job.tags.includes('premium') && (
                <div className="absolute -top-2 -right-2">
                  <PremiumIcon size={28} />
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 leading-tight">
                {job.title}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3 md:mb-4">
                <p className="text-lg md:text-xl text-primary font-semibold">
                  {job.company}
                </p>
                {isVerifiedCompany(job.company) && <VerifyBadge size={20} />}
              </div>
              {premiumTags.length > 0 && (
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {premiumTags.map((tag, index) => (
                    <Badge 
                      key={tag} 
                      variant="premium"
                      className="px-2 md:px-3 py-1 md:py-1.5 text-xs font-semibold animate-bounce-in shadow-sm relative overflow-hidden"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <PremiumIcon size={12} className="mr-1" />
                      PREMİUM
                      {/* Gold blur effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-job-tag-premium/30 to-transparent blur-sm animate-pulse pointer-events-none"></div>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Məkan</p>
                <p className="text-sm md:text-base font-semibold text-foreground">{job.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Dərc edilib</p>
                <p className="text-sm md:text-base font-semibold text-foreground">{job.postedAt}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Eye className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Baxış</p>
                <p className="text-sm md:text-base font-semibold text-foreground">{job.views} nəfər</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Növ</p>
                <p className="text-sm md:text-base font-semibold text-foreground">{getJobTypeLabel(job.type)}</p>
              </div>
            </div>
          </div>

          {job.salary && (
            <Card className={`mb-4 md:mb-6 border-primary/30 shadow-elegant ${
              job.tags.includes('premium') ? 'bg-gradient-to-r from-job-tag-premium/10 via-job-tag-premium/5 to-transparent' : 'bg-gradient-to-r from-primary/10 via-primary/5 to-transparent'
            }`}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${
                    job.tags.includes('premium') ? 'bg-gradient-premium' : 'bg-gradient-primary'
                  }`}>
                    <span className="text-white text-lg md:text-xl font-bold">₼</span>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground font-medium mb-1">Maaş Aralığı</p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">{convertSalaryToAZN(job.salary)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator className="mb-6 md:mb-8 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        {/* Job Description */}
        <Card className="mb-4 md:mb-6 border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300">
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="flex items-center gap-2 md:gap-3 text-lg md:text-xl">
              <div className={`w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center ${
                job.tags.includes('premium') ? 'bg-gradient-premium' : 'bg-gradient-primary'
              }`}>
                <Star className="w-3 h-3 md:w-4 md:h-4 text-white" />
              </div>
              İş Təsviri
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm md:text-base">
              {job.description}
            </p>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card className="mb-4 md:mb-6 border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300">
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="flex items-center gap-2 md:gap-3 text-lg md:text-xl">
              <div className={`w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center ${
                job.tags.includes('premium') ? 'bg-gradient-premium' : 'bg-gradient-primary'
              }`}>
                <Star className="w-3 h-3 md:w-4 md:h-4 text-white" />
              </div>
              Tələblər
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <ul className="space-y-2 md:space-y-3">
              {job.requirements.map((requirement, index) => (
                <li key={index} className="flex items-start gap-2 md:gap-3 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="w-5 h-5 md:w-6 md:h-6 bg-primary/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-primary rounded-full" />
                  </div>
                  <span className="text-muted-foreground leading-relaxed text-sm md:text-base">{requirement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Benefits */}
        {job.benefits && job.benefits.length > 0 && (
          <Card className="border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="flex items-center gap-2 md:gap-3 text-lg md:text-xl">
                <div className={`w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center ${
                  job.tags.includes('premium') ? 'bg-gradient-premium' : 'bg-gradient-primary'
                }`}>
                  <Star className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </div>
                Faydalar və Imtiyazlar
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <ul className="space-y-2 md:space-y-3">
                {job.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 md:gap-3 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-primary/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-primary rounded-full" />
                    </div>
                    <span className="text-muted-foreground leading-relaxed text-sm md:text-base">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sticky Apply Button */}
      <div className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-auto z-50">
        <Button 
          onClick={handleApplyClick}
          className={`w-full md:w-auto px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold transition-all duration-300 shadow-elegant hover:shadow-glow rounded-xl relative overflow-hidden ${
            job.tags.includes('premium') ? 'bg-gradient-premium hover:opacity-90' : 'bg-gradient-primary hover:opacity-90'
          }`}
        >
          {/* Gold blur effect for premium jobs */}
          {job.tags.includes('premium') && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-job-tag-premium/30 to-transparent blur-sm animate-pulse pointer-events-none"></div>
          )}
          <span className="relative z-10 flex items-center justify-center">
            {emailCopied ? (
              <>
                <Check className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                Email kopyalandı
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                Bu vəzifəyə müraciət et
              </>
            )}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default JobDetails;
