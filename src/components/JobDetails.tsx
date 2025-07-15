
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useDynamicSEO } from '@/hooks/useSEO';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Clock, 
  Building, 
  Star,
  Share2,
  Bookmark,
  Eye,
  DollarSign,
  Globe,
  Mail,
  Phone
} from 'lucide-react';
import VerifyBadge from '@/components/ui/verify-badge';
import AdBanner from './AdBanner';

interface JobDetailsProps {
  jobId: string | null;
  isMobile?: boolean;
}

const JobDetails = ({ jobId, isMobile = false }: JobDetailsProps) => {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  // Dynamic SEO for job page
  useDynamicSEO('job', job);

  useEffect(() => {
    if (jobId) {
      fetchJobDetails(jobId);
      // Check if job is saved
      const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      setIsSaved(savedJobs.includes(jobId));
      // Increment view count
      incrementViewCount(jobId);
    }
  }, [jobId]);

  const incrementViewCount = async (id: string) => {
    try {
      await supabase.rpc('increment_job_views', { job_id: id });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const fetchJobDetails = async (id: string) => {
    setLoading(true);
    try {
      // First try to find by ID, then by slug
      let { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies:company_id(name, logo, website, email, phone, is_verified),
          categories:category_id(name)
        `)
        .eq('id', id)
        .single();

      // If not found by ID, try by slug
      if (error && error.code === 'PGRST116') {
        const slugResult = await supabase
          .from('jobs')
          .select(`
            *,
            companies:company_id(name, logo, website, email, phone, is_verified),
            categories:category_id(name)
          `)
          .eq('slug', id)
          .single();
        
        data = slugResult.data;
        error = slugResult.error;
      }

      if (error) throw error;

      setJob(data);
      
      // Check if job is saved
      const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      setIsSaved(savedJobs.includes(data.id));
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = () => {
    if (!job) return;
    
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
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-job-details to-primary/3">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-job-details to-primary/3">
        <div className="text-center p-8 animate-fade-in">
          {/* Banner Advertisement */}
          <div className="max-w-[500px] mx-auto mb-6">
            <AdBanner position="job_details" />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">İş Təfərrüatları</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Hərhansı bir iş elanına toxunaraq təfərrüatlı məlumat əldə edə bilərsiniz
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Minimalist Header with Company Logo */}
      <div className={`${isMobile ? 'p-4 pt-6' : 'p-6'} border-b border-border`}>
        <div className="flex items-center gap-4">
          {/* Company Logo */}
          <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0`}>
            {job.companies?.logo ? (
              <img 
                src={job.companies.logo} 
                alt={job.companies?.name || 'Company'} 
                className={`${isMobile ? 'w-10 h-10' : 'w-14 h-14'} rounded-lg object-cover`}
              />
            ) : (
              <span className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-primary`}>
                {(job.companies?.name || job.title).charAt(0)}
              </span>
            )}
          </div>
          
          {/* Job Title and Company */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-foreground truncate`}>
                {job.companies?.name || 'Şirkət'}
              </h2>
              {job.companies?.is_verified && <VerifyBadge size={isMobile ? 14 : 16} />}
            </div>
            <h1 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-foreground truncate`}>
              {job.title}
            </h1>
            <Badge variant="outline" className={`${isMobile ? 'text-xs' : 'text-sm'} mt-1`}>
              {job.categories?.name || 'Kateqoriya'}
            </Badge>
          </div>
        </div>
      </div>

      <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-4`}>
        {/* Apply Button */}
        <div className="mb-4">
          {job.application_type === 'website' && job.application_url ? (
            <Button 
              size="sm"
              className="bg-gradient-primary hover:opacity-90 text-white font-semibold"
              onClick={() => window.open(job.application_url, '_blank')}
            >
              Bu İşə Müraciət Et
            </Button>
          ) : job.application_type === 'email' && job.application_email ? (
            <Button 
              size="sm"
              className="bg-gradient-primary hover:opacity-90 text-white font-semibold"
              onClick={() => {
                navigator.clipboard.writeText(job.application_email);
                toast({
                  title: 'E-mail kopyalandı',
                  description: `${job.application_email} panoya kopyalandı`,
                });
              }}
            >
              Bu İşə Müraciət Et
            </Button>
          ) : (
            <Button 
              size="sm"
              className="bg-gradient-primary hover:opacity-90 text-white font-semibold"
              disabled
            >
              Müraciət Məlumatı Yoxdur
            </Button>
          )}
        </div>

        {/* Compact Action Buttons */}
        <div className={`flex gap-2 ${isMobile ? 'flex-col' : 'flex-wrap'}`}>
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"}
            className={`border-primary/30 hover:bg-primary hover:text-white ${isSaved ? 'bg-primary text-white' : 'text-primary'} ${isMobile ? 'justify-start' : ''}`}
            onClick={handleSaveJob}
          >
            <Bookmark className={`w-4 h-4 ${isMobile ? 'mr-2' : 'mr-1'} ${isSaved ? 'fill-current' : ''}`} />
            {isSaved ? 'Saxlanıldı' : 'Saxla'}
          </Button>
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"}
            className={`border-primary/30 text-primary hover:bg-primary hover:text-white ${isMobile ? 'justify-start' : ''}`}
          >
            <Share2 className={`w-4 h-4 ${isMobile ? 'mr-2' : 'mr-1'}`} />
            Paylaş
          </Button>
        </div>

        <Separator />

        {/* Compact Job Info */}
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
          <div className={`flex items-center gap-2 ${isMobile ? 'p-2' : 'p-3'} rounded-lg bg-muted/30`}>
            <MapPin className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-primary flex-shrink-0`} />
            <div className="min-w-0 flex-1">
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-foreground`}>Məkan</p>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground truncate`}>{job.location}</p>
            </div>
          </div>

          <div className={`flex items-center gap-2 ${isMobile ? 'p-2' : 'p-3'} rounded-lg bg-muted/30`}>
            <DollarSign className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-primary flex-shrink-0`} />
            <div className="min-w-0 flex-1">
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-foreground`}>Maaş</p>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground truncate`}>{job.salary || 'Müzakirə ediləcək'}</p>
            </div>
          </div>

          <div className={`flex items-center gap-2 ${isMobile ? 'p-2' : 'p-3'} rounded-lg bg-muted/30`}>
            <Clock className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-primary flex-shrink-0`} />
            <div className="min-w-0 flex-1">
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-foreground`}>İş Növü</p>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground truncate`}>{job.type}</p>
            </div>
          </div>

          <div className={`flex items-center gap-2 ${isMobile ? 'p-2' : 'p-3'} rounded-lg bg-muted/30`}>
            <Eye className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-primary flex-shrink-0`} />
            <div className="min-w-0 flex-1">
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-foreground`}>Baxış</p>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>{((job.views || 0) + 1)}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Job Description */}
        <div className="space-y-3">
          <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-foreground`}>Təsvir</h3>
          <div className={`${isMobile ? 'text-sm' : 'text-base'} text-muted-foreground leading-relaxed whitespace-pre-wrap`}>
            {job.description}
          </div>
        </div>

        <Separator />

        {/* Contact Information */}
        {(job.companies?.email || job.companies?.phone || job.companies?.website) && (
          <div className="space-y-3">
            <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-foreground`}>Əlaqə</h3>
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-3`}>
              {job.companies?.email && (
                <div className={`flex items-center gap-2 ${isMobile ? 'p-2' : 'p-3'} rounded-lg bg-muted/30`}>
                  <Mail className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-primary flex-shrink-0`} />
                  <div className="min-w-0 flex-1">
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-foreground`}>E-mail</p>
                    <a 
                      href={`mailto:${job.companies.email}`}
                      className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground hover:text-primary truncate block`}
                    >
                      {job.companies.email}
                    </a>
                  </div>
                </div>
              )}
              {job.companies?.phone && (
                <div className={`flex items-center gap-2 ${isMobile ? 'p-2' : 'p-3'} rounded-lg bg-muted/30`}>
                  <Phone className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-primary flex-shrink-0`} />
                  <div className="min-w-0 flex-1">
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-foreground`}>Telefon</p>
                    <a 
                      href={`tel:${job.companies.phone}`}
                      className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground hover:text-primary`}
                    >
                      {job.companies.phone}
                    </a>
                  </div>
                </div>
              )}
              {job.companies?.website && (
                <div className={`flex items-center gap-2 ${isMobile ? 'p-2' : 'p-3'} rounded-lg bg-muted/30`}>
                  <Globe className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-primary flex-shrink-0`} />
                  <div className="min-w-0 flex-1">
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-foreground`}>Veb Sayt</p>
                    <a 
                      href={job.companies.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground hover:text-primary truncate block`}
                    >
                      {job.companies.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional spacing for mobile bottom navigation */}
        {isMobile && <div className="h-16"></div>}
      </div>
    </div>
  );
};

export default JobDetails;
