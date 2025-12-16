"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Tag, TrendingUp, Search } from 'lucide-react';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import JobListings from '@/components/JobListings';
import JobDetails from '@/components/JobDetails';
import { Job } from '@/types/job';
import { generatePageSEO, updatePageMeta } from '@/utils/seo';
import MobileHeader from '@/components/MobileHeader';
import { useReferralCode } from '@/hooks/useReferralCode';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';


type Category = Tables<'categories'>;

const CategoriesClient = () => {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const categorySlug = params?.category as string | undefined;
    const jobSlug = params?.jobSlug as string | undefined;

    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
    const [jobData, setJobData] = useState<any>(null);
    const { getUrlWithReferral } = useReferralCode();

    // Fetch categories from database
    useEffect(() => {
        fetchCategories();
    }, []);

    // Default SEO setup for main categories page
    useEffect(() => {
        if (!categorySlug && !jobSlug) {
            const updateSEO = async () => {
                const seoData = await generatePageSEO('categories');
                updatePageMeta(seoData);
            };
            updateSEO();
        }
    }, [categorySlug, jobSlug]);

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

    // Find selected category from URL slug
    const selectedCategoryName = categorySlug && categories.length > 0
        ? categories.find(cat => cat.slug === categorySlug)?.name || ''
        : '';

    // Set current category for dynamic SEO
    useEffect(() => {
        if (categorySlug && categories.length > 0) {
            const category = categories.find(cat => cat.slug === categorySlug);
            setCurrentCategory(category || null);
        } else {
            setCurrentCategory(null);
        }
    }, [categorySlug, categories]);

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
                    // Also set selected job for display
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
            if (!jobSlug) setSelectedJob(null);
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
        router.push(`/categories/${category.slug}`);
    };

    const handleJobSelect = async (job: Job) => {
        // Update URL and state without scrolling or full page reload
        if (job.slug) {
            const baseUrl = `/categories/${categorySlug || 'all'}/vacancy/${job.slug}`;
            const urlWithReferral = getUrlWithReferral(baseUrl);
            router.push(urlWithReferral, { scroll: false });
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

    return (
        <div className="h-full flex bg-gradient-to-br from-background via-primary/3 to-background overflow-hidden">
            {/* Mobile Header */}
            <MobileHeader />

            <div className="flex-1 flex min-w-0 pb-16 xl:pb-0 pt-14 xl:pt-0">
                {/* Categories List */}
                <div className="w-full lg:w-[500px] xl:w-[580px] 2xl:w-[650px] border-r border-border animate-fade-in">
                    <div className="flex-1 flex flex-col h-full bg-background">

                        {/* Header with Search */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-background via-primary/8 to-accent/5 border-b border-border/30">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-60"></div>

                            <div className="relative space-y-3 my-0 px-[16px] py-[4px]">
                                <div className="flex items-center gap-2">



                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Kateqoriyalar axtarın..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                                </div>
                            </div>
                        </div>

                        {/* Categories List */}
                        <div className="flex-1 overflow-y-auto p-2 bg-gradient-to-b from-transparent to-primary/5 w-full max-w-[100%] mx-auto">
                            <div className="flex flex-col gap-2 justify-center items-center w-full max-w-full px-2">
                                {filteredCategories.map((category, index) => (
                                    <div key={category.id} onClick={() => handleCategoryClick(category)} className={`group cursor-pointer p-3 rounded-lg border transition-all duration-200 ease-smooth
                      hover:shadow-card-hover hover:-translate-y-0.5 animate-fade-in
                      w-full max-w-full min-w-0 h-[60px] flex flex-row items-center justify-between backdrop-blur-sm
                      ${selectedCategoryName === category.name ? 'border-primary bg-gradient-to-r from-primary/20 to-primary/5 shadow-elegant ring-1 ring-primary/50' : 'bg-job-card border-border/50 hover:border-primary/40 hover:shadow-card-hover'}`} style={{
                                            animationDelay: `${index * 50}ms`
                                        }}>
                                        {/* Left Section - Category Info */}
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

                                        {/* Right Section - Category Icon */}
                                        <div className="flex items-center gap-2 flex-shrink-0 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3 text-primary" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section - Filtered Jobs or Job Details */}
                <div className="hidden lg:block flex-1 bg-gradient-to-br from-job-details to-primary/3 animate-slide-in-right">
                    {selectedJob ? <JobDetails jobId={selectedJob.id} /> : selectedCategoryName ? <JobListings selectedJobId={null} onJobSelect={handleJobSelect} selectedCategory={selectedCategoryName} showHeader={false} /> : <div className="h-full flex items-center justify-center p-8">
                        <div className="text-center max-w-2xl mx-auto">
                            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                <Tag className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground mb-4">İş Kateqoriyaları və Vakansiyalar</h2>
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
                    </div>}
                </div>
            </div>


        </div>
    );
};

export default CategoriesClient;
