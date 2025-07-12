
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useDynamicSEO } from '@/hooks/useSEO';
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

interface JobDetailsProps {
  jobId: string | null;
  isMobile?: boolean;
}

const JobDetails = ({ jobId, isMobile = false }: JobDetailsProps) => {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Dynamic SEO for job page
  useDynamicSEO('job', job);

  useEffect(() => {
    if (jobId) {
      fetchJobDetails(jobId);
      // Check if job is saved
      const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      setIsSaved(savedJobs.includes(jobId));
    }
  }, [jobId]);

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
      
      // Increment view count
      await supabase
        .from('jobs')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', data.id);

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
          {/* 500x500px Banner Advertisement */}
          <div className="w-[500px] h-[500px] bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-dashed border-primary/30 rounded-xl flex items-center justify-center mx-auto mb-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Reklam Yeri</h3>
              <p className="text-muted-foreground text-sm">500x500px Banner Reklamı</p>
              <p className="text-muted-foreground text-xs mt-2">İlana toxunduqda bu yerə iş təfərrüatları gələcək</p>
            </div>
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
      <div className={`${isMobile ? 'p-4' : 'p-6'} border-b border-border`}>
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
          <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-foreground`}>İş Təsviri</h3>
          <div className={`${isMobile ? 'text-sm' : 'text-base'} text-muted-foreground leading-relaxed whitespace-pre-wrap`}>
            {job.description}
          </div>
        </div>

        <Separator />

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <>
            <div className="space-y-3">
              <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-foreground`}>Tələblər</h3>
              <ul className={`space-y-2 ${isMobile ? 'text-sm' : 'text-base'} text-muted-foreground`}>
                {job.requirements.map((requirement: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span>{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Separator />
          </>
        )}

        {/* Benefits */}
        {job.benefits && job.benefits.length > 0 && (
          <>
            <div className="space-y-3">
              <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-foreground`}>Üstünlüklər</h3>
              <ul className={`space-y-2 ${isMobile ? 'text-sm' : 'text-base'} text-muted-foreground`}>
                {job.benefits.map((benefit: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Separator />
          </>
        )}

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

        {/* Sticky Apply Button */}
        <div className={`fixed ${isMobile ? 'bottom-16 left-4 right-4' : 'bottom-4 left-4 right-4 max-w-md mx-auto'} z-10`}>
          {job.application_url ? (
            <Button 
              size={isMobile ? "sm" : "default"}
              className={`w-full bg-gradient-primary hover:opacity-90 text-white font-semibold shadow-lg ${isMobile ? 'py-2 text-sm' : ''}`}
              onClick={() => window.open(job.application_url, '_blank')}
            >
              Bu İşə Müraciət Et
            </Button>
          ) : (
            <Button 
              size={isMobile ? "sm" : "default"}
              className={`w-full bg-gradient-primary hover:opacity-90 text-white font-semibold shadow-lg ${isMobile ? 'py-2 text-sm' : ''}`}
            >
              Bu İşə Müraciət Et
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
