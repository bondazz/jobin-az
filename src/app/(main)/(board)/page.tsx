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

export default async function HomePage() {
    const { jobs, categories } = await getInitialJobs();

    return <HomeClient initialJobs={jobs} initialCategories={categories} />;
}
