"use client";

import { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { useSearchParams, useParams, useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types/job';
import JobListings from '@/components/JobListings';

import MobileHeader from '@/components/MobileHeader';
import AdBanner from '@/components/AdBanner';
import { useReferralCode } from '@/hooks/useReferralCode';
import PushNotificationBanner from '@/components/PushNotificationBanner';
import SEOBreadcrumb from '@/components/SEOBreadcrumb';

// Lazy load JobDetails for better performance
const JobDetails = lazy(() => import('@/components/JobDetails'));

interface Category {
    id: string;
    name: string;
    slug: string;
}

const HomeClient = () => {
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [savedScrollPosition, setSavedScrollPosition] = useState<number>(0);
    const searchParams = useSearchParams();
    const params = useParams();
    const jobSlug = params?.jobSlug as string | undefined;
    const router = useRouter();
    const pathname = usePathname();
    const { getUrlWithReferral } = useReferralCode();

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase
                .from('categories')
                .select('id, name, slug')
                .eq('is_active', true)
                .order('name');

            if (data) setCategories(data);
        };

        fetchCategories();
    }, []);

    // Referral click logging
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const code = searchParams.get('ref');
        if (!code) return;
        const key = `ref_seen_${code}`;
        if (localStorage.getItem(key)) return;
        localStorage.setItem(key, '1');
        (async () => {
            try {
                await (supabase.rpc as any)('log_referral_click' as any, { code, ua: navigator.userAgent } as any);
            } catch (e) {
                // ignore
            }
        })();
    }, [searchParams]);

    // Check for category and company filters from URL
    useEffect(() => {
        const categorySlug = searchParams.get('category');
        const companySlug = searchParams.get('company');

        if (categorySlug && categories.length > 0) {
            const category = categories.find(c => c.slug === categorySlug);
            if (category) {
                setSelectedCategory(category.name);
            }
        }

        if (companySlug) {
            setSelectedCompany(companySlug);
        }
    }, [searchParams, categories]);

    const [selectedCompany, setSelectedCompany] = useState<string>('');

    // Fetch job by slug from URL
    useEffect(() => {
        if (jobSlug) {
            const fetchJobBySlug = async () => {
                const { data, error } = await supabase
                    .from('jobs')
                    .select(`
            id, application_type, salary, company_id, title, is_active, updated_at, type, location, seo_keywords, seo_description, views, category_id, seo_title, created_at, slug, application_url, tags, description,
            companies (name, logo, is_verified),
            categories (name)
          `)
                    .eq('slug', jobSlug)
                    .eq('is_active', true)
                    .single();

                if (data && !error) {
                    const transformedJob = {
                        id: data.id,
                        title: data.title,
                        company: data.companies?.name || '',
                        company_id: data.company_id || undefined,
                        companyLogo: data.companies?.logo || undefined,
                        location: data.location,
                        type: data.type as 'full-time' | 'part-time' | 'contract' | 'internship',
                        salary: data.salary || undefined,
                        description: data.description,
                        tags: (data.tags || []).filter((tag: string) =>
                            ['premium', 'new', 'urgent', 'remote'].includes(tag)
                        ) as ('premium' | 'new' | 'urgent' | 'remote')[],
                        views: data.views,
                        postedAt: formatDate(data.created_at),
                        category: data.categories?.name || '',
                        applicationUrl: data.application_url || undefined
                    };
                    setSelectedJob(transformedJob);
                }
            };

            fetchJobBySlug();
        } else {
            setSelectedJob(null);
        }
    }, [jobSlug]);

    // Clear selected job when navigating to home page (e.g., clicking logo)
    useEffect(() => {
        if (pathname === '/' && selectedJob) {
            setSelectedJob(null);
        }
    }, [pathname, selectedJob]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Bu gün';
        if (diffDays === 2) return 'Dünən';
        if (diffDays <= 7) return `${diffDays - 1} gün əvvəl`;
        if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} həftə əvvəl`;
        return `${Math.ceil(diffDays / 30)} ay əvvəl`;
    };

    const handleJobSelect = useCallback((job: Job) => {
        // Update URL and state without scrolling or full page reload
        if (job.slug) {
            const urlWithReferral = getUrlWithReferral(`/vacancies/${job.slug}`);
            router.push(urlWithReferral, { scroll: false });
        }
        setSelectedJob(job);
    }, [router, getUrlWithReferral]);

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category === selectedCategory ? '' : category);
        setSelectedJob(null);
    };

    // Generate organization schema for vacancies page with aggregate rating
    const generateVacanciesOrganizationSchema = () => {
        return {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Jooble Azərbaycan",
            "description": "Azərbaycan'ın ən böyük iş axtarış platforması. Müxtəlif sahələrdə minlərlə vakansiya və iş elanı.",
            "url": typeof window !== 'undefined' ? window.location.origin : '',
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.7",
                "reviewCount": "2847",
                "bestRating": "5",
                "worstRating": "1"
            }
        };
    };

    const generateOrganizationSchema = () => {
        return {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Jooble Azərbaycan",
            "description": "Azərbaycan'ın ən böyük iş axtarış platforması. Müxtəlif sahələrdə minlərlə vakansiya və iş elanı.",
            "url": typeof window !== 'undefined' ? window.location.origin : '',
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "3521",
                "bestRating": "5",
                "worstRating": "1"
            }
        };
    };

    return (
        <div className="h-full flex bg-gradient-to-br from-background via-primary/3 to-background overflow-hidden">
            {/* Organization Structured Data for Homepage */}
            {!jobSlug && pathname === '/' && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(generateOrganizationSchema())
                    }}
                />
            )}

            {/* Organization Structured Data for Vacancies */}
            {(pathname === '/vacancies' || pathname?.startsWith('/vacancies/')) && !jobSlug && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(generateVacanciesOrganizationSchema())
                    }}
                />
            )}

            {/* Mobile Header */}
            <MobileHeader isJobPage={!!jobSlug} />

            {/* Header Advertisement */}
            <AdBanner position="header" className="hidden lg:block absolute top-0 left-72 right-0 p-3 z-10" />

            {/* Main Content Area */}
            <div className="flex-1 flex min-w-0 pb-16 xl:pb-0 pt-14 xl:pt-0 lg:pt-20">
                {/* Job Listings - Responsive Column */}
                <div className="w-full lg:w-[500px] xl:w-[580px] 2xl:w-[650px] border-r border-border animate-fade-in">
                    {/* SEO Content Section - Hidden visually but present for SEO - Only on homepage */}
                    {pathname === '/' && !jobSlug && (
                        <div className="sr-only">
                            <h2>İş elanları saytı, is elanlari və vakansiyalar platforması</h2>
                            <p>
                                Jooble.az-da minlərlə iş elanları, müxtəlif sahələr üzrə is elanları və ən son vakansiyalar sizi gözləyir.
                                Axtardığınız vakansiya üçün şəhər, sahə və əmək haqqına görə filtrlərdən istifadə edin və karyeranıza bu gün başlayın.
                            </p>
                        </div>
                    )}
                    {/* SEO Content for Vacancies page */}
                    {pathname === '/vacancies' && !jobSlug && (
                        <>
                            <SEOBreadcrumb 
                                items={[
                                    { label: "Vakansiyalar" }
                                ]} 
                                visuallyHidden={true}
                            />
                            <div className="sr-only">
                                <h2>Vakansiyalar və İş Elanları Azərbaycan</h2>
                                <p>
                                    Azərbaycanda son vakansiyalar və iş elanları. Hər gün yeni və aktiv vakansiya elanları əlavə olunur.
                                    İş axtaranların ən son iş imkanlarına müraciət edə bilər. Uyğun iş tapmaq üçün CV nizi yükləyin və
                                    iş elanları və vakansiyalara müraciət edin. Müxtəlif sahələrdə edə bilər imkanları ilə.
                                </p>
                            </div>
                        </>
                    )}
                    {/* Active Filters */}
                    {(selectedCategory || selectedCompany) && (
                        <div className="p-3 bg-primary/5 border-b border-border">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-muted-foreground">Aktiv filterlər:</span>
                                {selectedCategory && (
                                    <div className="flex items-center gap-1 bg-primary/20 text-primary text-xs px-2 py-1 rounded">
                                        <span>{selectedCategory}</span>
                                        <button
                                            onClick={() => {
                                                setSelectedCategory('');
                                                router.push('/vacancies');
                                            }}
                                            className="text-primary hover:text-primary/70"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                                {selectedCompany && (
                                    <div className="flex items-center gap-1 bg-primary/20 text-primary text-xs px-2 py-1 rounded">
                                        <span>Şirkət filtri</span>
                                        <button
                                            onClick={() => {
                                                setSelectedCompany('');
                                                router.push('/vacancies');
                                            }}
                                            className="text-primary hover:text-primary/70"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <JobListings
                        selectedJobId={selectedJob?.id || null}
                        onJobSelect={handleJobSelect}
                        selectedCategory={selectedCategory}
                        companyFilter={selectedCompany}
                    />
                </div>

                {/* Job Details - Desktop Only */}
                <div className="hidden lg:block flex-1 bg-gradient-to-br from-job-details to-primary/3 animate-slide-in-right">
                    <Suspense fallback={
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    }>
                        <JobDetails jobId={selectedJob?.id || null} />
                    </Suspense>

                    {/* Content Advertisement */}
                    <div className="p-4">
                        <AdBanner position="content" />
                    </div>
                </div>
            </div>

            {/* Mobile Job Details Modal */}
            {selectedJob && (
                <div className="lg:hidden fixed inset-0 bg-background z-40 flex flex-col animate-slide-in-right">
                    <MobileHeader
                        showCloseButton={true}
                        onClose={() => {
                            setSelectedJob(null);
                            router.push('/');
                        }}
                        isJobPage={true}
                    />
                    <div className="flex-1 overflow-y-auto pb-20">
                        <Suspense fallback={
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        }>
                            <JobDetails jobId={selectedJob?.id || null} isMobile={true} primaryHeading={false} />
                        </Suspense>
                    </div>
                </div>
            )}

            {/* Footer Advertisement */}
            <AdBanner position="footer" className="hidden lg:block absolute bottom-0 left-72 right-0 p-3 bg-background/90 backdrop-blur-sm border-t border-border" />

            {/* Push Notification Banner */}
            <PushNotificationBanner />


        </div>
    );
};

export default HomeClient;
