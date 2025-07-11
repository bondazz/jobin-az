
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
}

const JobDetails = ({ jobId }: JobDetailsProps) => {
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
    <div className="h-full overflow-y-auto bg-gradient-to-br from-job-details to-primary/3">
      {/* Hero Section with Company Logo */}
      <div className="relative h-48 bg-gradient-to-r from-primary via-primary/80 to-accent overflow-hidden">
        <div className="absolute inset-0 bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        {/* Company Logo in Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl flex items-center justify-center">
            {job.companies?.logo ? (
              <img 
                src={job.companies.logo} 
                alt={job.companies?.name || 'Company'} 
                className="w-20 h-20 rounded-xl object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-primary">
                {(job.companies?.name || job.title).charAt(0)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Job Title and Company */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">{job.companies?.name || 'Şirkət'}</h1>
            {job.companies?.is_verified && <VerifyBadge size={20} />}
          </div>
          <h2 className="text-xl font-semibold text-muted-foreground">{job.title}</h2>
          <Badge variant="outline">{job.categories?.name || 'Kateqoriya'}</Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          {job.application_url ? (
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:opacity-90 text-white font-semibold px-6"
              onClick={() => window.open(job.application_url, '_blank')}
            >
              Müraciət Et
            </Button>
          ) : (
            <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-white font-semibold px-6">
              Müraciət Et
            </Button>
          )}
          <Button 
            variant="outline" 
            size="lg" 
            className={`border-primary/30 hover:bg-primary hover:text-white ${isSaved ? 'bg-primary text-white' : 'text-primary'}`}
            onClick={handleSaveJob}
          >
            <Bookmark className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
            {isSaved ? 'Saxlanıldı' : 'Saxla'}
          </Button>
          <Button variant="outline" size="lg" className="border-primary/30 text-primary hover:bg-primary hover:text-white">
            <Share2 className="w-4 h-4 mr-2" />
            Paylaş
          </Button>
        </div>

        <Separator />

        {/* Job Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Məkan</p>
                <p className="text-sm text-muted-foreground">{job.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Yayımlanma Tarixi</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(job.created_at).toLocaleDateString('az-AZ')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Eye className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
              <p className="text-sm font-medium text-foreground">Baxış Sayı</p>
                <p className="text-sm text-muted-foreground">{((job.views || 0) + 1)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Building className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Şirkət</p>
                <p className="text-sm text-muted-foreground">{job.companies?.name || 'Şirkət'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <DollarSign className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Maaş</p>
                <p className="text-sm text-muted-foreground">{job.salary || 'Müzakirə ediləcək'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Clock className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">İş Növü</p>
                <p className="text-sm text-muted-foreground">{job.type}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Job Description */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">İş Təsviri</h3>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p className="leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>
        </div>

        <Separator />

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground">Tələblər</h3>
              <ul className="space-y-2 text-muted-foreground">
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
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground">Üstünlüklər</h3>
              <ul className="space-y-2 text-muted-foreground">
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
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground">Əlaqə Məlumatları</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {job.companies?.email && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">E-mail</p>
                    <a 
                      href={`mailto:${job.companies.email}`}
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      {job.companies.email}
                    </a>
                  </div>
                </div>
              )}
              {job.companies?.phone && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Telefon</p>
                    <a 
                      href={`tel:${job.companies.phone}`}
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      {job.companies.phone}
                    </a>
                  </div>
                </div>
              )}
              {job.companies?.website && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <Globe className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Veb Sayt</p>
                    <a 
                      href={job.companies.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      {job.companies.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Action */}
        <div className="sticky bottom-0 bg-job-details/90 backdrop-blur-md p-4 -mx-6 border-t border-border">
          {job.application_url ? (
            <Button 
              size="lg" 
              className="w-full bg-gradient-primary hover:opacity-90 text-white font-semibold"
              onClick={() => window.open(job.application_url, '_blank')}
            >
              Bu İşə Müraciət Et
            </Button>
          ) : (
            <Button size="lg" className="w-full bg-gradient-primary hover:opacity-90 text-white font-semibold">
              Bu İşə Müraciət Et
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
