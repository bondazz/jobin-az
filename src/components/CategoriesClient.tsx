"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Tag, TrendingUp, Search, ArrowLeft, Briefcase, Building2 } from 'lucide-react';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import JobListings from '@/components/JobListings';
import JobDetails from '@/components/JobDetails';
import { Job } from '@/types/job';
import { generatePageSEO, updatePageMeta, SEOMetadata } from '@/utils/seo';
import MobileHeader from '@/components/MobileHeader';
import { useReferralCode } from '@/hooks/useReferralCode';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';

const DEFAULT_OG_IMAGE = 'https://jooble.az/icons/icon-512x512.jpg';

// Helper function to update all SEO meta tags for a job
const updateJobSEO = (jobData: any) => {
    if (!jobData) return;

    const ogImage = jobData.companies?.logo || DEFAULT_OG_IMAGE;
    
    const metadata: SEOMetadata = {
        title: jobData.seo_title || `${jobData.title} | ${jobData.companies?.name || "İş Elanı"}`,
        description: jobData.seo_description || `${jobData.companies?.name || "Şirkət"}də ${jobData.title} vakansiyası`,
        keywords: jobData.seo_keywords?.join(", ") || `${jobData.title}, ${jobData.companies?.name || ""}, vakansiya, iş elanları`,
        url: `https://jooble.az/vacancies/${jobData.slug}`,
    };

    // Update basic meta tags
    updatePageMeta(metadata);

    // Update Open Graph type
    const ogTypeTag = document.querySelector('meta[property="og:type"]');
    if (ogTypeTag) {
        ogTypeTag.setAttribute('content', 'article');
    } else {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'og:type');
        meta.setAttribute('content', 'article');
        document.head.appendChild(meta);
    }

    // Update OG Image
    const ogImageTag = document.querySelector('meta[property="og:image"]');
    if (ogImageTag) {
        ogImageTag.setAttribute('content', ogImage);
    } else {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'og:image');
        meta.setAttribute('content', ogImage);
        document.head.appendChild(meta);
    }

    // Twitter Card meta tags
    const twitterTags = [
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: ogImage },
        { name: 'twitter:title', content: metadata.title },
        { name: 'twitter:description', content: metadata.description }
    ];

    twitterTags.forEach(({ name, content }) => {
        const existingTag = document.querySelector(`meta[name="${name}"]`);
        if (existingTag) {
            existingTag.setAttribute('content', content);
        } else {
            const meta = document.createElement('meta');
            meta.setAttribute('name', name);
            meta.setAttribute('content', content);
            document.head.appendChild(meta);
        }
    });

    // Update structured data (JobPosting schema)
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": jobData.title,
        "description": jobData.description,
        "datePosted": jobData.created_at,
        "validThrough": jobData.expiration_date,
        "employmentType": jobData.type === 'full-time' ? 'FULL_TIME' : jobData.type === 'part-time' ? 'PART_TIME' : jobData.type?.toUpperCase(),
        "hiringOrganization": {
            "@type": "Organization",
            "name": jobData.companies?.name || "Şirkət",
            "logo": jobData.companies?.logo || DEFAULT_OG_IMAGE
        },
        "jobLocation": {
            "@type": "Place",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": jobData.location || "Bakı",
                "addressCountry": "AZ"
            }
        },
        ...(jobData.salary && {
            "baseSalary": {
                "@type": "MonetaryAmount",
                "currency": "AZN",
                "value": {
                    "@type": "QuantitativeValue",
                    "value": jobData.salary
                }
            }
        })
    };

    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
        existingScript.textContent = JSON.stringify(structuredData);
    } else {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(structuredData);
        document.head.appendChild(script);
    }
};

type Category = Tables<'categories'>;

