import CategoriesClient from '@/components/CategoriesClient';
import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://igrtzfvphltnoiwedbtz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTQzMDYsImV4cCI6MjA2Nzc5MDMwNn0.afoeynzfpIZMqMRgpD0fDQ_NdULXEML-LZ-SocnYKp0';

type Props = {
    params: { category: string }
};

// Helper function to strip HTML tags
function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

async function getCategoryData(slug: string) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data: category } = await supabase
        .from('categories')
        .select('id, name, description, seo_title, seo_description, seo_keywords, slug, h1_title, icon')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

    if (!category) return null;

    // Get jobs count for this category
    const { count: jobsCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)
        .eq('is_active', true);

    // Get recent jobs for this category
    const { data: recentJobs } = await supabase
        .from('jobs')
        .select(`
            id, title, slug, location, type, salary, created_at,
            companies:company_id(name)
        `)
        .eq('category_id', category.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

    return {
        category,
        jobsCount: jobsCount || 0,
        recentJobs: recentJobs || []
    };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const data = await getCategoryData(params.category);

    if (!data) return {};

    const { category } = data;
    const title = category.seo_title || `${category.name} Vakansiyaları | İş Elanları - Jooble.az`;
    const description = category.seo_description || `${category.name} sahəsində ən yeni iş elanları və vakansiyalar. Azərbaycanda ${category.name} üzrə aktual iş təklifləri.`;
    const keywords = category.seo_keywords?.join(', ') || `${category.name}, vakansiya, iş elanları, ${category.name} işləri`;
    const canonicalUrl = `https://jooble.az/categories/${category.slug}`;

    return {
        title,
        description,
        keywords,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            siteName: 'Jooble.az',
            type: 'website',
            images: [
                {
                    url: 'https://jooble.az/icons/icon-512x512.jpg',
                    width: 512,
                    height: 512,
                    alt: `${category.name} - İş Elanları`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['https://jooble.az/icons/icon-512x512.jpg'],
        },
    };
}

export default async function CategoryPage({ params }: Props) {
    const data = await getCategoryData(params.category);

    if (!data) {
        return <CategoriesClient />;
    }

    const { category, jobsCount, recentJobs } = data;
    const plainDescription = category.description ? stripHtml(category.description) : '';

    // Structured data for category page
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": category.h1_title || category.name,
        "description": category.seo_description || `${category.name} sahəsində iş elanları`,
        "url": `https://jooble.az/categories/${category.slug}`,
        "mainEntity": {
            "@type": "ItemList",
            "name": `${category.name} Vakansiyaları`,
            "numberOfItems": jobsCount,
            "itemListElement": recentJobs.map((job: any, index: number) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "JobPosting",
                    "title": job.title,
                    "description": job.title,
                    "datePosted": job.created_at ? new Date(job.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    "url": `https://jooble.az/vacancies/${job.slug}`,
                    "hiringOrganization": {
                        "@type": "Organization",
                        "name": job.companies?.name || "Şirkət"
                    },
                    "jobLocation": {
                        "@type": "Place",
                        "address": {
                            "@type": "PostalAddress",
                            "addressLocality": job.location,
                            "addressCountry": "AZ"
                        }
                    }
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
                "name": "Kateqoriyalar",
                "item": "https://jooble.az/categories"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": category.name,
                "item": `https://jooble.az/categories/${category.slug}`
            }
        ]
    };

    return (
        <>
            {/* Server-rendered SEO content - visible to search engines */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
            />
            
            {/* Hidden SEO content for search engines */}
            <div className="sr-only">
                <article>
                    <h1>{category.h1_title || category.name} - İş Elanları və Vakansiyalar</h1>
                    
                    <section>
                        <h2>Kateqoriya Haqqında</h2>
                        <p><strong>Kateqoriya:</strong> {category.name}</p>
                        <p><strong>Aktiv Vakansiya Sayı:</strong> {jobsCount}</p>
                        {plainDescription && (
                            <div>
                                <h3>Təsvir</h3>
                                <p>{plainDescription}</p>
                            </div>
                        )}
                    </section>

                    {recentJobs.length > 0 && (
                        <section>
                            <h2>{category.name} Sahəsində Son Vakansiyalar</h2>
                            <ul>
                                {recentJobs.map((job: any) => (
                                    <li key={job.id}>
                                        <a href={`https://jooble.az/vacancies/${job.slug}`}>
                                            <strong>{job.title}</strong>
                                            {job.companies?.name && ` - ${job.companies.name}`}
                                            {job.location && ` | ${job.location}`}
                                            {job.salary && ` | Maaş: ${job.salary}`}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <section>
                        <h2>{category.name} Sahəsində İş Axtarışı</h2>
                        <p>
                            {category.name} sahəsində {jobsCount} aktiv vakansiya mövcuddur. 
                            Bu kateqoriyada müxtəlif şirkətlərdən iş təklifləri, tam zamanlı və yarım zamanlı 
                            iş imkanları tapa bilərsiniz.
                        </p>
                    </section>

                    <nav aria-label="Breadcrumb">
                        <ol>
                            <li><a href="https://jooble.az">Ana Səhifə</a></li>
                            <li><a href="https://jooble.az/categories">Kateqoriyalar</a></li>
                            <li>{category.name}</li>
                        </ol>
                    </nav>
                </article>
            </div>

            <CategoriesClient />
        </>
    );
}
