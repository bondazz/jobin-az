import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://igrtzfvphltnoiwedbtz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTQzMDYsImV4cCI6MjA2Nzc5MDMwNn0.afoeynzfpIZMqMRgpD0fDQ_NdULXEML-LZ-SocnYKp0';

export const metadata: Metadata = {
    title: "Vakansiyalar | İş Elanları Azərbaycan - Jooble",
    description: "Azərbaycanda aktiv vakansiyalar və iş elanları. Müxtəlif sahələrdə iş imkanları, maaş məlumatları və şirkət təfərrüatları.",
    keywords: "vakansiyalar, iş elanları, Azərbaycan işləri, aktiv elanlar, iş axtarışı",
    alternates: {
        canonical: '/vacancies',
    },
};

async function getJobs() {
    try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data } = await supabase
            .from('jobs')
            .select(`
                id, title, slug, location, type, salary, description, created_at,
                companies:company_id(name, slug),
                categories:category_id(name, slug)
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(50);
        return data || [];
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return [];
    }
}

async function getCategories() {
    try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data } = await supabase
            .from('categories')
            .select('id, name, slug')
            .eq('is_active', true)
            .order('name');
        return data || [];
    } catch (error) {
        return [];
    }
}

async function getRegions() {
    try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data } = await supabase
            .from('regions')
            .select('id, name, slug')
            .eq('is_active', true)
            .order('name');
        return data || [];
    } catch (error) {
        return [];
    }
}

export default async function VacanciesPage() {
    const [jobs, categories, regions] = await Promise.all([
        getJobs(),
        getCategories(),
        getRegions()
    ]);

    const totalJobs = jobs.length;

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Vakansiyalar - Jooble Azərbaycan",
        "description": "Azərbaycanda aktiv vakansiyalar və iş elanları",
        "url": "https://jooble.az/vacancies",
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": totalJobs,
            "itemListElement": jobs.slice(0, 20).map((job: any, index: number) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "JobPosting",
                    "title": job.title,
                    "description": job.description?.substring(0, 200) || '',
                    "datePosted": job.created_at,
                    "hiringOrganization": {
                        "@type": "Organization",
                        "name": job.companies?.name || 'Şirkət'
                    },
                    "jobLocation": {
                        "@type": "Place",
                        "address": {
                            "@type": "PostalAddress",
                            "addressLocality": job.location || 'Bakı',
                            "addressCountry": "AZ"
                        }
                    },
                    "url": `https://jooble.az/vacancies/${job.slug}`
                }
            }))
        }
    };

    const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Ana Səhifə",
                "item": "https://jooble.az"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Vakansiyalar",
                "item": "https://jooble.az/vacancies"
            }
        ]
    };

    return (
        <>
            {/* Server-rendered SEO content */}
            <div className="sr-only" aria-hidden="true">
                <h1>Vakansiyalar - Azərbaycan İş Elanları 2026</h1>
                <p>
                    Azərbaycanda {totalJobs}+ aktiv vakansiya və iş elanı. 
                    Müxtəlif sahələrdə iş imkanları, maaş məlumatları və şirkət təfərrüatları.
                </p>

                <h2>Ən Son Vakansiyalar</h2>
                <ul>
                    {jobs.map((job: any) => (
                        <li key={job.id}>
                            <a href={`/vacancies/${job.slug}`}>
                                <strong>{job.title}</strong> - {job.companies?.name || 'Şirkət'}
                                {job.location && <span> | {job.location}</span>}
                                {job.salary && <span> | {job.salary}</span>}
                                {job.type && <span> | {job.type}</span>}
                            </a>
                            {job.description && (
                                <p>{job.description.replace(/<[^>]*>/g, '').substring(0, 150)}...</p>
                            )}
                        </li>
                    ))}
                </ul>

                <h2>Kateqoriyalar üzrə Vakansiyalar</h2>
                <ul>
                    {categories.map((category: any) => (
                        <li key={category.id}>
                            <a href={`/categories/${category.slug}`}>{category.name} vakansiyaları</a>
                        </li>
                    ))}
                </ul>

                <h2>Regionlar üzrə Vakansiyalar</h2>
                <ul>
                    {regions.map((region: any) => (
                        <li key={region.id}>
                            <a href={`/regions/${region.slug}`}>{region.name} iş elanları</a>
                        </li>
                    ))}
                </ul>

                <h2>Populyar Axtarışlar</h2>
                <ul>
                    <li><a href="/vacancies?q=tam+zamanli">Tam zamanlı iş elanları</a></li>
                    <li><a href="/vacancies?q=part+time">Part-time vakansiyalar</a></li>
                    <li><a href="/vacancies?q=remote">Uzaqdan iş imkanları</a></li>
                    <li><a href="/vacancies?q=tecrubeci">Təcrübəçi vakansiyaları</a></li>
                    <li><a href="/vacancies?q=yuksek+maasli">Yüksək maaşlı işlər</a></li>
                </ul>
            </div>

            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
            />
        </>
    );
}
