import { Metadata } from 'next';
import { redirect } from 'next/navigation';
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

// Helper to strip HTML tags
function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Helper to format date
function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('az-AZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
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
        .select(`
            id, title, slug, description, location, type, salary, 
            created_at, expiration_date, is_active, views, tags,
            seo_title, seo_description, seo_keywords,
            application_type, application_url, category_id,
            companies:company_id(name, slug, logo, website, is_verified, description),
            categories:category_id(name, slug)
        `)
        .eq('slug', params.jobSlug)
        .maybeSingle();

    // If job doesn't exist OR is expired/inactive, redirect immediately to /vacancies
    if (!job || !job.is_active || isJobExpired(job.expiration_date)) {
        redirect('/vacancies');
    }

    // Fetch similar jobs from the same category
    let similarJobs: any[] = [];
    if (job.category_id) {
        const { data: similar } = await supabase
            .from('jobs')
            .select(`
                id, title, slug, location, salary, views, created_at, tags,
                companies:company_id(name, logo, is_verified, slug)
            `)
            .eq('category_id', job.category_id)
            .eq('is_active', true)
            .neq('id', job.id)
            .or('expiration_date.is.null,expiration_date.gt.now()')
            .order('created_at', { ascending: false })
            .limit(6);
        
        similarJobs = similar || [];
    }

    const company = job.companies as any;
    const category = job.categories as any;
    const companyName = company?.name || 'Şirkət';
    const categoryName = category?.name || '';
    const plainDescription = stripHtml(job.description || '');

    // JSON-LD Structured Data for JobPosting
    const jobPostingSchema = {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": job.title,
        "description": plainDescription,
        "datePosted": job.created_at,
        "validThrough": job.expiration_date || undefined,
        "employmentType": job.type === 'full-time' ? 'FULL_TIME' : 
                          job.type === 'part-time' ? 'PART_TIME' : 
                          job.type === 'contract' ? 'CONTRACTOR' : 
                          job.type === 'internship' ? 'INTERN' : 'OTHER',
        "hiringOrganization": {
            "@type": "Organization",
            "name": companyName,
            "sameAs": company?.website || undefined,
            "logo": company?.logo || undefined
        },
        "jobLocation": {
            "@type": "Place",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": job.location || 'Bakı',
                "addressCountry": "AZ"
            }
        },
        ...(job.salary && {
            "baseSalary": {
                "@type": "MonetaryAmount",
                "currency": "AZN",
                "value": {
                    "@type": "QuantitativeValue",
                    "value": job.salary
                }
            }
        }),
        "url": `https://jooble.az/vacancies/${job.slug}`
    };

    // BreadcrumbList Schema
    const breadcrumbSchema = {
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
            },
            ...(categoryName ? [{
                "@type": "ListItem",
                "position": 3,
                "name": categoryName,
                "item": `https://jooble.az/categories/${category?.slug}`
            }] : []),
            {
                "@type": "ListItem",
                "position": categoryName ? 4 : 3,
                "name": job.title,
                "item": `https://jooble.az/vacancies/${job.slug}`
            }
        ]
    };

    // Similar Jobs Schema for SEO
    const similarJobsSchema = similarJobs.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": categoryName ? `${categoryName} - Oxşar Vakansiyalar` : "Oxşar Vakansiyalar",
        "description": categoryName 
            ? `${categoryName} kateqoriyasında ən son iş elanları və vakansiyalar` 
            : "Oxşar iş elanları və vakansiyalar",
        "numberOfItems": similarJobs.length,
        "itemListElement": similarJobs.map((sJob: any, index: number) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "JobPosting",
                "title": sJob.title,
                "description": sJob.title,
                "datePosted": new Date(sJob.created_at).toISOString().split('T')[0],
                "url": `https://jooble.az/vacancies/${sJob.slug}`,
                "hiringOrganization": {
                    "@type": "Organization",
                    "name": sJob.companies?.name || "Şirkət",
                    ...(sJob.companies?.logo && { "logo": sJob.companies.logo })
                },
                "jobLocation": {
                    "@type": "Place",
                    "address": {
                        "@type": "PostalAddress",
                        "addressLocality": sJob.location,
                        "addressCountry": "AZ"
                    }
                },
                ...(sJob.salary && {
                    "baseSalary": {
                        "@type": "MonetaryAmount",
                        "currency": "AZN",
                        "value": {
                            "@type": "QuantitativeValue",
                            "value": sJob.salary
                        }
                    }
                })
            }
        }))
    } : null;

    return (
        <>
            {/* Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            {similarJobsSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(similarJobsSchema) }}
                />
            )}

            {/* SEO Content - Server Rendered for Google Bots */}
            <div className="sr-only" aria-hidden="false">
                <article itemScope itemType="https://schema.org/JobPosting">
                    {/* Breadcrumb Navigation */}
                    <nav aria-label="Breadcrumb">
                        <ol>
                            <li><a href="https://jooble.az">Ana Səhifə</a></li>
                            <li><a href="https://jooble.az/vacancies">Vakansiyalar</a></li>
                            {categoryName && (
                                <li><a href={`https://jooble.az/categories/${category?.slug}`}>{categoryName}</a></li>
                            )}
                            <li>{job.title}</li>
                        </ol>
                    </nav>

                    {/* Main Job Title */}
                    <h1 itemProp="title">{job.title} - {companyName} | Vakansiya</h1>

                    {/* Company Information */}
                    <section itemProp="hiringOrganization" itemScope itemType="https://schema.org/Organization">
                        <h2>Şirkət Haqqında</h2>
                        <p><strong>Şirkət:</strong> <span itemProp="name">{companyName}</span></p>
                        {company?.is_verified && <p>✓ Təsdiqlənmiş şirkət</p>}
                        {company?.website && (
                            <p><strong>Vebsayt:</strong> <a href={company.website} itemProp="sameAs">{company.website}</a></p>
                        )}
                        {company?.description && (
                            <p itemProp="description">{stripHtml(company.description)}</p>
                        )}
                        <p><a href={`https://jooble.az/companies/${company?.slug}`}>{companyName} şirkətinin bütün vakansiyaları</a></p>
                    </section>

                    {/* Job Details */}
                    <section>
                        <h2>Vakansiya Məlumatları</h2>
                        <ul>
                            <li><strong>Vəzifə:</strong> <span itemProp="title">{job.title}</span></li>
                            <li><strong>Yer:</strong> <span itemProp="jobLocation">{job.location || 'Bakı, Azərbaycan'}</span></li>
                            <li><strong>İş növü:</strong> <span itemProp="employmentType">
                                {job.type === 'full-time' ? 'Tam iş günü' : 
                                 job.type === 'part-time' ? 'Yarım ştat' : 
                                 job.type === 'contract' ? 'Müqavilə' : 
                                 job.type === 'internship' ? 'Təcrübə' : job.type}
                            </span></li>
                            {job.salary && (
                                <li><strong>Əmək haqqı:</strong> <span itemProp="baseSalary">{job.salary}</span></li>
                            )}
                            <li><strong>Elan tarixi:</strong> <time itemProp="datePosted" dateTime={job.created_at}>{formatDate(job.created_at)}</time></li>
                            {job.expiration_date && (
                                <li><strong>Son müraciət tarixi:</strong> <time itemProp="validThrough" dateTime={job.expiration_date}>{formatDate(job.expiration_date)}</time></li>
                            )}
                            <li><strong>Baxış sayı:</strong> {job.views}</li>
                            {categoryName && (
                                <li><strong>Kateqoriya:</strong> <a href={`https://jooble.az/categories/${category?.slug}`}>{categoryName}</a></li>
                            )}
                        </ul>

                        {/* Tags */}
                        {job.tags && job.tags.length > 0 && (
                            <div>
                                <strong>Etiketlər:</strong>
                                <ul>
                                    {job.tags.map((tag: string) => (
                                        <li key={tag}>
                                            {tag === 'premium' ? '⭐ Premium elan' :
                                             tag === 'new' ? '🆕 Yeni' :
                                             tag === 'urgent' ? '🔥 Təcili' :
                                             tag === 'remote' ? '🏠 Uzaqdan iş' : tag}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>

                    {/* Job Description */}
                    <section>
                        <h2>Vakansiya Təsviri</h2>
                        <div itemProp="description">
                            {plainDescription}
                        </div>
                    </section>

                    {/* Application Information */}
                    <section>
                        <h2>Müraciət Məlumatları</h2>
                        {job.application_type === 'url' && job.application_url && (
                            <p><strong>Müraciət linki:</strong> <a href={job.application_url} rel="nofollow">Müraciət et</a></p>
                        )}
                        {job.application_type === 'email' && (
                            <p>Bu vakansiyaya e-poçt vasitəsilə müraciət edə bilərsiniz.</p>
                        )}
                        <p>
                            Bu vakansiyaya müraciət etmək üçün <a href={`https://jooble.az/vacancies/${job.slug}`}>vakansiya səhifəsinə</a> keçid edin.
                        </p>
                    </section>

                    {/* Related Links */}
                    <section>
                        <h2>Əlaqəli Səhifələr</h2>
                        <ul>
                            <li><a href="https://jooble.az/vacancies">Bütün vakansiyalar</a></li>
                            {categoryName && (
                                <li><a href={`https://jooble.az/categories/${category?.slug}`}>{categoryName} vakansiyaları</a></li>
                            )}
                            <li><a href={`https://jooble.az/companies/${company?.slug}`}>{companyName} vakansiyaları</a></li>
                            <li><a href="https://jooble.az/categories">Kateqoriyalar</a></li>
                            <li><a href="https://jooble.az/companies">Şirkətlər</a></li>
                        </ul>
                    </section>

                    {/* SEO Keywords */}
                    {job.seo_keywords && job.seo_keywords.length > 0 && (
                        <section>
                            <h2>Açar sözlər</h2>
                            <p>{job.seo_keywords.join(', ')}</p>
                        </section>
                    )}

                    {/* Similar Jobs - Server Rendered for SEO */}
                    {similarJobs.length > 0 && (
                        <section>
                            <h2>Oxşar Vakansiyalar - {categoryName || 'Bu kateqoriyada'}</h2>
                            <p>{categoryName ? `${categoryName} kateqoriyasında ən son iş elanları və vakansiyalar` : 'Oxşar iş elanları və vakansiyalar'}</p>
                            <ul>
                                {similarJobs.map((sJob: any) => (
                                    <li key={sJob.id}>
                                        <a href={`https://jooble.az/vacancies/${sJob.slug}`}>
                                            <strong>{sJob.title}</strong> - {sJob.companies?.name || 'Şirkət'}
                                        </a>
                                        <ul>
                                            <li>Yer: {sJob.location}</li>
                                            {sJob.salary && <li>Maaş: {sJob.salary}</li>}
                                            <li>Baxış: {sJob.views}</li>
                                            <li>Tarix: {formatDate(sJob.created_at)}</li>
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                            {categoryName && category?.slug && (
                                <p>
                                    <a href={`https://jooble.az/categories/${category.slug}`}>
                                        {categoryName} kateqoriyasında daha çox vakansiya
                                    </a>
                                </p>
                            )}
                        </section>
                    )}

                    {/* Footer Info */}
                    <footer>
                        <p>
                            {job.title} vakansiyası {companyName} şirkətində. Jooble.az - Azərbaycanın ən böyük iş axtarış platforması.
                            Hər gün yüzlərlə yeni vakansiya əlavə olunur. İş elanları 2026 üçün ən yaxşı seçim.
                        </p>
                    </footer>
                </article>
            </div>
        </>
    );
}
