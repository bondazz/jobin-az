import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Building, MapPin, Users, Briefcase, Globe, Phone, Mail, Search } from 'lucide-react';
import JobListings from '@/components/JobListings';
import { Job } from '@/types/job';
import { generateCompanySEO, generateJobSEO, generatePageSEO, updatePageMeta } from '@/utils/seo';
import BottomNavigation from '@/components/BottomNavigation';
import MobileHeader from '@/components/MobileHeader';
import CompanyProfile from '@/components/CompanyProfile';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useIsMobile, useIsMobileOrTablet } from '@/hooks/use-mobile';
import VerifyBadge from '@/components/ui/verify-badge';

type Company = Tables<'companies'>;
const Companies = () => {
  const navigate = useNavigate();
  const {
    company: companySlug,
    job: jobSlug
  } = useParams();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [activeTab, setActiveTab] = useState('about');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileProfile, setShowMobileProfile] = useState(false);
  const isMobile = useIsMobile();
  const isMobileOrTablet = useIsMobileOrTablet();

  // Fetch companies from database
  useEffect(() => {
    fetchCompanies();
  }, []);

  // SEO setup
  useEffect(() => {
    const seoData = generatePageSEO('companies');
    updatePageMeta(seoData);
  }, []);

  // Find company from URL slug
  useEffect(() => {
    if (companySlug && companies.length > 0) {
      const company = companies.find(c => c.slug === companySlug);
      if (company) {
        setSelectedCompany(company);
        // Check if we're on the vacancies route
        const currentPath = window.location.pathname;
        if (currentPath.includes('/vacancies')) {
          setActiveTab('jobs');
        } else {
          setActiveTab('about');
        }
        const seoData = generateCompanySEO(company.name, 0); // Job count will be fetched separately
        updatePageMeta(seoData);
      }
    }
  }, [companySlug, companies]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company);
    setActiveTab('about');
    setSelectedJob(null);
    
    // Always navigate to update URL, regardless of device type
    navigate(`/companies/${company.slug}`);
    
    if (isMobileOrTablet) {
      setShowMobileProfile(true);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (selectedCompany) {
      if (tab === 'jobs') {
        navigate(`/companies/${selectedCompany.slug}/vacancies`);
      } else {
        navigate(`/companies/${selectedCompany.slug}`);
      }
    }
  };
  const handleJobSelect = async (job: Job) => {
    // Get job slug from database
    const { data } = await supabase
      .from('jobs')
      .select('slug')
      .eq('id', job.id)
      .single();
    
    if (data?.slug) {
      navigate(`/vacancies/${data.slug}?company=${selectedCompany?.slug}`);
    }
  };
  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex bg-gradient-to-br from-background via-primary/3 to-background overflow-hidden">
      {/* Mobile Header */}
      <MobileHeader />
      
      <div className="flex-1 flex min-w-0 pb-16 xl:pb-0 pt-14 xl:pt-0">
        {/* Companies List */}
        <div className="w-full lg:w-[400px] xl:w-[450px] border-r border-border animate-fade-in">
          <div className="flex-1 flex flex-col h-full bg-background">

            {/* Header with Search */}
            <div className="relative overflow-hidden bg-gradient-to-br from-background via-primary/8 to-accent/5 border-b border-border/30">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-60"></div>
              
              <div className="relative space-y-3 px-[19px] py-[10px]">
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Şirkətlər axtarın..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
              </div>
            </div>

            {/* Companies List */}
            <div className="flex-1 overflow-y-auto p-2 bg-gradient-to-b from-transparent to-primary/5 w-full max-w-[100%] mx-auto">
              <div className="flex flex-col gap-2 justify-center items-center w-full max-w-full px-2">
                {filteredCompanies.map((company, index) => <div key={company.id} onClick={() => handleCompanyClick(company)} className={`group cursor-pointer p-3 rounded-lg border transition-all duration-200 ease-smooth
                      hover:shadow-card-hover hover:-translate-y-0.5 animate-fade-in
                      w-full max-w-full min-w-0 h-[60px] flex flex-row items-center justify-between backdrop-blur-sm
                      ${selectedCompany?.id === company.id ? 'border-primary bg-gradient-to-r from-primary/20 to-primary/5 shadow-elegant ring-1 ring-primary/50' : 'bg-job-card border-border/50 hover:border-primary/40 hover:shadow-card-hover'}`} style={{
                animationDelay: `${index * 50}ms`
              }}>
                    {/* Left Section - Company Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        {company.logo ? (
                          <img src={company.logo} alt={company.name} className="w-8 h-8 rounded-md object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-xs shadow-sm bg-gradient-primary">
                            {company.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors duration-200 truncate">
                            {company.name}
                          </h3>
                           {company.is_verified && <VerifyBadge size={16} />}
                        </div>
                        <div className="flex items-center gap-2 mt-0">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <p className="text-muted-foreground text-xs truncate">{company.address || 'Ünvan yoxdur'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Empty for cleaner look */}
                    <div className="flex items-center gap-2 flex-shrink-0 text-xs text-muted-foreground">
                    </div>
                  </div>)}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Company Details */}
        <div className="hidden lg:block flex-1 bg-gradient-to-br from-job-details to-primary/3 animate-slide-in-right">
          {selectedCompany ? <div className="h-full overflow-y-auto">
              <div className="relative">
                {/* Company Header with Background */}
                <div className="relative h-48 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20"></div>
                  
                  {/* Company Logo - Floating */}
                  <div className="absolute bottom-0 left-6 transform translate-y-1/2">
                    <div className="relative">
                      {selectedCompany.logo ? (
                        <img src={selectedCompany.logo} alt={selectedCompany.name} className="w-24 h-24 rounded-2xl object-cover shadow-2xl border-4 border-background" />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-primary rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-2xl border-4 border-background">
                          {selectedCompany.name.charAt(0)}
                        </div>
                      )}
                       {selectedCompany.is_verified && <VerifyBadge size={32} className="absolute -top-2 -right-2" />}
                    </div>
                  </div>
                </div>

                {/* Company Info */}
                <div className="pt-16 px-6 pb-6">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-foreground mb-2">{selectedCompany.name}</h1>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedCompany.address || 'Ünvan yoxdur'}</span>
                      </div>
                      {selectedCompany.is_verified && (
                        <div className="flex items-center gap-1">
                          <span className="text-green-600 font-medium">✓ Təsdiqlənmiş Şirkət</span>
                        </div>
                      )}
                    </div>
                  </div>

                   {/* Navigation Tabs */}
                   <div className="flex gap-4 mb-6 border-b border-border">
                     <button onClick={() => handleTabChange('about')} className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'about' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                       Şirkət Haqqında
                     </button>
                     <button onClick={() => handleTabChange('jobs')} className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'jobs' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                       İş Elanları
                     </button>
                   </div>

                  {/* Tab Content */}
                  <div className="space-y-6">
                    {activeTab === 'about' ? <>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-3">Şirkət Haqqında</h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {selectedCompany.description || `${selectedCompany.name} Azərbaycanın aparıcı şirkətlərindən biridir. 
                            Bizim missiyamız keyfiyyətli xidmətlər təqdim etmək və müştərilərimizin 
                            ehtiyaclarını qarşılamaqdır. Komandamız təcrübəli mütəxəssislərdən ibarətdir.`}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-3">Əlaqə Məlumatları</h3>
                          <div className="space-y-3">
                            {selectedCompany.website && (
                              <div className="flex items-center gap-3">
                                <Globe className="w-5 h-5 text-primary" />
                                <a href={selectedCompany.website.startsWith('http') ? selectedCompany.website : `https://${selectedCompany.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                  {selectedCompany.website}
                                </a>
                              </div>
                            )}
                            {selectedCompany.phone && (
                              <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-primary" />
                                <span className="text-foreground">{selectedCompany.phone}</span>
                              </div>
                            )}
                            {selectedCompany.email && (
                              <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-primary" />
                                <span className="text-foreground">{selectedCompany.email}</span>
                              </div>
                            )}
                          </div>
                        </div>

                      </> : <div className="h-[600px] overflow-hidden">
                        <JobListings selectedJob={selectedJob} onJobSelect={handleJobSelect} selectedCategory="" companyFilter={selectedCompany.id} showHeader={false} />
                      </div>}
                  </div>
                </div>
              </div>
            </div> : <div className="h-full flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Şirkət Seçin</h2>
                <p className="text-muted-foreground text-sm max-w-sm">
                  Sol tərəfdən bir şirkət seçin və şirkət haqqında ətraflı məlumat alın
                </p>
              </div>
            </div>}
        </div>
      </div>

      {/* Mobile/Tablet Company Profile */}
      {showMobileProfile && selectedCompany && (
        <CompanyProfile 
          company={selectedCompany}
          onClose={() => setShowMobileProfile(false)}
          isMobile={isMobileOrTablet}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNavigation 
        selectedCategory=""
        onCategorySelect={() => {}}
      />
    </div>
  );
};

export default Companies;