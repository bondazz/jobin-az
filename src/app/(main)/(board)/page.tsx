import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://igrtzfvphltnoiwedbtz.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTQzMDYsImV4cCI6MjA2Nzc5MDMwNn0.afoeynzfpIZMqMRgpD0fDQ_NdULXEML-LZ-SocnYKp0';

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

// Server-side data fetching for SEO
async function getLatestJobs() {
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data } = await supabase
            .from('jobs')
            .select(`
                id, title, slug, location, type, salary, description, created_at,
                companies:company_id(name, slug),
                categories:category_id(name, slug)
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(20);
        return data || [];
    } catch (error) {
        console.error('Error fetching jobs for SEO:', error);
        return [];
    }
}

async function getCategories() {
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data } = await supabase
            .from('categories')
            .select('id, name, slug')
            .eq('is_active', true)
            .order('name');
        return data || [];
    } catch (error) {
        console.error('Error fetching categories for SEO:', error);
        return [];
    }
}

export default async function HomePage() {
    const [jobs, categories] = await Promise.all([getLatestJobs(), getCategories()]);

    // Generate JSON-LD structured data
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Jooble Azərbaycan",
        "url": "https://jooble.az",
        "description": "Azərbaycanın ən böyük iş axtarış platforması",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://jooble.az/vacancies?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };

    const jobListingSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": jobs.slice(0, 10).map((job: any, index: number) => ({
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
    };

    return (
        <>
            {/* Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jobListingSchema) }}
            />

            {/* SEO Content - Server Rendered for Google Bots */}
            <div className="sr-only" aria-hidden="false">
                <article>
                    <h1>İş Elanları və Vakansiyalar 2026 - Jooble Azərbaycan</h1>
                    <p>
                        Jooble.az-da 2026-cı il üçün ən son iş elanları və vakansiyaları tapın. 
                        Minlərlə aktiv iş imkanı, müxtəlif sahələr üzrə vakansiyalar və peşəkar karyera imkanları.
                        Bakı və Azərbaycanın bütün bölgələrində iş axtarışı aparın.
                    </p>

                    <section>
                        <h2>Ən Son İş Elanları</h2>
                        <p>Bu gün əlavə olunan yeni vakansiyalar və iş imkanları:</p>
                        <ul>
                            {jobs.map((job: any) => (
                                <li key={job.id}>
                                    <a href={`/vacancies/${job.slug}`}>
                                        <strong>{job.title}</strong> - {job.companies?.name || 'Şirkət'}
                                        {job.location && <span> | {job.location}</span>}
                                        {job.salary && <span> | {job.salary}</span>}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2>Kateqoriyalar üzrə İş Elanları</h2>
                        <p>Sahənizə uyğun iş elanlarını kateqoriya üzrə axtarın:</p>
                        <ul>
                            {categories.map((category: any) => (
                                <li key={category.id}>
                                    <a href={`/categories/${category.slug}`}>{category.name} vakansiyaları</a>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2>Niyə Jooble.az?</h2>
                        <p>
                            Jooble Azərbaycanın ən böyük iş axtarış platformasıdır. Hər gün yüzlərlə yeni vakansiya əlavə olunur.
                            İstər tam zamanlı, istər part-time, istərsə də uzaqdan iş axtarırsınızsa - bütün imkanları burada tapa bilərsiniz.
                        </p>
                        <ul>
                            <li>Gündəlik yenilənən iş elanları</li>
                            <li>Sahə və şəhər üzrə filtrləmə</li>
                            <li>Birbaşa şirkətlərə müraciət</li>
                            <li>CV yükləmə və paylaşma</li>
                            <li>Push bildirişlər ilə yeni vakansiyalardan xəbərdar olun</li>
                        </ul>
                    </section>

                    <section>
                        <h2>Populyar Axtarışlar</h2>
                        <ul>
                            <li><a href="/vacancies?q=is+elanlari">İş elanları 2026</a></li>
                            <li><a href="/vacancies?q=vakansiyalar">Vakansiyalar Bakı</a></li>
                            <li><a href="/vacancies?q=part+time">Part-time iş elanları</a></li>
                            <li><a href="/vacancies?q=remote">Uzaqdan iş imkanları</a></li>
                            <li><a href="/vacancies?q=tecrubeci">Təcrübəçi vakansiyaları</a></li>
                        </ul>
                    </section>
                </article>
            </div>
        </>
    );
}
