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

async function getRegions() {
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data } = await supabase
            .from('regions')
            .select('id, name, slug')
            .eq('is_active', true)
            .order('name');
        return data || [];
    } catch (error) {
        console.error('Error fetching regions for SEO:', error);
        return [];
    }
}

async function getCompanies() {
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data } = await supabase
            .from('companies')
            .select('id, name, slug')
            .eq('is_active', true)
            .order('name')
            .limit(30);
        return data || [];
    } catch (error) {
        console.error('Error fetching companies for SEO:', error);
        return [];
    }
}

export default async function HomePage() {
    const [jobs, categories, regions, companies] = await Promise.all([
        getLatestJobs(), 
        getCategories(),
        getRegions(),
        getCompanies()
    ]);

    const totalJobs = jobs.length;

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

    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Jooble Azərbaycan",
        "url": "https://jooble.az",
        "logo": "https://jooble.az/icons/icon-512x512.jpg",
        "description": "Azərbaycanın ən böyük iş axtarış platforması. Minlərlə aktiv vakansiya və iş elanı.",
        "sameAs": [
            "https://www.facebook.com/jooble.az",
            "https://www.instagram.com/jooble.az"
        ],
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "3521",
            "bestRating": "5",
            "worstRating": "1"
        }
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
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />

            {/* SEO Content - Server Rendered for Search Engines */}
            <div style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
                <article>
                    <header>
                        <h1>İş Elanları və Vakansiyalar 2026 - Jooble Azərbaycan</h1>
                        <p>
                            Jooble.az - Azərbaycanın ən böyük iş axtarış platforması. {totalJobs}+ aktiv iş elanı və vakansiya.
                            Hər gün yüzlərlə yeni iş imkanı əlavə olunur. İstər tam zamanlı, istər part-time, istərsə də 
                            uzaqdan iş axtarırsınızsa - bütün imkanları burada tapa bilərsiniz.
                        </p>
                    </header>

                    <section>
                        <h2>Ən Son İş Elanları - {new Date().toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' })}</h2>
                        <p>Bu gün əlavə olunan yeni vakansiyalar və iş imkanları:</p>
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
                                            <p>{job.description.replace(/<[^>]*>/g, '').substring(0, 200)}...</p>
                                        )}
                                        <p>
                                            <strong>Kateqoriya:</strong> {job.categories?.name || 'Ümumi'} | 
                                            <strong> Tarix:</strong> {new Date(job.created_at).toLocaleDateString('az-AZ')}
                                        </p>
                                    </article>
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
                                    <a href={`https://jooble.az/categories/${category.slug}`}>
                                        {category.name} vakansiyaları və iş elanları
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2>Regionlar üzrə İş Elanları</h2>
                        <p>Yaşadığınız bölgəyə uyğun iş elanlarını tapın:</p>
                        <ul>
                            {regions.map((region: any) => (
                                <li key={region.id}>
                                    <a href={`https://jooble.az/regions/${region.slug}`}>
                                        {region.name} iş elanları və vakansiyalar
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2>Şirkətlər üzrə Vakansiyalar</h2>
                        <p>Ən populyar şirkətlərdə iş imkanları:</p>
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
                            <li>Pulsuz iş elanı yerləşdirmə</li>
                        </ul>
                    </section>

                    <section>
                        <h2>Populyar Axtarışlar</h2>
                        <ul>
                            <li><a href="https://jooble.az/vacancies">Bütün vakansiyalar 2026</a></li>
                            <li><a href="https://jooble.az/categories">Kateqoriyalar üzrə iş elanları</a></li>
                            <li><a href="https://jooble.az/regions">Regionlar üzrə vakansiyalar</a></li>
                            <li><a href="https://jooble.az/companies">Şirkətlər və vakansiyalar</a></li>
                            <li><a href="https://jooble.az/blog">Karyera məsləhətləri</a></li>
                        </ul>
                    </section>

                    <footer>
                        <p>
                            © 2026 Jooble.az - Azərbaycanın ən böyük iş axtarış platforması. 
                            Bütün hüquqlar qorunur. İş elanları, vakansiyalar, karyera imkanları.
                        </p>
                    </footer>
                </article>
            </div>
        </>
    );
}
