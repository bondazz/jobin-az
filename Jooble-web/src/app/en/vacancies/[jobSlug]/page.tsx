import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import HomeClient from '@/components/HomeClient';

const supabaseUrl = 'https://igrtzfvphltnoiwedbtz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTQzMDYsImV4cCI6MjA2Nzc5MDMwNn0.afoeynzfpIZMqMRgpD0fDQ_NdULXEML-LZ-SocnYKp0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Props = {
    params: { jobSlug: string }
};

function isJobExpired(expirationDate?: string | null): boolean {
    if (!expirationDate) return false;
    return new Date(expirationDate) <= new Date();
}

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { data: job } = await supabase
        .from('jobs')
        .select('id, title, seo_title, seo_description, seo_keywords, expiration_date, is_active, companies(name, logo)')
        .eq('slug', params.jobSlug)
        .maybeSingle();

    if (!job || !job.is_active || isJobExpired(job.expiration_date)) {
        redirect('/en/vacancies');
    }

    const companyName = (job.companies as any)?.name || '';
    const companyLogo = (job.companies as any)?.logo;
    const ogImage = companyLogo || 'https://jooble.az/icons/icon-512x512.jpg';
    const title = job.seo_title || `${job.title} - ${companyName} | Jooble.az`;
    const description = job.seo_description || `${job.title} vacancy at ${companyName}. Apply now!`;

    return {
        title,
        description,
        keywords: job.seo_keywords,
        openGraph: {
            type: 'website',
            url: `https://jooble.az/en/vacancies/${params.jobSlug}`,
            title,
            description,
            siteName: 'Jooble.az',
            images: [{ url: ogImage, width: 800, height: 600, alt: title }],
        },
        alternates: {
            canonical: `https://jooble.az/en/vacancies/${params.jobSlug}`,
            languages: {
                'az': `https://jooble.az/vacancies/${params.jobSlug}`,
                'en': `https://jooble.az/en/vacancies/${params.jobSlug}`,
                'ru': `https://jooble.az/ru/vacancies/${params.jobSlug}`,
                'x-default': `https://jooble.az/vacancies/${params.jobSlug}`,
            },
        },
    };
}

export default async function EnJobPage({ params }: Props) {
    const { data: job } = await supabase
        .from('jobs')
        .select(`
            id, title, slug, description, location, type, salary, 
            created_at, expiration_date, is_active, views, tags,
            companies:company_id(name, slug, logo, website, is_verified)
        `)
        .eq('slug', params.jobSlug)
        .maybeSingle();

    if (!job || !job.is_active || isJobExpired(job.expiration_date)) {
        redirect('/en/vacancies');
    }

    const company = job.companies as any;
    const companyName = company?.name || 'Company';
    const plainDescription = stripHtml(job.description || '');

    const jobPostingSchema = {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": job.title,
        "description": plainDescription,
        "datePosted": job.created_at,
        "validThrough": job.expiration_date || undefined,
        "hiringOrganization": {
            "@type": "Organization",
            "name": companyName,
            "logo": company?.logo || undefined
        },
        "jobLocation": {
            "@type": "Place",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": job.location || 'Baku',
                "addressCountry": "AZ"
            }
        },
        "url": `https://jooble.az/en/vacancies/${job.slug}`
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://jooble.az/en" },
            { "@type": "ListItem", "position": 2, "name": "Vacancies", "item": "https://jooble.az/en/vacancies" },
            { "@type": "ListItem", "position": 3, "name": job.title, "item": `https://jooble.az/en/vacancies/${job.slug}` }
        ]
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <div className="sr-only">
                <h1>{job.title} - {companyName}</h1>
                <p>Location: {job.location}</p>
                {job.salary && <p>Salary: {job.salary}</p>}
                <p>{plainDescription}</p>
            </div>
            <HomeClient />
        </>
    );
}
