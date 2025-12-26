"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Building, MapPin, Briefcase, Globe, Search, Loader2 } from 'lucide-react';
import JobListings from '@/components/JobListings';
import { Job } from '@/types/job';
import { generatePageSEO, updatePageMeta } from '@/utils/seo';
import MobileHeader from '@/components/MobileHeader';
import CompanyProfile from '@/components/CompanyProfile';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useIsMobile, useIsMobileOrTablet } from '@/hooks/use-mobile';
import VerifyBadge from '@/components/ui/verify-badge';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useReferralCode } from '@/hooks/useReferralCode';
import SEOBreadcrumb from '@/components/SEOBreadcrumb';

type Company = Tables<'companies'>;

const CompaniesClient = () => {
    const router = useRouter();
    const params = useParams();
    const companySlug = params?.company as string | undefined;

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
    const { getUrlWithReferral } = useReferralCode();

    // Use unified company profile hook for consistent behavior across all devices
    const { activeTab, handleTabChange } = useCompanyProfile(selectedCompany);

    // Dynamic SEO
    // useDynamicSEO('company', companySlug ? selectedCompany : null);
    // useDynamicSEO('job', jobSlug ? jobData : null);

    // Generate Organization structured data for selected company
    const generateOrganizationSchema = (company: Company) => {
        return {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": company.name,
            "url": company.website || window.location.href,
            "logo": company.logo || "",
            "description": company.description || `${company.name} şirkətində iş imkanları və vakansiyalar`,
            "address": company.address ? {
                "@type": "PostalAddress",
                "streetAddress": company.address,
                "addressCountry": "AZ"
            } : undefined,
            "sameAs": company.website ? [company.website] : undefined
        };
    };

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

    // Find company from URL slug or load directly from API
    useEffect(() => {
        const loadCompanyBySlug = async () => {
            if (!companySlug) return;

            // First try to find in loaded companies
            if (allCompanies.length > 0) {
                const company = allCompanies.find(c => c.slug === companySlug);
                if (company) {
                    setSelectedCompany(company);
                    // Open mobile profile when directly accessing company URL on mobile/tablet
                    if (isMobileOrTablet) {
                        setShowMobileProfile(true);
                    }
                    return;
                }
            }

            // If not found in loaded companies, fetch directly from API
            try {
                const { data, error } = await supabase
                    .from('companies')
                    .select(`
            id, name, slug, logo, background_image, description, website, email, phone, address, 
            seo_title, seo_description, seo_keywords, about_seo_title, about_seo_description, 
            jobs_seo_title, jobs_seo_description, is_verified, is_active, created_at, updated_at
          `)
                    .eq('slug', companySlug)
                    .eq('is_active', true)
                    .single();

                if (data && !error) {
                    setSelectedCompany(data);
                    // Open mobile profile when directly accessing company URL on mobile/tablet
                    if (isMobileOrTablet) {
                        setShowMobileProfile(true);
                    }
                }
            } catch (error) {
                console.error('Şirkət yüklənə bilmədi:', error);
            }
        };

        loadCompanyBySlug();
    }, [companySlug, allCompanies, isMobileOrTablet]);



    const loadMoreDisplayedCompanies = useCallback(() => {
        if (loadingMore || !hasMore || debouncedSearchTerm.trim()) return;

        setLoadingMore(true);
        console.log('⏳ 50 şirkət əlavə edilir...');

        setTimeout(() => {
            const nextPage = displayPage + 1;
            const startIndex = nextPage * COMPANIES_PER_PAGE;
            const endIndex = startIndex + COMPANIES_PER_PAGE;

            const nextBatch = allCompanies.slice(startIndex, endIndex);
            // Ensure uniqueness by company id when appending
            const map = new Map<string, any>();
            [...companies, ...nextBatch].forEach((c: any) => {
                if (!map.has(c.id)) map.set(c.id, c);
            });
            const newDisplayed = Array.from(map.values());

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
            console.log('🚀 PERFORMANCE YAXŞILAŞDIRILMASI - İlk 15 şirkət anında');

            if (debouncedSearchTerm.trim()) {
                console.log('🔍 Axtarış edilir:', debouncedSearchTerm);
                // Get companies with their job counts
                const { data, error } = await supabase
                    .from('companies')
                    .select(`
            id, name, slug, logo, background_image, description, website, email, phone, address, seo_title, seo_description, seo_keywords, about_seo_title, about_seo_description, jobs_seo_title, jobs_seo_description, is_verified, is_active, created_at, updated_at,
            jobs!company_id(id)
          `)
                    .eq('is_active', true)
                    .ilike('name', `%${debouncedSearchTerm.trim()}%`);

                // Create unique companies with job counts using Map
                const companiesMap = new Map();
                data?.forEach(row => {
                    if (!companiesMap.has(row.id)) {
                        companiesMap.set(row.id, {
                            id: row.id,
                            name: row.name,
                            slug: row.slug,
                            logo: row.logo,
                            background_image: row.background_image,
                            description: row.description,
                            website: row.website,
                            email: row.email,
                            phone: row.phone,
                            address: row.address,
                            seo_title: row.seo_title,
                            seo_description: row.seo_description,
                            seo_keywords: row.seo_keywords,
                            about_seo_title: row.about_seo_title,
                            about_seo_description: row.about_seo_description,
                            jobs_seo_title: row.jobs_seo_title,
                            jobs_seo_description: row.jobs_seo_description,
                            is_verified: row.is_verified,
                            is_active: row.is_active,
                            created_at: row.created_at,
                            updated_at: row.updated_at,
                            jobIds: []
                        });
                    }
                    // Add job IDs
                    if (row.jobs && Array.isArray(row.jobs)) {
                        row.jobs.forEach((job: any) => {
                            if (job.id && !companiesMap.get(row.id).jobIds.includes(job.id)) {
                                companiesMap.get(row.id).jobIds.push(job.id);
                            }
                        });
                    }
                });

                // Convert to array and add job count, then sort
                const companiesWithJobCount = Array.from(companiesMap.values()).map(company => ({
                    ...company,
                    jobCount: company.jobIds.length
                })).sort((a, b) => b.jobCount - a.jobCount);

                if (error) throw error;
                console.log('✅ Axtarış nəticəsi:', data?.length || 0);

                // Search zamanı bütün nəticələri göstər
                setAllCompanies(companiesWithJobCount as any);
                setCompanies(companiesWithJobCount as any);
                setHasMore(false);
                setLoading(false); // Search zamanı da loading-i söndür
            } else {
                console.log('⚡ İLK 15 ŞİRKƏTİ ANINDA YÜKLƏYİRİK');

                // İlk 15 şirkəti anında yüklə - elan sayına görə sıralı
                const { data: initialData, error: initialError } = await supabase
                    .from('companies')
                    .select(`
            id, name, slug, logo, background_image, description, website, email, phone, address, seo_title, seo_description, seo_keywords, about_seo_title, about_seo_description, jobs_seo_title, jobs_seo_description, is_verified, is_active, created_at, updated_at,
            jobs!company_id(id)
          `)
                    .eq('is_active', true);

                // Create unique companies with job counts
                const companiesMap = new Map();
                initialData?.forEach(row => {
                    if (!companiesMap.has(row.id)) {
                        companiesMap.set(row.id, {
                            id: row.id,
                            name: row.name,
                            slug: row.slug,
                            logo: row.logo,
                            background_image: row.background_image,
                            description: row.description,
                            website: row.website,
                            email: row.email,
                            phone: row.phone,
                            address: row.address,
                            seo_title: row.seo_title,
                            seo_description: row.seo_description,
                            seo_keywords: row.seo_keywords,
                            about_seo_title: row.about_seo_title,
                            about_seo_description: row.about_seo_description,
                            jobs_seo_title: row.jobs_seo_title,
                            jobs_seo_description: row.jobs_seo_description,
                            is_verified: row.is_verified,
                            is_active: row.is_active,
                            created_at: row.created_at,
                            updated_at: row.updated_at,
                            jobIds: []
                        });
                    }
                    // Add job IDs
                    if (row.jobs && Array.isArray(row.jobs)) {
                        row.jobs.forEach((job: any) => {
                            if (job.id && !companiesMap.get(row.id).jobIds.includes(job.id)) {
                                companiesMap.get(row.id).jobIds.push(job.id);
                            }
                        });
                    }
                });

                // Count jobs and sort by count descending, then take first 15
                const sortedInitial = Array.from(companiesMap.values())
                    .map(company => ({
                        ...company,
                        jobCount: company.jobIds.length
                    }))
                    .sort((a, b) => b.jobCount - a.jobCount)
                    .slice(0, 15);

                if (initialError) throw initialError;

                console.log(`✅ İlk batch: ${sortedInitial?.length || 0} şirkət anında yükləndi`);

                // İlk şirkətləri anında göstər
                setCompanies(sortedInitial as any);
                setLoading(false); // Loading-i burada söndür

                // Background-da qalan şirkətləri yüklə
                console.log('🔄 Background-da qalan şirkətlər yüklənir...');
                loadRemainingCompaniesInBackground(sortedInitial as any);
            }

        } catch (error) {
            console.error('❌ XƏTA:', error);
            setAllCompanies([]);
            setCompanies([]);
            setLoading(false);
        }
    };

    // Background-da qalan şirkətləri yüklə
    const loadRemainingCompaniesInBackground = async (initialCompanies: Company[]) => {
        try {
            console.log('📊 Background-da BÜTÜN ŞİRKƏTLƏRİ YÜKLƏYİRİK');

            let allCompaniesData: Company[] = [...initialCompanies];
            let pageSize = 1000;
            let currentPage = 0;
            let hasMoreData = true;
            let offset = 15; // İlk 15-i artıq yüklədik

            while (hasMoreData) {
                console.log(`📖 Background səhifə ${currentPage + 1} yüklənir...`);

                const { data, error } = await supabase
                    .from('companies')
                    .select(`
            id, name, slug, logo, background_image, description, website, email, phone, address, seo_title, seo_description, seo_keywords, about_seo_title, about_seo_description, jobs_seo_title, jobs_seo_description, is_verified, is_active, created_at, updated_at,
            jobs!company_id(id)
          `)
                    .eq('is_active', true);

                if (error) throw error;

                console.log(`✅ Background səhifə ${currentPage + 1}: ${data?.length || 0} şirkət`);

                if (data && data.length > 0) {
                    // Create unique companies with job counts
                    const companiesMap = new Map();
                    data.forEach(row => {
                        if (!companiesMap.has(row.id)) {
                            companiesMap.set(row.id, {
                                id: row.id,
                                name: row.name,
                                slug: row.slug,
                                logo: row.logo,
                                background_image: row.background_image,
                                description: row.description,
                                website: row.website,
                                email: row.email,
                                phone: row.phone,
                                address: row.address,
                                seo_title: row.seo_title,
                                seo_description: row.seo_description,
                                seo_keywords: row.seo_keywords,
                                about_seo_title: row.about_seo_title,
                                about_seo_description: row.about_seo_description,
                                jobs_seo_title: row.jobs_seo_title,
                                jobs_seo_description: row.jobs_seo_description,
                                is_verified: row.is_verified,
                                is_active: row.is_active,
                                created_at: row.created_at,
                                updated_at: row.updated_at,
                                jobIds: []
                            });
                        }
                        // Add job IDs
                        if (row.jobs && Array.isArray(row.jobs)) {
                            row.jobs.forEach((job: any) => {
                                if (job.id && !companiesMap.get(row.id).jobIds.includes(job.id)) {
                                    companiesMap.get(row.id).jobIds.push(job.id);
                                }
                            });
                        }
                    });

                    const companiesWithCounts = Array.from(companiesMap.values()).map(company => ({
                        ...company,
                        jobCount: company.jobIds.length
                    }));

                    allCompaniesData = [...allCompaniesData, ...companiesWithCounts];
                    console.log(`📈 Background cəmi: ${allCompaniesData.length} şirkət`);
                    hasMoreData = false; // Load all at once since we're already fetching everything
                } else {
                    hasMoreData = false;
                }
            }

            console.log(`🎉 BACKGROUND TAMAMLANDI! ${allCompaniesData.length} şirkət yükləndi`);

            // Deduplicate by company id before sorting
            const uniqueMap = new Map<string, any>();
            (allCompaniesData as any[]).forEach((c) => {
                const id = c.id as string;
                const existing = uniqueMap.get(id);
                if (!existing || ((c.jobCount ?? 0) > (existing.jobCount ?? 0))) {
                    uniqueMap.set(id, c);
                }
            });
            const uniqueCompanies = Array.from(uniqueMap.values());

            // Sort all companies by job count descending
            const sortedCompanies = uniqueCompanies.sort((a: any, b: any) => (b.jobCount ?? 0) - (a.jobCount ?? 0));

            // Background yükləmə tamamlandıqda state-i yenilə
            setAllCompanies(sortedCompanies as any);

            // İlk 50 şirkəti göstər (15 + 35)
            const initialDisplayed = sortedCompanies.slice(0, COMPANIES_PER_PAGE);
            setCompanies(initialDisplayed as any);
            setDisplayPage(0);
            setHasMore(sortedCompanies.length > COMPANIES_PER_PAGE);

            console.log(`📱 Background tamamlandı: ${initialDisplayed.length} şirkət göstərilir (${sortedCompanies.length} təklifindən)`);

        } catch (error) {
            console.error('❌ Background yükləmə xətası:', error);
        }
    };

    const handleCompanyClick = (company: Company) => {
        setSelectedCompany(company);
        setSelectedJob(null);

        // Use pushState to update URL without triggering Next.js navigation/remount
        // This ensures the page doesn't "refresh" or flicker
        window.history.pushState(null, '', `/companies/${company.slug}`);

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
            const baseUrl = `/vacancies/${data.slug}?company=${selectedCompany?.slug}`;
            const urlWithReferral = getUrlWithReferral(baseUrl);
            router.push(urlWithReferral);
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
            {/* Organization Structured Data */}
            {selectedCompany && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(generateOrganizationSchema(selectedCompany))
                    }}
                />
            )}

            {/* Mobile Header */}
            <MobileHeader />

            <div className="flex-1 flex min-w-0 pb-16 xl:pb-0 pt-14 xl:pt-0">
                {/* Companies List */}
                <div className="w-full lg:w-[500px] xl:w-[580px] 2xl:w-[650px] border-r border-border animate-fade-in">
                    <div className="flex-1 flex flex-col h-full bg-background">

                        {/* Header with Search */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-background via-primary/8 to-accent/5 border-b border-border/30">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-60"></div>

                            <div className="relative space-y-3 px-[19px] py-[10px]">
                                {/* SEO Breadcrumb */}
                                {selectedCompany ? (
                                    <SEOBreadcrumb 
                                        items={[
                                            { label: "Şirkətlər", href: "/companies" },
                                            { label: selectedCompany.name }
                                        ]}
                                        visuallyHidden={true}
                                    />
                                ) : (
                                    <SEOBreadcrumb 
                                        items={[
                                            { label: "Şirkətlər" }
                                        ]}
                                        visuallyHidden={true}
                                    />
                                )}

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
                                    <Link
                                        key={company.id}
                                        href={`/companies/${company.slug}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleCompanyClick(company);
                                        }}
                                        className={`group cursor-pointer p-3 rounded-lg border transition-all duration-200 ease-smooth relative
                      hover:shadow-card-hover hover:-translate-y-0.5 animate-fade-in
                      w-full max-w-full min-w-0 min-h-[60px] flex flex-row items-start justify-between backdrop-blur-sm
                      ${selectedCompany?.id === company.id ? 'border-primary bg-gradient-to-r from-primary/20 to-primary/5 shadow-elegant ring-1 ring-primary/50' : 'bg-job-card border-border/50 hover:border-primary/40 hover:shadow-card-hover'}`}
                                        style={{
                                            animationDelay: `${index * 50}ms`
                                        }}
                                    >
                                        {/* Job Count Badge - Top Right */}
                                        <div className="absolute top-2 right-2">
                                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                                                <Briefcase className="w-3 h-3 text-primary" />
                                                <span className="text-xs font-semibold text-primary">
                                                    {(company as any).jobCount || 0}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Company Info */}
                                        <div className="flex items-center gap-3 flex-1 min-w-0 pr-16 overflow-hidden">
                                            <div className="relative flex-shrink-0">
                                                {company.logo ? (
                                                    <img
                                                        src={company.logo}
                                                        alt={company.name}
                                                        className="w-8 h-8 rounded-md object-cover"
                                                        width="32"
                                                        height="32"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-xs shadow-sm bg-gradient-primary">
                                                        {company.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0 overflow-hidden">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors duration-200 truncate flex-1 min-w-0">
                                                        {company.name}
                                                    </h3>
                                                    {company.is_verified && <VerifyBadge size={16} className="flex-shrink-0" />}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0 min-w-0">
                                                    <div className="flex items-center gap-1 min-w-0 overflow-hidden flex-1">
                                                        <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                                        <p className="text-muted-foreground text-xs truncate min-w-0">{company.address || 'Ünvan yoxdur'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
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
                                        width="800"
                                        height="192"
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20"></div>

                                {/* Company Logo - Floating */}
                                <div className="absolute bottom-6 left-6 z-10">
                                    <div className="relative">
                                        {selectedCompany.logo ? (
                                            <img
                                                src={selectedCompany.logo}
                                                alt={selectedCompany.name}
                                                className="w-28 h-28 rounded-2xl object-cover shadow-2xl border-4 border-background"
                                                width="112"
                                                height="112"
                                            />
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
                                            <div className="leading-relaxed rich-text-content" dangerouslySetInnerHTML={{
                                                __html: selectedCompany.description || `${selectedCompany.name} Azərbaycanın aparıcı şirkətlərindən biridir. 
                            Bizim missiyamız keyfiyyətli xidmətlər təqdim etmək və müştərilərimizin tələbatlarını qarşılamaqdır. 
                            Şirkətimiz innovativ yanaşmalar və peşəkar komanda ilə bazarda lider mövqe tutur.`
                                            }} />
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
                                            selectedJobId={selectedJob?.id || null}
                                            companyId={selectedCompany.id}
                                        />
                                    </>}
                                </div>
                            </div>
                        </div>
                    </div> :
                        <div className="h-full overflow-y-auto p-8">
                            <div className="max-w-3xl mx-auto">
                                <div className="text-center mb-8">
                                    <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                </div>

                                {/* SEO Content Section */}
                                <div className="text-muted-foreground">
                                    <h1 className="text-2xl font-bold text-foreground mb-4">Şirkətlər və İş Elanları 2026</h1>
                                    <p className="mb-4 text-sm leading-relaxed">
                                        2026-cı il üçün şirkətlər, iş elanları və vakansiyalar üzrə ən geniş məlumat bazası burada təqdim edilir. Bu səhifədə müxtəlif sahələr üzrə fəaliyyət göstərən şirkətlər haqqında məlumat əldə edə, onların aktiv vakansiyalarına baxa və işə qəbul prosesinə dair bütün detalları görə bilərsiniz. Şirkətlər haqqında rəylər, maaş aralıqları və iş şəraiti barədə məlumatlar iş axtaranlara ən doğru qərarı verməyə kömək edir.
                                    </p>

                                    <div className="flex flex-wrap gap-3 mb-6 text-sm">
                                        <Link href="/categories" className="text-primary hover:underline">Kateqoriyalar üzrə iş elanları</Link>
                                        <Link href="/about" className="text-primary hover:underline">Haqqımızda – necə işləyirik</Link>
                                        <Link href="/services" className="text-primary hover:underline">Şirkətlər üçün qiymət paketləri</Link>
                                    </div>

                                    <h2 className="text-lg font-semibold text-foreground mb-3">Populyar şirkətlər və aktiv vakansiyalar</h2>
                                    <p className="mb-4 text-sm">Azərbaycanın ən nüfuzlu şirkətlərində karyera qurmaq şansı.</p>

                                    <h2 className="text-lg font-semibold text-foreground mb-3">2026 üzrə ən çox vakansiya təqdim edən şirkətlər</h2>
                                    <p className="mb-6 text-sm">İş axtarışınızı sürətləndirmək üçün ən aktiv işəgötürənləri izləyin.</p>

                                    {/* FAQ Section with Schema */}
                                    <div className="space-y-4 mt-8">
                                        <h3 className="text-lg font-bold text-foreground">Tez-tez verilən suallar</h3>

                                        <div className="space-y-2">
                                            <h4 className="font-medium text-foreground text-sm">Şirkət vakansiyalarını necə tapa bilərəm?</h4>
                                            <p className="text-sm">Şirkətlərin səhifəsinə daxil olub vakansiyalar bölməsindən bütün iş elanlarına baxa bilərsiniz.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="font-medium text-foreground text-sm">Şirkətlərə birbaşa CV göndərə bilərəm?</h4>
                                            <p className="text-sm">Xeyr. Hər bir şirkətin profilində yerləşən “İş elanlarına” baxaraq “Müraciət et” düyməsi ilə birbaşa müraciət edə bilərsiniz.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="font-medium text-foreground text-sm">Şirkətlərin işə qəbul prosesi nə qədər çəkir?</h4>
                                            <p className="text-sm">Şirkətdən şirkətə fərqlənir, lakin adətən 3–7 gün ərzində ilkin cavab verilir. Böyük şirkətlərdə proses daha çox mərhələli ola bilər.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="font-medium text-foreground text-sm">Şirkət haqqında öyrənmək mümkündürmü?</h4>
                                            <p className="text-sm">Şirkət profili altında haqqında bölməsinə keçid edərək şirkət məlumatlarına baxa bilərsiniz.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="font-medium text-foreground text-sm">Ən çox vakansiya təqdim edən şirkətləri haradan görə bilərəm?</h4>
                                            <p className="text-sm">Bu səhifədəki “Ən Çox Vakansiya Təklif Edən Şirkətlər” elan sayına görə sıralanıb. Bu səyfəyə baxaraq 2026-cı ilin trend şirkətlərini görə bilərsiniz.</p>
                                        </div>
                                    </div>

                                    <script
                                        type="application/ld+json"
                                        dangerouslySetInnerHTML={{
                                            __html: JSON.stringify({
                                                "@context": "https://schema.org",
                                                "@type": "FAQPage",
                                                "mainEntity": [
                                                    {
                                                        "@type": "Question",
                                                        "name": "Şirkət vakansiyalarını necə tapa bilərəm?",
                                                        "acceptedAnswer": {
                                                            "@type": "Answer",
                                                            "text": "Şirkətlərin səhifəsinə daxil olub vakansiyalar bölməsindən bütün iş elanlarına baxa bilərsiniz."
                                                        }
                                                    },
                                                    {
                                                        "@type": "Question",
                                                        "name": "Şirkətlərə birbaşa CV göndərə bilərəm?",
                                                        "acceptedAnswer": {
                                                            "@type": "Answer",
                                                            "text": "Xeyr. Hər bir şirkətin profilində yerləşən “İş elanlarına” baxaraq “Müraciət et” düyməsi ilə birbaşa müraciət edə bilərsiniz."
                                                        }
                                                    },
                                                    {
                                                        "@type": "Question",
                                                        "name": "Şirkətlərin işə qəbul prosesi nə qədər çəkir?",
                                                        "acceptedAnswer": {
                                                            "@type": "Answer",
                                                            "text": "Şirkətdən şirkətə fərqlənir, lakin adətən 3–7 gün ərzində ilkin cavab verilir. Böyük şirkətlərdə proses daha çox mərhələli ola bilər."
                                                        }
                                                    },
                                                    {
                                                        "@type": "Question",
                                                        "name": "Şirkət haqqında öyrənmək mümkündürmü?",
                                                        "acceptedAnswer": {
                                                            "@type": "Answer",
                                                            "text": "Şirkət profili altında haqqında bölməsinə keçid edərək şirkət məlumatlarına baxa bilərsiniz."
                                                        }
                                                    },
                                                    {
                                                        "@type": "Question",
                                                        "name": "Ən çox vakansiya təqdim edən şirkətləri haradan görə bilərəm?",
                                                        "acceptedAnswer": {
                                                            "@type": "Answer",
                                                            "text": "Bu səhifədəki “Ən Çox Vakansiya Təklif Edən Şirkətlər” elan sayına görə sıralanıb. Bu səyfəyə baxaraq 2026-cı ilin trend şirkətlərini görə bilərsiniz."
                                                        }
                                                    }
                                                ]
                                            })
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>

            {/* Mobile Company Profile */}
            {
                isMobileOrTablet && selectedCompany && showMobileProfile && (
                    <CompanyProfile
                        company={selectedCompany}
                        onClose={() => setShowMobileProfile(false)}
                        isMobile={true}
                    />
                )
            }


        </div >
    );
};

export default CompaniesClient;