const CategoriesClient = () => {
    const router = useRouter();
    const params = useParams();
    const categorySlug = params?.category as string | undefined;
    const jobSlug = params?.jobSlug as string | undefined;

    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [jobData, setJobData] = useState<any>(null);
    const { getUrlWithReferral } = useReferralCode();

    // Find selected category from URL slug - computed directly without useState delay
    const selectedCategory = categorySlug && categories.length > 0
        ? categories.find(cat => cat.slug === categorySlug) || null
        : null;

    const selectedCategoryName = selectedCategory?.name || '';

    // Fetch categories from database
    useEffect(() => {
        fetchCategories();
    }, []);

    // SEO setup based on current page state
    useEffect(() => {
        const updateSEO = async () => {
            if (!categorySlug && !jobSlug) {
                // Main categories page SEO
                const seoData = await generatePageSEO('categories');
                updatePageMeta(seoData);
            } else if (categorySlug && !jobSlug && selectedCategory) {
                // Category page SEO - when loaded directly from URL
                const metadata: SEOMetadata = {
                    title: selectedCategory.seo_title || `${selectedCategory.name} Vakansiyaları | İş Elanları - Jooble.az`,
                    description: selectedCategory.seo_description || `${selectedCategory.name} sahəsində ən yeni iş elanları və vakansiyalar. Azərbaycanda ${selectedCategory.name} üzrə aktiv iş təklifləri.`,
                    keywords: selectedCategory.seo_keywords?.join(", ") || `${selectedCategory.name}, vakansiya, iş elanları, ${selectedCategory.name} işləri`,
                    url: `https://jooble.az/categories/${selectedCategory.slug}`,
                };
                updatePageMeta(metadata);
            }
        };
        updateSEO();
    }, [categorySlug, jobSlug, selectedCategory]);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    // Reset selected job when category changes
    useEffect(() => {
        if (!jobSlug && categorySlug) {
            setSelectedJob(null);
        }
    }, [categorySlug, jobSlug]);

    // Fetch job by slug for SEO
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
                    setJobData(data);
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
            setJobData(null);
        }
    }, [jobSlug]);

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

    const handleCategoryClick = (category: Category) => {
        setSelectedJob(null);
        
        // Update SEO immediately for the selected category
        const metadata: SEOMetadata = {
            title: category.seo_title || `${category.name} Vakansiyaları | İş Elanları - Jooble.az`,
            description: category.seo_description || `${category.name} sahəsində ən yeni iş elanları və vakansiyalar. Azərbaycanda ${category.name} üzrə aktiv iş təklifləri.`,
            keywords: category.seo_keywords?.join(", ") || `${category.name}, vakansiya, iş elanları, ${category.name} işləri`,
            url: `https://jooble.az/categories/${category.slug}`,
        };
        updatePageMeta(metadata);
        
        router.push(`/categories/${category.slug}`);
    };

    const handleBackToCategories = async () => {
        setSelectedJob(null);
        
        // Restore main categories page SEO
        const seoData = await generatePageSEO('categories');
        updatePageMeta(seoData);
        
        router.push('/categories');
    };

    const handleJobSelect = async (job: Job) => {
        // Navigate to vacancies page URL for proper SEO
        if (job.slug) {
            const baseUrl = `/vacancies/${job.slug}`;
            const urlWithReferral = getUrlWithReferral(baseUrl);
            // Use window.history.pushState for instant navigation without refresh
            window.history.pushState({}, '', urlWithReferral);

            // Fetch full job data for SEO and update meta tags
            try {
                const { data: jobData } = await supabase
                    .from('jobs')
                    .select(`
                        id, title, description, slug, type, location, salary, created_at, expiration_date,
                        seo_title, seo_description, seo_keywords,
                        companies:company_id(name, logo)
                    `)
                    .eq('slug', job.slug)
                    .single();

                if (jobData) {
                    updateJobSEO(jobData);
                }
            } catch (error) {
                console.error('Error fetching job SEO data:', error);
            }
        }
        setSelectedJob(job);
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Category Description Component for Right Panel
    const CategoryDescription = () => (
        <div className="h-full flex items-center justify-center p-8">
            <div className="text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    {selectedCategory?.icon ? (
                        <DynamicIcon name={selectedCategory.icon} className="w-8 h-8 text-white" />
                    ) : (
                        <Briefcase className="w-8 h-8 text-white" />
                    )}
                </div>
                <h2 className="text-xl font-bold text-foreground mb-4">{selectedCategory?.name}</h2>
                <div className="text-muted-foreground text-sm leading-relaxed space-y-3 text-left px-4">
                    <p>{selectedCategory?.description || `${selectedCategory?.name} sahəsində ən son iş elanları və vakansiyalar.`}</p>
                    <p className="text-xs pt-2">
                        Soldakı siyahıdan bir iş elanı seçin.
                    </p>
                </div>
            </div>
        </div>
    );

    // Default Welcome Component when no category selected
    const DefaultWelcome = () => (
        <div className="h-full flex items-center justify-center p-8">
            <div className="text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Tag className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-xl font-bold text-foreground mb-4">İş Elanları Kateqoriyaları - Vakansiyalar</h1>
                <div className="text-muted-foreground text-sm leading-relaxed space-y-3 text-left px-4">
                    <p>
                        Platformamızda <strong>iş elanları</strong> müxtəlif kateqoriyalara ayrılmışdır. Hər bir <strong>iş kateqoriyası</strong> üzrə yüzlərlə <strong>vakansiya</strong> təqdim edirik. IT, maliyyə, satış, marketinq, mühəndislik, insan resursları, mühasibatlıq və digər sahələrdə <strong>iş axtarışı</strong> edən peşəkarlar üçün uyğun <strong>iş təklifləri</strong> tapa bilərsiniz.
                    </p>
                    <p>
                        Müxtəlif səviyyələrdə - giriş səviyyəsi, orta səviyyə və yüksək səviyyəli <strong>iş imkanları</strong> mövcuddur. <Link href="/companies" className="text-primary hover:underline font-medium">Şirkətlərimiz</Link> səhifəsində önəmli işəgötürənlərin profillərini nəzərdən keçirə və <Link href="/about" className="text-primary hover:underline font-medium">haqqımızda</Link> bölməsində xidmətlərimiz barədə ətraflı məlumat əldə edə bilərsiniz.
                    </p>
                    <p className="text-xs pt-2">
                        <Link href="/pricing" className="text-primary hover:underline">Qiymətləndirmə</Link> və premium xüsusiyyətlər haqqında məlumat əldə edin.
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full flex bg-gradient-to-br from-background via-primary/3 to-background overflow-hidden">
            {/* Mobile Header */}
            <MobileHeader />

            <div className="flex-1 flex min-w-0 pb-16 xl:pb-0 pt-14 xl:pt-0">
                {/* Left Column - Categories List OR Job Listings */}
                <div className="w-full lg:w-[500px] xl:w-[580px] 2xl:w-[650px] border-r border-border animate-fade-in">
                    <div className="flex-1 flex flex-col h-full bg-background">
                        {/* When no category selected - Show Categories */}
                        {!categorySlug ? (
                            <>
                                {/* Header with Search */}
                                <div className="relative overflow-hidden bg-gradient-to-br from-background via-primary/8 to-accent/5 border-b border-border/30">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-60"></div>
                                    <div className="relative space-y-3 my-0 px-[16px] py-[4px]">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                placeholder="Kateqoriyalar axtarın..." 
                                                value={searchTerm} 
                                                onChange={e => setSearchTerm(e.target.value)} 
                                                className="pl-10" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Categories List */}
                                <div className="flex-1 overflow-y-auto p-2 bg-gradient-to-b from-transparent to-primary/5 w-full max-w-[100%] mx-auto">
                                    <div className="flex flex-col gap-2 justify-center items-center w-full max-w-full px-2">
                                        {filteredCategories.map((category, index) => (
                                            <div 
                                                key={category.id} 
                                                onClick={() => handleCategoryClick(category)} 
                                                className={`group cursor-pointer p-3 rounded-lg border transition-all duration-200 ease-smooth
                                                    hover:shadow-card-hover hover:-translate-y-0.5 animate-fade-in
                                                    w-full max-w-full min-w-0 h-[60px] flex flex-row items-center justify-between backdrop-blur-sm
                                                    bg-job-card border-border/50 hover:border-primary/40 hover:shadow-card-hover`} 
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="relative flex-shrink-0">
                                                        <div className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-xs shadow-sm bg-gradient-primary">
                                                            {category.icon ? (
                                                                <DynamicIcon name={category.icon} className="w-4 h-4" />
                                                            ) : (
                                                                <Tag className="w-4 h-4" />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors duration-200 truncate">
                                                            {category.name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-0">
                                                            <p className="text-muted-foreground text-xs truncate">
                                                                {category.description || 'Kateqoriya təsviri'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <TrendingUp className="w-3 h-3 text-primary" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* When category selected - Show Job Listings */}
                                {/* Minimal category filter header */}
                                <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50 bg-muted/30">
                                    <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={handleBackToCategories}
                                        className="h-7 w-7 rounded-full hover:bg-primary/10"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                    </Button>
                                    <span className="text-sm font-medium text-foreground truncate">
                                        {selectedCategory?.name || selectedCategoryName}
                                    </span>
                                </div>

                                {/* Job Listings for selected category */}
                                <JobListings 
                                    selectedJobId={selectedJob?.id || null} 
                                    onJobSelect={handleJobSelect} 
                                    selectedCategory={selectedCategoryName} 
                                    showHeader={true}
                                />
                            </>
                        )}
                    </div>
                </div>

                {/* Right Section - Category Description or Job Details */}
                <div className="hidden lg:block flex-1 bg-gradient-to-br from-job-details to-primary/3 animate-slide-in-right">
                    {selectedJob ? (
                        <JobDetails jobId={selectedJob.id} />
                    ) : categorySlug && selectedCategory ? (
                        <CategoryDescription />
                    ) : (
                        <DefaultWelcome />
                    )}
                </div>
            </div>

            {/* Mobile Job Details - Full Screen Overlay (same as vacancies page) */}
            {selectedJob && (
                <div className="lg:hidden fixed inset-0 bg-background z-40 flex flex-col animate-slide-in-right">
                    <MobileHeader
                        showCloseButton={true}
                        onClose={async () => {
                            setSelectedJob(null);
                            // Use history.pushState to avoid page refresh
                            const backUrl = categorySlug ? `/categories/${categorySlug}` : '/categories';
                            window.history.pushState({}, '', backUrl);
                            
                            // Restore category SEO when going back
                            if (selectedCategory) {
                                const metadata: SEOMetadata = {
                                    title: selectedCategory.seo_title || `${selectedCategory.name} Vakansiyaları | İş Elanları - Jooble`,
                                    description: selectedCategory.seo_description || `${selectedCategory.name} sahəsində aktiv vakansiyalar və iş elanları.`,
                                    keywords: selectedCategory.seo_keywords?.join(", ") || `${selectedCategory.name}, vakansiya, iş elanları`,
                                    url: `https://jooble.az/categories/${selectedCategory.slug}`,
                                };
                                updatePageMeta(metadata);
                            } else {
                                const seoData = await generatePageSEO('categories');
                                updatePageMeta(seoData);
                            }
                        }}
                        isJobPage={true}
                    />
                    <div className="flex-1 overflow-y-auto pb-20">
                        <Suspense fallback={
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        }>
                            <JobDetails jobId={selectedJob.id} isMobile={true} primaryHeading={false} />
                        </Suspense>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoriesClient;
