import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://igrtzfvphltnoiwedbtz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTQzMDYsImV4cCI6MjA2Nzc5MDMwNn0.afoeynzfpIZMqMRgpD0fDQ_NdULXEML-LZ-SocnYKp0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Props = {
    params: { jobSlug: string }
};

// Helper to check if job is expired
function isJobExpired(expirationDate?: string | null): boolean {
    if (!expirationDate) return false;
    return new Date(expirationDate) <= new Date();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { data: job } = await supabase
        .from('jobs')
        .select('id, title, seo_title, seo_description, seo_keywords, expiration_date, is_active, companies(name, logo)')
        .eq('slug', params.jobSlug)
        .maybeSingle();

    // If job doesn't exist, return minimal metadata (will redirect anyway)
    if (!job) {
        return {
            title: 'Vakansiya tapılmadı | Jooble.az',
            description: 'Bu vakansiya mövcud deyil. Ən son iş elanları üçün Jooble.az-a daxil olun.',
            robots: { index: false, follow: true },
        };
    }

    // Check if job is expired or inactive
    const expired = !job.is_active || isJobExpired(job.expiration_date);
    const companyName = (job.companies as any)?.name || '';
    const companyLogo = (job.companies as any)?.logo;
    const ogImage = companyLogo || 'https://jooble.az/icons/icon-512x512.jpg';

    // For expired jobs, create unique SEO with "archived" indication
    if (expired) {
        const expiredTitle = `${job.title} - ${companyName} (Arxiv) | Jooble.az`;
        const expiredDescription = `Bu vakansiya artıq aktiv deyil. ${job.title} - ${companyName} vakansiyası arxivləşdirilib. Oxşar iş elanları üçün Jooble.az-da axtarış edin.`;
        
        return {
            title: expiredTitle,
            description: expiredDescription,
            keywords: job.seo_keywords,
            robots: { index: false, follow: true }, // Don't index expired jobs
            openGraph: {
                type: 'website',
                url: `https://jooble.az/vacancies/${params.jobSlug}`,
                title: expiredTitle,
                description: expiredDescription,
                siteName: 'Jooble.az',
                images: [
                    {
                        url: ogImage,
                        width: 800,
                        height: 600,
                        alt: `${job.title} - Arxivləşdirilmiş vakansiya`,
                    }
                ],
            },
            twitter: {
                card: 'summary_large_image',
                title: expiredTitle,
                description: expiredDescription,
                images: [ogImage],
            },
            alternates: {
                canonical: `https://jooble.az/vacancies/${params.jobSlug}`,
            },
        };
    }

    // Active job - use full SEO data
    const title = job.seo_title || `${job.title} - ${companyName} | Jooble.az`;
    const description = job.seo_description || `${job.title} vakansiyası ${companyName} şirkətində. İndi müraciət edin!`;

    return {
        title,
        description,
        keywords: job.seo_keywords,
        openGraph: {
            type: 'website',
            url: `https://jooble.az/vacancies/${params.jobSlug}`,
            title,
            description,
            siteName: 'Jooble.az',
            images: [
                {
                    url: ogImage,
                    width: 800,
                    height: 600,
                    alt: job.seo_title || job.title,
                }
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImage],
        },
        alternates: {
            canonical: `https://jooble.az/vacancies/${params.jobSlug}`,
        },
    };
}

export default async function JobPage({ params }: Props) {
    const { data: job } = await supabase
        .from('jobs')
        .select('id, slug')
        .eq('slug', params.jobSlug)
        .maybeSingle();

    // If job doesn't exist, redirect to /vacancies
    if (!job) {
        redirect('/vacancies');
    }

    // Job exists - render null (JobDetails handles the UI)
    return null;
}
