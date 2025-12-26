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

    // If job doesn't exist or is expired/inactive, redirect immediately
    if (!job || !job.is_active || isJobExpired(job.expiration_date)) {
        redirect('/vacancies');
    }

    // Active job - use full SEO data
    const companyName = (job.companies as any)?.name || '';
    const companyLogo = (job.companies as any)?.logo;
    const ogImage = companyLogo || 'https://jooble.az/icons/icon-512x512.jpg';
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
        .select('id, slug, is_active, expiration_date')
        .eq('slug', params.jobSlug)
        .maybeSingle();

    // If job doesn't exist OR is expired/inactive, redirect immediately to /vacancies
    if (!job || !job.is_active || isJobExpired(job.expiration_date)) {
        redirect('/vacancies');
    }

    // Active job exists - render null (JobDetails handles the UI)
    return null;
}
