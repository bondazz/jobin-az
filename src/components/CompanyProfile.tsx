import React, { useState } from 'react';
import { MapPin, Globe, Phone, Mail, Briefcase, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import JobListings from '@/components/JobListings';
import { Job } from '@/types/job';
import { Tables } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useDynamicSEO } from '@/hooks/useSEO';
import VerifyBadge from '@/components/ui/verify-badge';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';

type Company = Tables<'companies'>;

interface CompanyProfileProps {
  company: Company;
  onClose: () => void;
  isMobile?: boolean;
}

const CompanyProfile = ({ company, onClose, isMobile = false }: CompanyProfileProps) => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate();

  // Use unified company profile hook for consistent behavior across all devices
  const { activeTab, handleTabChange } = useCompanyProfile(company);

  // SEO for company
  useDynamicSEO('company', company);

  const handleJobSelect = async (job: Job) => {
    // Get job slug from database
    const { data } = await supabase
      .from('jobs')
      .select('slug')
      .eq('id', job.id)
      .single();
    
    if (data?.slug) {
      navigate(`/vacancies/${data.slug}?company=${company.slug}`);
    }
  };

  if (isMobile) {
    return (
      <div className={`fixed inset-x-0 bottom-0 top-1/4 bg-background z-30 overflow-y-auto pb-20 rounded-t-xl border-t border-border shadow-2xl transform transition-transform duration-300 ease-out ${isClosing ? 'animate-slide-out-bottom' : 'animate-slide-in-bottom'}`}>
        {/* Mobile Header */}
        <div className="sticky top-0 bg-background border-b border-border p-3 flex items-center justify-between z-50 rounded-t-xl shadow-sm">
          <div className="flex items-center gap-3">
            {company.logo ? (
              <img src={company.logo} alt={company.name} className="w-8 h-8 rounded-md object-cover" width="32" height="32" decoding="async" />
            ) : (
              <div className="w-8 h-8 rounded-md bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">
                {company.name.charAt(0)}
              </div>
            )}
            <h1 className="text-lg font-bold text-foreground truncate">{company.name}</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => {
            setIsClosing(true);
            setTimeout(onClose, 300); // Wait for animation to complete
          }} className="p-2">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 pb-20">
          {/* Company Info Card */}
          <div className="bg-card rounded-lg border border-border p-4 mb-4 relative overflow-hidden">
            {/* Background Image */}
            {company.background_image && (
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ 
                  backgroundImage: `url(${company.background_image})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover'
                }}
              />
            )}
            <div className="relative z-10">
            <div className="flex items-start gap-4 mb-4">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="w-16 h-16 rounded-lg object-cover" width="64" height="64" decoding="async" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-bold text-xl">
                  {company.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-foreground">{company.name}</h2>
                  {company.is_verified && <VerifyBadge size={20} />}
                </div>
                {company.address && (
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{company.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              {company.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                     target="_blank" rel="noopener noreferrer" 
                     className="text-primary hover:underline text-sm truncate">
                    {company.website}
                  </a>
                </div>
              )}
              {company.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <a href={`mailto:${company.email}`} 
                     className="text-primary hover:underline text-sm truncate">
                    {company.email}
                  </a>
                </div>
              )}
              {company.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <a href={`tel:${company.phone}`} 
                     className="text-primary hover:underline text-sm truncate">
                    {company.phone}
                  </a>
                </div>
              )}
            </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-4">
            <Button 
              variant={activeTab === 'about' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTabChange('about')}
              className="flex-1"
            >
              Haqqında
            </Button>
            <Button 
              variant={activeTab === 'jobs' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTabChange('jobs')}
              className="flex-1"
            >
              <Briefcase className="w-4 h-4 mr-1" />
              İş Elanları
            </Button>
          </div>

          {/* Tab Content */}
          {activeTab === 'about' ? (
            <div className="bg-card rounded-lg border border-border p-4">
              <h3 className="text-lg font-semibold text-foreground mb-3">Şirkət Haqqında</h3>
              <div className="leading-relaxed rich-text-content" dangerouslySetInnerHTML={{
                __html: company.description || `${company.name} Azərbaycanın aparıcı şirkətlərindən biridir. 
                Bizim missiyamız keyfiyyətli xidmətlər təqdim etmək və müştərilərimizin 
                ehtiyaclarını qarşılamaqdır.`
              }} />
            </div>
          ) : (
            <div>
              <JobListings 
                selectedJob={selectedJob} 
                onJobSelect={handleJobSelect} 
                selectedCategory="" 
                companyFilter={company.id} 
                showHeader={false}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop version remains the same
  return null;
};

export default CompanyProfile;
