import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Building, MapPin, Users, Briefcase, Globe, Phone, Mail, Search } from 'lucide-react';
import JobListings from '@/components/JobListings';
import { Job } from '@/types/job';
import { mockJobs } from '@/data/mockJobs';
import { generateCompanySEO, generateJobSEO, generatePageSEO, updatePageMeta } from '@/utils/seo';
import BottomNavigation from '@/components/BottomNavigation';

// Mock companies data
const mockCompanies = [{
  id: 1,
  name: 'Kapital Bank',
  logo: 'K',
  location: 'Bakı',
  employees: '500+',
  jobCount: 23,
  website: 'kapitalbank.az',
  verified: true
}, {
  id: 2,
  name: 'SOCAR',
  logo: 'S',
  location: 'Bakı',
  employees: '1000+',
  jobCount: 45,
  website: 'socar.az',
  verified: true
}, {
  id: 3,
  name: 'Pasha Bank',
  logo: 'P',
  location: 'Bakı',
  employees: '300+',
  jobCount: 12,
  website: 'pashabank.az',
  verified: true
}, {
  id: 4,
  name: 'Azercell',
  logo: 'A',
  location: 'Bakı',
  employees: '800+',
  jobCount: 18,
  website: 'azercell.com',
  verified: true
}, {
  id: 5,
  name: 'Bakcell',
  logo: 'B',
  location: 'Bakı',
  employees: '600+',
  jobCount: 15,
  website: 'bakcell.com',
  verified: true
}];
const Companies = () => {
  const navigate = useNavigate();
  const {
    company: companySlug,
    job: jobSlug
  } = useParams();
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // SEO setup
  useEffect(() => {
    const seoData = generatePageSEO('companies');
    updatePageMeta(seoData);
  }, []);

  // Find company from URL slug
  useEffect(() => {
    if (companySlug) {
      const company = mockCompanies.find(c => c.name.toLowerCase().replace(/\s+/g, '-') === companySlug);
      if (company) {
        setSelectedCompany(company);
        const seoData = generateCompanySEO(company.name, company.jobCount);
        updatePageMeta(seoData);

        // If there's a job slug, find and set the job
        if (jobSlug) {
          const job = mockJobs.find(j => j.title.toLowerCase().replace(/\s+/g, '-') === jobSlug && j.company === company.name);
          if (job) {
            setSelectedJob(job);
            setActiveTab('jobs');
            const jobSeoData = generateJobSEO(job.title, job.company, job.category);
            updatePageMeta(jobSeoData);
          }
        }
      }
    }
  }, [companySlug, jobSlug]);
  const handleCompanyClick = company => {
    setSelectedCompany(company);
    setActiveTab('about');
    setSelectedJob(null);
    const slug = company.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/companies/${slug}`);
  };
  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    const jobSlug = job.title.toLowerCase().replace(/\s+/g, '-');
    navigate(`/companies/${companySlug}/vacancy/${jobSlug}`);
  };
  const filteredCompanies = mockCompanies.filter(company => company.name.toLowerCase().includes(searchTerm.toLowerCase()));
  return <div className="h-full flex bg-gradient-to-br from-background via-primary/3 to-background overflow-hidden">
      <div className="flex-1 flex min-w-0 pb-16 xl:pb-0">
        {/* Companies List */}
        <div className="w-full lg:w-[400px] xl:w-[450px] border-r border-border animate-fade-in">
          <div className="flex-1 flex flex-col h-full bg-background">
            {/* Mobile/Tablet Sticky Header with Logo */}
            <div className="lg:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
              <div className="flex justify-center items-center py-3 px-4">
                <img src="/lovable-uploads/e888818f-70b8-405b-a5e8-f62f8e842525.png" alt="Logo" className="h-12 w-auto object-contain" />
              </div>
            </div>

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
                        <div className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-xs shadow-sm bg-gradient-primary">
                          {company.logo}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors duration-200 truncate">
                          {company.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <p className="text-muted-foreground text-xs truncate">{company.location}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Job Count and Employees */}
                    <div className="flex items-center gap-2 flex-shrink-0 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-primary" />
                        <span className="text-xs">{company.jobCount}</span>
                      </div>
                      <span className="text-muted-foreground">|</span>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-accent" />
                        <span className="text-xs">{company.employees}</span>
                      </div>
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
                      <div className="w-24 h-24 bg-gradient-primary rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-2xl border-4 border-background">
                        {selectedCompany.logo}
                      </div>
                      {selectedCompany.verified && <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>}
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
                        <span>{selectedCompany.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{selectedCompany.employees} işçi</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{selectedCompany.jobCount} vakansiya</span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Tabs */}
                  <div className="flex gap-4 mb-6 border-b border-border">
                    <button onClick={() => setActiveTab('about')} className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'about' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                      Şirkət Haqqında
                    </button>
                    <button onClick={() => setActiveTab('jobs')} className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'jobs' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                      İş Elanları ({selectedCompany.jobCount})
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="space-y-6">
                    {activeTab === 'about' ? <>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-3">Şirkət Haqqında</h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {selectedCompany.name} Azərbaycanın aparıcı şirkətlərindən biridir. 
                            Bizim missiyamız keyfiyyətli xidmətlər təqdim etmək və müştərilərimizin 
                            ehtiyaclarını qarşılamaqdır. Komandamız təcrübəli mütəxəssislərdən ibarətdir.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-3">Əlaqə Məlumatları</h3>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Globe className="w-5 h-5 text-primary" />
                              <a href={`https://${selectedCompany.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                {selectedCompany.website}
                              </a>
                            </div>
                            <div className="flex items-center gap-3">
                              <Phone className="w-5 h-5 text-primary" />
                              <span className="text-foreground">+994 12 123 45 67</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Mail className="w-5 h-5 text-primary" />
                              <span className="text-foreground">info@{selectedCompany.website}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-3">Statistika</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                              <div className="text-2xl font-bold text-primary mb-1">{selectedCompany.jobCount}</div>
                              <div className="text-sm text-muted-foreground">Aktiv Vakansiya</div>
                            </div>
                            <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                              <div className="text-2xl font-bold text-accent mb-1">{selectedCompany.employees}</div>
                              <div className="text-sm text-muted-foreground">İşçi Sayı</div>
                            </div>
                          </div>
                        </div>
                      </> : <div className="h-[600px] overflow-hidden">
                        <JobListings selectedJob={selectedJob} onJobSelect={handleJobSelect} selectedCategory="" companyFilter={selectedCompany.name} showHeader={false} />
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

      {/* Bottom Navigation */}
      <BottomNavigation 
        selectedCategory=""
        onCategorySelect={() => {}}
      />
    </div>;
};
export default Companies;