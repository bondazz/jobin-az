import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import HomeClient from '@/components/HomeClient';

const supabaseUrl = 'https://igrtzfvphltnoiwedbtz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTQzMDYsImV4cCI6MjA2Nzc5MDMwNn0.afoeynzfpIZMqMRgpD0fDQ_NdULXEML-LZ-SocnYKp0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const metadata: Metadata = {
    title: {
        absolute: "İş Elanları və Vakansiyalar 2026 | Ən Son İş İmkanları – Jooble"
    },
    description: "2026 iş elanları və vakansiyalar - minlərlə yenilənən iş imkanlarını bir yerdə tapın. Socar vakansiyalar, bakı iş elanları və sahə üzrə ən dəqiq filtrli iş axtarışı.",
    keywords: "iş elanları 2026 Azərbaycan, vakansiyalar 2026, Bakıda iş elanları, ən son iş imkanları, yeni vakansiyalar, CV ilə iş müraciəti, təcrübəçi və tələbə işləri, uzaqdan iş elanları, yüksək maaşlı vakansiyalar, is elanlari",
    alternates: {
        canonical: 'https://jooble.az',
    },
};

// Helper function to format dates
function formatDate(dateString: string): string {
    const BAKU_OFFSET = 4 * 60;
    const jobDate = new Date(dateString);
    const jobBakuTime = new Date(jobDate.getTime() + BAKU_OFFSET * 60 * 1000);
    const now = new Date();
    const nowBakuTime = new Date(now.getTime() + BAKU_OFFSET * 60 * 1000);
    const jobDay = new Date(jobBakuTime.getFullYear(), jobBakuTime.getMonth(), jobBakuTime.getDate());
    const today = new Date(nowBakuTime.getFullYear(), nowBakuTime.getMonth(), nowBakuTime.getDate());
    const diffTime = today.getTime() - jobDay.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Bu gün';
    if (diffDays === 1) return 'Dünən';
    if (diffDays <= 7) return `${diffDays} gün əvvəl`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} həftə əvvəl`;
    return `${Math.ceil(diffDays / 30)} ay əvvəl`;
}

// Server-side data fetching
async function getInitialJobs() {
    const selectFields = `
        id, title, location, type, salary, tags, views, created_at, company_id, expiration_date, slug,
        companies(id, name, logo, is_verified, slug),
        categories(name)
    `;

    const now = new Date().toISOString();

    // Fetch premium and regular jobs
    const [premiumResult, regularResult, categoriesResult] = await Promise.all([
        supabase
            .from('jobs')
            .select(selectFields)
            .eq('is_active', true)
            .or(`expiration_date.is.null,expiration_date.gt.${now}`)
            .overlaps('tags', ['premium'])
            .order('created_at', { ascending: false }),
        supabase
            .from('jobs')
            .select(selectFields)
            .eq('is_active', true)
            .or(`expiration_date.is.null,expiration_date.gt.${now}`)
            .range(0, 24)
            .order('created_at', { ascending: false }),
        supabase
            .from('categories')
            .select('id, name, slug')
            .eq('is_active', true)
            .order('name')
    ]);

    const transform = (data: any[] | null) => (data || []).map((job: any) => ({
        id: job.id,
        slug: job.slug,
        title: job.title,
        company: job.companies?.name || '',
        company_id: job.company_id || undefined,
        companyLogo: job.companies?.logo || undefined,
        companySlug: job.companies?.slug || undefined,
        isVerified: job.companies?.is_verified || false,
        location: job.location,
        type: job.type as 'full-time' | 'part-time' | 'contract' | 'internship',
        salary: job.salary || undefined,
        description: '',
        tags: (job.tags || []).filter((tag: string) => 
            tag === 'premium' || tag === 'new' || tag === 'urgent' || tag === 'remote'
        ) as ('premium' | 'new' | 'urgent' | 'remote')[],
        views: job.views,
        postedAt: formatDate(job.created_at),
        created_at: job.created_at,
        category: job.categories?.name || '',
        applicationUrl: '',
        applicationType: 'website' as const,
        applicationEmail: '',
        expiration_date: job.expiration_date
    }));

    const premiumJobs = transform(premiumResult.data);
    const regularJobs = transform(regularResult.data);

    // Merge and deduplicate
    const seen = new Set<string>();
    const mergedJobs: any[] = [];
    for (const job of [...premiumJobs, ...regularJobs]) {
        if (!seen.has(job.id)) {
            seen.add(job.id);
            mergedJobs.push(job);
        }
    }

    return {
        jobs: mergedJobs,
        categories: categoriesResult.data || []
    };
}

// SSR Job Card Component - rendered on server
function SSRJobCard({ job }: { job: any }) {
    return (
        <article 
            className="p-4 border-b border-border hover:bg-muted/50 transition-colors"
            itemScope 
            itemType="https://schema.org/JobPosting"
        >
            <meta itemProp="datePosted" content={job.created_at} />
            <meta itemProp="employmentType" content={job.type} />
            
            <div className="flex items-start gap-3">
                {job.companyLogo && (
                    <img 
                        src={job.companyLogo} 
                        alt={`${job.company} logo`}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        loading="lazy"
                    />
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate" itemProp="title">
                        <a href={`/vacancies/${job.slug}`} className="hover:text-primary">
                            {job.title}
                        </a>
                    </h3>
                    <div itemProp="hiringOrganization" itemScope itemType="https://schema.org/Organization">
                        <p className="text-sm text-muted-foreground" itemProp="name">{job.company}</p>
                    </div>
                    <div itemProp="jobLocation" itemScope itemType="https://schema.org/Place">
                        <p className="text-xs text-muted-foreground mt-1">
                            <span itemProp="address">{job.location}</span> • {job.postedAt}
                        </p>
                    </div>
                    {job.salary && (
                        <p className="text-xs text-primary mt-1" itemProp="baseSalary">{job.salary}</p>
                    )}
                </div>
            </div>
        </article>
    );
}

export default async function HomePage() {
    const { jobs, categories } = await getInitialJobs();

    // Generate JobPosting structured data for first 10 jobs
    const jobPostingsSchema = jobs.slice(0, 10).map(job => ({
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": job.title,
        "description": job.title,
        "datePosted": job.created_at,
        "employmentType": job.type === 'full-time' ? 'FULL_TIME' : job.type === 'part-time' ? 'PART_TIME' : job.type === 'internship' ? 'INTERN' : 'CONTRACTOR',
        "jobLocation": {
            "@type": "Place",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": job.location,
                "addressCountry": "AZ"
            }
        },
        "hiringOrganization": {
            "@type": "Organization",
            "name": job.company
        },
        "url": `https://jooble.az/vacancies/${job.slug}`
    }));

    return (
        <>
            {/* Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        "name": "Jooble Azərbaycan",
                        "url": "https://jooble.az",
                        "potentialAction": {
                            "@type": "SearchAction",
                            "target": "https://jooble.az/vacancies?q={search_term_string}",
                            "query-input": "required name=search_term_string"
                        }
                    })
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(jobPostingsSchema)
                }}
            />

            {/* SSR SEO Content - VISIBLE in View Page Source */}
            <div className="container mx-auto px-4 py-6">
                <header className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                        İş Elanları və Vakansiyalar 2026 | Ən Son İş İmkanları
                    </h1>
                    <p className="text-muted-foreground leading-relaxed">
                        İş elanları və vakansiyalar 2026 üzrə ən son yenilikləri burada tapa bilərsiniz. 
                        Platformamız bütün sahələr üzrə gündəlik yenilənən iş imkanlarını, real şirkət vakansiyalarını 
                        və filtirlənə bilən peşə yönümlü elanları bir araya gətirir. Əgər yeni iş axtarırsınızsa, 
                        düzgün yerdəsiniz - buradan həm yerli, həm də beynəlxalq iş elanlarına rahatlıqla baxa, 
                        CV göndərə və dərhal müraciət edə bilərsiniz.
                    </p>
                </header>

                {/* SSR Job Listings - These will appear in View Page Source */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Ən Son İş Elanları 2026</h2>
                    <div className="bg-card rounded-lg border border-border overflow-hidden">
                        {jobs.slice(0, 20).map((job) => (
                            <SSRJobCard key={job.id} job={job} />
                        ))}
                    </div>
                </section>

                {/* Additional SEO Sections */}
                <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-card p-4 rounded-lg border border-border">
                        <h3 className="font-semibold mb-2">Şəhərlər üzrə iş elanları</h3>
                        <p className="text-sm text-muted-foreground">Bakı, Sumqayıt, Gəncə və digər şəhərlərdə iş elanları</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border border-border">
                        <h3 className="font-semibold mb-2">Sahələr üzrə vakansiyalar</h3>
                        <p className="text-sm text-muted-foreground">IT, maliyyə, satış, marketinq və digər sahələrdə vakansiyalar</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border border-border">
                        <h3 className="font-semibold mb-2">Tələbə və təcrübəçi işləri</h3>
                        <p className="text-sm text-muted-foreground">Tələbələr və yeni məzunlar üçün staj imkanları</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border border-border">
                        <h3 className="font-semibold mb-2">Yüksək maaşlı vakansiyalar</h3>
                        <p className="text-sm text-muted-foreground">Ən çox maaş təklif edən premium vakansiyalar</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border border-border">
                        <h3 className="font-semibold mb-2">Remote iş imkanları</h3>
                        <p className="text-sm text-muted-foreground">Evdən işləmək və uzaqdan iş elanları</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border border-border">
                        <h3 className="font-semibold mb-2">Kateqoriyalar</h3>
                        <ul className="text-sm text-muted-foreground">
                            {categories.slice(0, 5).map(cat => (
                                <li key={cat.id}>
                                    <a href={`/categories/${cat.slug}`} className="hover:text-primary">{cat.name}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <footer className="text-muted-foreground text-sm leading-relaxed mb-8">
                    <p>
                        2026-cı il üçün hazırlanan iş elanları və vakansiyalar siyahımız real vaxtda yenilənir. 
                        Hər bir elan şirkət tərəfindən təsdiqlənir və istifadəçilərə dəqiq maaş aralığı, tələblər, 
                        vəzifə təsviri və müraciət linki təqdim olunur. İstər ofisdaxili, istər remote iş axtarasınız - 
                        burada bütün vakansiyaları rahatlıqla tapa biləcəksiniz.
                    </p>
                </footer>
            </div>
            
            {/* Interactive Client Component - hydrates on top of SSR content */}
            <HomeClient initialJobs={jobs} initialCategories={categories} />
        </>
    );
}
