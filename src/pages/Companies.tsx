import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Building, MapPin, Users, Briefcase, Globe, Phone, Mail, Search, Loader2 } from 'lucide-react';
import JobListings from '@/components/JobListings';
import { Job } from '@/types/job';
import { generateCompanySEO, generateJobSEO, generatePageSEO, updatePageMeta } from '@/utils/seo';
import { useDynamicSEO } from '@/hooks/useSEO';
import BottomNavigation from '@/components/BottomNavigation';
import MobileHeader from '@/components/MobileHeader';
import CompanyProfile from '@/components/CompanyProfile';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useIsMobile, useIsMobileOrTablet } from '@/hooks/use-mobile';
import VerifyBadge from '@/components/ui/verify-badge';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';

type Company = Tables<'companies'>;
const Companies = () => {
  const navigate = useNavigate();
  const {
    company: companySlug,
    job: jobSlug
  } = useParams();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [displayPage, setDisplayPage] = useState(0);
  const COMPANIES_PER_PAGE = 50;
  const [showMobileProfile, setShowMobileProfile] = useState(false);
  const [jobData, setJobData] = useState<any>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const isMobileOrTablet = useIsMobileOrTablet();
  
  // Use unified company profile hook for consistent behavior across all devices
  const { activeTab, handleTabChange } = useCompanyProfile(selectedCompany);

  // Dynamic SEO
  useDynamicSEO('company', companySlug ? selectedCompany : null);
  useDynamicSEO('job', jobSlug ? jobData : null);

  // Debouncing for search - 500ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load initial companies and handle search
  useEffect(() => {
    loadCompanies();
  }, [debouncedSearchTerm]);

  // Find company from URL slug
  useEffect(() => {
    if (companySlug && allCompanies.length > 0) {
      const company = allCompanies.find(c => c.slug === companySlug);
      if (company) {
        setSelectedCompany(company);
      }
    }
  }, [companySlug, allCompanies]);

  // Default SEO setup for main companies page
  useEffect(() => {
    if (!companySlug && !jobSlug) {
      const updateSEO = async () => {
        const seoData = await generatePageSEO('companies');
        updatePageMeta(seoData);
      };
      updateSEO();
    }
  }, [companySlug, jobSlug]);

  // Fetch job by slug for SEO
  useEffect(() => {
    if (jobSlug) {
      const fetchJobBySlug = async () => {
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            companies (name, logo, is_verified),
            categories (name)
          `)
          .eq('slug', jobSlug)
          .eq('is_active', true)
          .single();

        if (data && !error) {
          setJobData(data);
        }
      };
      
      fetchJobBySlug();
    } else {
      setJobData(null);
    }
  }, [jobSlug]);

  const loadMoreDisplayedCompanies = useCallback(() => {
    if (loadingMore || !hasMore || debouncedSearchTerm.trim()) return;
    
    setLoadingMore(true);
    console.log('⏳ 50 şirkət əlavə edilir...');
    
    setTimeout(() => {
      const nextPage = displayPage + 1;
      const startIndex = nextPage * COMPANIES_PER_PAGE;
      const endIndex = startIndex + COMPANIES_PER_PAGE;
      
      const nextBatch = allCompanies.slice(startIndex, endIndex);
      const newDisplayed = [...companies, ...nextBatch];
      
      setCompanies(newDisplayed);
      setDisplayPage(nextPage);
      setHasMore(endIndex < allCompanies.length);
      setLoadingMore(false);
      
      console.log(`✅ YENİ BATCH: ${nextBatch.length} şirkət əlavə edildi`);
      console.log(`📱 CƏMİ GÖSTƏRƏN: ${newDisplayed.length}/${allCompanies.length}`);
    }, 300);
  }, [loadingMore, hasMore, debouncedSearchTerm, displayPage, allCompanies, companies]);

  // Infinite scroll effect with ref
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const scrollTop = target.scrollTop;
      const scrollHeight = target.scrollHeight;
      const clientHeight = target.clientHeight;
      
      // Check if near bottom (within 100px) for more sensitive detection
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        if (!loadingMore && hasMore) {
          loadMoreDisplayedCompanies();
        }
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [loadMoreDisplayedCompanies]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      console.log('🚀 PERFORMANCE YAXŞILAŞDIRILMASı - İnfinite Scroll');
      
      if (debouncedSearchTerm.trim()) {
        console.log('🔍 Axtarış edilir:', debouncedSearchTerm);
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('is_active', true)
          .ilike('name', `%${debouncedSearchTerm.trim()}%`)
          .order('name');
        
        if (error) throw error;
        console.log('✅ Axtarış nəticəsi:', data?.length || 0);
        
        // Search zamanı bütün nəticələri göstər
        setAllCompanies(data || []);
        setCompanies(data || []);
        setHasMore(false);
      } else {
        console.log('📊 BÜTÜN ŞİRKƏTLƏRİ PAGINATION İLƏ YÜKLƏYİRİK');
        
        let allCompaniesData: Company[] = [];
        let pageSize = 1000;
        let currentPage = 0;
        let hasMoreData = true;
        
        while (hasMoreData) {
          console.log(`📖 Səhifə ${currentPage + 1} yüklənir...`);
          
          const { data, error } = await supabase
            .from('companies')
            .select('*')
            .eq('is_active', true)
            .order('name')
            .range(currentPage * pageSize, (currentPage + 1) * pageSize - 1);
          
          if (error) throw error;
          
          console.log(`✅ Səhifə ${currentPage + 1}: ${data?.length || 0} şirkət`);
          
          if (data && data.length > 0) {
            allCompaniesData = [...allCompaniesData, ...data];
            console.log(`📈 Cəmi: ${allCompaniesData.length} şirkət`);
            
            if (data.length < pageSize) {
              hasMoreData = false;
            } else {
              currentPage++;
            }
          } else {
            hasMoreData = false;
          }
        }
        
        console.log(`🎉 TAMAMLANDI! ${allCompaniesData.length} şirkət yükləndi`);
        console.log(`🥇 İlk şirkət: ${allCompaniesData[0]?.name}`);
        console.log(`🥉 Son şirkət: ${allCompaniesData[allCompaniesData.length - 1]?.name}`);
        
        // İlk 50 şirkəti göstər
        const initialDisplayed = allCompaniesData.slice(0, COMPANIES_PER_PAGE);
        
        setAllCompanies(allCompaniesData);
        setCompanies(initialDisplayed);
        setDisplayPage(0);
        setHasMore(allCompaniesData.length > COMPANIES_PER_PAGE);
        
        console.log(`📱 İLK GÖSTƏRƏN: ${initialDisplayed.length} şirkət (${allCompaniesData.length} təklifindən)`);
      }

    } catch (error) {
      console.error('❌ XƏTA:', error);
      setAllCompanies([]);
      setCompanies([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company);
    setSelectedJob(null);
    
    // Always navigate to update URL, regardless of device type
    navigate(`/companies/${company.slug}`);
    
    if (isMobileOrTablet) {
      setShowMobileProfile(true);
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
            <div ref={scrollContainerRef} className="companies-scroll-container flex-1 overflow-y-auto p-2 bg-gradient-to-b from-transparent to-primary/5 w-full max-w-[100%] mx-auto">
              <div className="flex flex-col gap-2 justify-center items-center w-full max-w-full px-2">
                {companies.map((company, index) => (
                  <div 
                    key={company.id} 
                    onClick={() => handleCompanyClick(company)} 
                    className={`group cursor-pointer p-3 rounded-lg border transition-all duration-200 ease-smooth
                      hover:shadow-card-hover hover:-translate-y-0.5 animate-fade-in
                      w-full max-w-full min-w-0 h-[60px] flex flex-row items-center justify-between backdrop-blur-sm
                      ${selectedCompany?.id === company.id ? 'border-primary bg-gradient-to-r from-primary/20 to-primary/5 shadow-elegant ring-1 ring-primary/50' : 'bg-job-card border-border/50 hover:border-primary/40 hover:shadow-card-hover'}`} 
                    style={{
                      animationDelay: `${index * 50}ms`
                    }}
                  >
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
                  </div>
                ))}

                {/* Loading More Indicator */}
                {loadingMore && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">Daha çox şirkət yüklənir...</span>
                  </div>
                )}

                {/* Display Statistics */}
                {!debouncedSearchTerm && companies.length > 0 && hasMore && allCompanies.length > 0 && (
                  <div className="flex items-center justify-center py-2">
                    <span className="text-xs text-muted-foreground">
                      {companies.length} / {allCompanies.length} şirkət göstərildi
                    </span>
                  </div>
                )}

                {/* No More Results */}
                {!hasMore && !debouncedSearchTerm && companies.length > 0 && allCompanies.length > 0 && (
                  <div className="flex items-center justify-center py-4">
                    <span className="text-sm text-muted-foreground">
                      Bütün şirkətlər göstərildi ({allCompanies.length} şirkət)
                    </span>
                  </div>
                )}

                {/* No Results for Search */}
                {debouncedSearchTerm && companies.length === 0 && !loading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Search className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <span className="text-sm text-muted-foreground">"{debouncedSearchTerm}" üçün heç bir şirkət tapılmadı</span>
                    </div>
                  </div>
                )}
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
                  {selectedCompany.background_image && (
                    <img 
                      src={selectedCompany.background_image} 
                      alt={selectedCompany.name} 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20"></div>
                  
                  {/* Company Logo - Floating */}
                  <div className="absolute bottom-0 left-6 transform translate-y-1/2 z-10">
                    <div className="relative">
                      {selectedCompany.logo ? (
                        <img src={selectedCompany.logo} alt={selectedCompany.name} className="w-28 h-28 rounded-2xl object-cover shadow-2xl border-4 border-background" />
                      ) : (
                        <div className="w-28 h-28 bg-gradient-primary rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-2xl border-4 border-background">
                          {selectedCompany.name.charAt(0)}
                        </div>
                      )}
                       {selectedCompany.is_verified && <VerifyBadge size={32} className="absolute -top-2 -right-2" />}
                    </div>
                  </div>
                </div>

                {/* Company Info */}
                <div className="pt-20 px-6 pb-6">
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
                            Bizim missiyamız keyfiyyətli xidmətlər təqdim etmək və müştərilərimizin tələbatlarını qarşılamaqdır. 
                            Şirkətimiz innovativ yanaşmalar və peşəkar komanda ilə bazarda lider mövqe tutur.`}
                          </p>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedCompany.website && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
                              <Globe className="w-5 h-5 text-primary" />
                              <div>
                                <p className="text-sm font-medium text-foreground">Vebsayt</p>
                                <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                  {selectedCompany.website}
                                </a>
                              </div>
                            </div>
                          )}

                          {selectedCompany.email && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
                              <Mail className="w-5 h-5 text-primary" />
                              <div>
                                <p className="text-sm font-medium text-foreground">E-poçt</p>
                                <a href={`mailto:${selectedCompany.email}`} className="text-sm text-primary hover:underline">
                                  {selectedCompany.email}
                                </a>
                              </div>
                            </div>
                          )}

                          {selectedCompany.phone && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
                              <Phone className="w-5 h-5 text-primary" />
                              <div>
                                <p className="text-sm font-medium text-foreground">Telefon</p>
                                <a href={`tel:${selectedCompany.phone}`} className="text-sm text-primary hover:underline">
                                  {selectedCompany.phone}
                                </a>
                              </div>
                            </div>
                          )}

                          {selectedCompany.address && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
                              <MapPin className="w-5 h-5 text-primary" />
                              <div>
                                <p className="text-sm font-medium text-foreground">Ünvan</p>
                                <p className="text-sm text-muted-foreground">{selectedCompany.address}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </> : <>
                        <JobListings 
                          onJobSelect={handleJobSelect}
                          selectedJob={selectedJob}
                        />
                      </>}
                  </div>
                </div>
              </div>
            </div> : 
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Şirkət seçin</h3>
                <p className="text-muted-foreground">Şirkət haqqında ətraflı məlumat almaq üçün sol tərəfdən şirkət seçin</p>
              </div>
            </div>
          }
        </div>
      </div>

      {/* Mobile Company Profile */}
      {isMobileOrTablet && selectedCompany && showMobileProfile && (
        <CompanyProfile 
          company={selectedCompany}
          onClose={() => setShowMobileProfile(false)}
          isMobile={true}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNavigation onCategorySelect={() => {}} />
    </div>
  );
};

export default Companies;