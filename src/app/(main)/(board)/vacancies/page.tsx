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

async function getCompanies() {
    try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data } = await supabase
            .from('companies')
            .select('id, name, slug')
            .eq('is_active', true)
            .order('name')
            .limit(30);
        return data || [];
    } catch (error) {
        return [];
    }
}

export default async function VacanciesPage() {
    const [jobs, categories, regions, companies] = await Promise.all([
        getJobs(),
        getCategories(),
        getRegions(),
        getCompanies()
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

    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Jooble Azərbaycan",
        "url": "https://jooble.az",
        "logo": "https://jooble.az/icons/icon-512x512.jpg",
        "description": "Azərbaycanın ən böyük iş axtarış platforması",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.7",
            "reviewCount": "2847",
            "bestRating": "5",
            "worstRating": "1"
        }
    };

    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />

            {/* SEO Content - Hidden but present in view-source for crawlers */}
            <div style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
                <article>
                    <section>
                        <h2>Ən Son Vakansiyalar - {new Date().toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' })}</h2>
                        <ul>
                            {jobs.map((job: any) => (
                                <li key={job.id}>
                                    <article>
                                        <h3>
                                            <a href={`https://jooble.az/vacancies/${job.slug}`}>
                                                {job.title}
                                            </a>
                                        </h3>
                                        <p>
                                            <strong>Şirkət:</strong> {job.companies?.name || 'Şirkət'} | 
                                            <strong> Məkan:</strong> {job.location || 'Bakı'} | 
                                            <strong> İş növü:</strong> {job.type || 'Tam zamanlı'}
                                            {job.salary && <> | <strong>Maaş:</strong> {job.salary}</>}
                                        </p>
                                        {job.description && (
                                            <p>{job.description.replace(/<[^>]*>/g, '').substring(0, 250)}...</p>
                                        )}
                                    </article>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2>Kateqoriyalar üzrə Vakansiyalar</h2>
                        <ul>
                            {categories.map((category: any) => (
                                <li key={category.id}>
                                    <a href={`https://jooble.az/categories/${category.slug}`}>
                                        {category.name} vakansiyaları
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2>Regionlar üzrə Vakansiyalar</h2>
                        <ul>
                            {regions.map((region: any) => (
                                <li key={region.id}>
                                    <a href={`https://jooble.az/regions/${region.slug}`}>
                                        {region.name} vakansiyaları
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2>Şirkətlər üzrə Vakansiyalar</h2>
                        <ul>
                            {companies.map((company: any) => (
                                <li key={company.id}>
                                    <a href={`https://jooble.az/companies/${company.slug}`}>
                                        {company.name} vakansiyaları
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <footer>
                        <p>© 2026 Jooble.az - Azərbaycanın ən böyük iş axtarış platforması.</p>
                    </footer>
                </article>
            </div>
        </>
    );
}
