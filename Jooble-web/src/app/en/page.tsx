import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import HomeClient from '@/components/HomeClient';

// Force dynamic rendering - no client-side bailout
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = 'https://igrtzfvphltnoiwedbtz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTQzMDYsImV4cCI6MjA2Nzc5MDMwNn0.afoeynzfpIZMqMRgpD0fDQ_NdULXEML-LZ-SocnYKp0';

export const metadata: Metadata = {
    title: {
        absolute: "Jobs in Azerbaijan 2026 | Latest Job Opportunities – Jooble Azerbaijan"
    },
    description: "2026 job listings and vacancies - Azerbaijan's largest job search platform. Thousands of active vacancies, Baku job listings, SOCAR jobs and precise job search filters. Daily updated job opportunities.",
    keywords: "jobs 2026, vacancies Azerbaijan, jobs in Baku, latest job opportunities, new vacancies, job listings, SOCAR jobs, remote work, high salary jobs, CV job application, internship jobs, part-time jobs",
    alternates: {
        canonical: 'https://jooble.az/en',
        languages: {
            'az': 'https://jooble.az',
            'en': 'https://jooble.az/en',
            'ru': 'https://jooble.az/ru',
            'x-default': 'https://jooble.az',
        },
    },
    openGraph: {
        title: "Jobs in Azerbaijan 2026 | Jooble Azerbaijan",
        description: "Azerbaijan's largest job search platform. Thousands of active vacancies and job listings.",
        url: "https://jooble.az/en",
        siteName: "Jooble Azerbaijan",
        type: "website",
        locale: "en_US",
        images: [{ url: "https://jooble.az/icons/icon-512x512.jpg", width: 512, height: 512, alt: "Jooble Azerbaijan Logo" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Jobs in Azerbaijan 2026 | Jooble",
        description: "Azerbaijan's largest job search platform",
    },
};

// Helper to strip HTML tags
function stripHtml(html: string): string {
    return html?.replace(/<[^>]*>/g, '').trim() || '';
}

// Server-side data fetching
async function getHomeData() {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false }
    });

    const [jobsResult, categoriesResult, regionsResult, companiesResult, statsResult] = await Promise.all([
        supabase
            .from('jobs')
            .select(`
                id, title, slug, location, type, salary, description, created_at, expiration_date,
                companies:company_id(name, slug, logo),
                categories:category_id(name, slug)
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(50),
        
        supabase
            .from('categories')
            .select('id, name, slug, description')
            .eq('is_active', true)
            .order('name'),
        
        supabase
            .from('regions')
            .select('id, name, slug')
            .eq('is_active', true)
            .order('name'),
        
        supabase
            .from('companies')
            .select('id, name, slug, logo, is_verified')
            .eq('is_active', true)
            .order('name')
            .limit(50),
        
        supabase
            .from('jobs')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', true)
    ]);

    const categoryJobCounts: { [key: string]: number } = {};
    if (categoriesResult.data) {
        await Promise.all(categoriesResult.data.map(async (cat) => {
            const { count } = await supabase
                .from('jobs')
                .select('id', { count: 'exact', head: true })
                .eq('is_active', true)
                .eq('category_id', cat.id);
            categoryJobCounts[cat.id] = count || 0;
        }));
    }

    const regionJobCounts: { [key: string]: number } = {};
    if (regionsResult.data) {
        await Promise.all(regionsResult.data.map(async (region) => {
            const { count } = await supabase
                .from('jobs')
                .select('id', { count: 'exact', head: true })
                .eq('is_active', true)
                .ilike('location', `%${region.name}%`);
            regionJobCounts[region.id] = count || 0;
        }));
    }

    return {
        jobs: jobsResult.data || [],
        categories: (categoriesResult.data || []).map(cat => ({
            ...cat,
            jobsCount: categoryJobCounts[cat.id] || 0
        })),
        regions: (regionsResult.data || []).map(region => ({
            ...region,
            jobsCount: regionJobCounts[region.id] || 0
        })),
        companies: companiesResult.data || [],
        totalJobs: statsResult.count || 0
    };
}

export default async function EnHomePage() {
    const { jobs, categories, regions, companies, totalJobs } = await getHomeData();
    const currentDate = new Date().toISOString();
    const formattedDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

    // Comprehensive @graph Schema.org structure
    const graphSchema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "@id": "https://jooble.az/en/#website",
                "url": "https://jooble.az/en",
                "name": "Jooble Azerbaijan",
                "description": "Azerbaijan's largest job search platform",
                "inLanguage": "en",
                "publisher": { "@id": "https://jooble.az/#organization" },
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                        "@type": "EntryPoint",
                        "urlTemplate": "https://jooble.az/en/vacancies?q={search_term_string}"
                    },
                    "query-input": "required name=search_term_string"
                }
            },
            {
                "@type": "Organization",
                "@id": "https://jooble.az/#organization",
                "name": "Jooble Azerbaijan",
                "url": "https://jooble.az",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://jooble.az/icons/icon-512x512.jpg",
                    "width": 512,
                    "height": 512
                },
                "description": "Azerbaijan's largest job search platform. Job listings, vacancies and career opportunities.",
                "foundingDate": "2024",
                "areaServed": {
                    "@type": "Country",
                    "name": "Azerbaijan"
                },
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
                },
                "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "customer service",
                    "availableLanguage": ["az", "ru", "en"]
                }
            },
            {
                "@type": "WebPage",
                "@id": "https://jooble.az/en/#webpage",
                "url": "https://jooble.az/en",
                "name": "Jobs in Azerbaijan 2026 | Jooble Azerbaijan",
                "description": "Azerbaijan's largest job search platform. Thousands of active vacancies and job listings.",
                "isPartOf": { "@id": "https://jooble.az/en/#website" },
                "about": { "@id": "https://jooble.az/#organization" },
                "datePublished": "2024-01-01",
                "dateModified": currentDate,
                "inLanguage": "en",
                "primaryImageOfPage": {
                    "@type": "ImageObject",
                    "url": "https://jooble.az/icons/icon-512x512.jpg"
                },
                "breadcrumb": { "@id": "https://jooble.az/en/#breadcrumb" }
            },
            {
                "@type": "BreadcrumbList",
                "@id": "https://jooble.az/en/#breadcrumb",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Home",
                        "item": "https://jooble.az/en"
                    }
                ]
            },
            {
                "@type": "ItemList",
                "@id": "https://jooble.az/en/#joblist",
                "name": "Latest Job Listings",
                "description": `${totalJobs} active job listings and vacancies - Updated ${formattedDate}`,
                "numberOfItems": Math.min(jobs.length, 20),
                "itemListOrder": "https://schema.org/ItemListOrderDescending",
                "itemListElement": jobs.slice(0, 20).map((job: any, index: number) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "item": {
                        "@type": "JobPosting",
                        "@id": `https://jooble.az/en/vacancies/${job.slug}#job`,
                        "title": job.title,
                        "description": stripHtml(job.description || '').substring(0, 300),
                        "datePosted": job.created_at,
                        "validThrough": job.expiration_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        "employmentType": job.type?.toUpperCase().replace('-', '_') || "FULL_TIME",
                        "hiringOrganization": {
                            "@type": "Organization",
                            "name": job.companies?.name || "Company",
                            "sameAs": job.companies?.slug ? `https://jooble.az/en/companies/${job.companies.slug}` : undefined
                        },
                        "jobLocation": {
                            "@type": "Place",
                            "address": {
                                "@type": "PostalAddress",
                                "addressLocality": job.location || "Baku",
                                "addressCountry": "AZ"
                            }
                        },
                        "url": `https://jooble.az/en/vacancies/${job.slug}`,
                        "occupationalCategory": job.categories?.name || "General"
                    }
                }))
            },
            {
                "@type": "CollectionPage",
                "@id": "https://jooble.az/en/#categories-collection",
                "name": "Job Categories",
                "description": `Job listings in ${categories.length} different fields`,
                "url": "https://jooble.az/en/categories",
                "mainEntity": {
                    "@type": "ItemList",
                    "numberOfItems": categories.length,
                    "itemListElement": categories.slice(0, 15).map((cat: any, index: number) => ({
                        "@type": "ListItem",
                        "position": index + 1,
                        "item": {
                            "@type": "Thing",
                            "name": cat.name,
                            "url": `https://jooble.az/en/categories/${cat.slug}`,
                            "description": `${cat.jobsCount} active job listings`
                        }
                    }))
                }
            },
            {
                "@type": "CollectionPage",
                "@id": "https://jooble.az/en/#regions-collection",
                "name": "Jobs by Region",
                "description": `Job opportunities in ${regions.length} regions`,
                "url": "https://jooble.az/en/regions",
                "mainEntity": {
                    "@type": "ItemList",
                    "numberOfItems": regions.length,
                    "itemListElement": regions.slice(0, 10).map((region: any, index: number) => ({
                        "@type": "ListItem",
                        "position": index + 1,
                        "item": {
                            "@type": "Place",
                            "name": region.name,
                            "url": `https://jooble.az/en/regions/${region.slug}`,
                            "description": `${region.jobsCount} active vacancies`
                        }
                    }))
                }
            },
            {
                "@type": "FAQPage",
                "@id": "https://jooble.az/en/#faq",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "How many active vacancies are there on Jooble.az?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `Currently, there are ${totalJobs} active job listings and vacancies on Jooble.az. Job listings are updated daily and various career opportunities are offered.`
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "In which fields can I find jobs?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `Jooble.az has job listings in ${categories.length} different fields: ${categories.slice(0, 8).map((c: any) => c.name).join(', ')} and more. Each category has dozens of active vacancies.`
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "How do I find a job in Baku?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "To find a job in Baku, register on Jooble.az, upload your CV and apply to suitable vacancies. You can refine your search with category and region filters."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "How often are job listings updated?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Job listings on Jooble.az are updated daily. Companies add new vacancies and old listings are automatically archived. Subscribe to notifications to stay informed about new listings."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "In which cities are job opportunities available?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `Job listings are available in ${regions.length} regions of Azerbaijan: ${regions.slice(0, 6).map((r: any) => r.name).join(', ')} and other cities. Baku has the most job opportunities.`
                        }
                    }
                ]
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(graphSchema) }}
            />

            <article className="sr-only" aria-hidden="true">
                <header>
                    <h1>Jobs and Vacancies 2026 - Jooble Azerbaijan</h1>
                    <p>
                        Welcome to Azerbaijan's largest and most trusted job search platform! 
                        <strong> {totalJobs} active job listings</strong> and vacancies are waiting for you on Jooble.az. 
                        Give your career a new direction with job opportunities in various fields and regions. 
                        Whether you're an experienced professional or a fresh graduate - there's a job for you!
                    </p>
                    <p>
                        <time dateTime={currentDate}>Last updated: {formattedDate}</time>
                    </p>
                </header>

                <section>
                    <h2>🔥 Latest Job Listings - Vacancies Added Today</h2>
                    <p>
                        Below you can see the newest job listings added today and in recent days. 
                        Each listing is posted by verified companies and reflects current job opportunities.
                    </p>
                    <ul>
                        {jobs.map((job: any, index: number) => (
                            <li key={job.id}>
                                <article itemScope itemType="https://schema.org/JobPosting">
                                    <h3 itemProp="title">
                                        <a href={`https://jooble.az/en/vacancies/${job.slug}`} itemProp="url">
                                            {index + 1}. {job.title}
                                        </a>
                                    </h3>
                                    <div itemProp="hiringOrganization" itemScope itemType="https://schema.org/Organization">
                                        <strong>Company:</strong> <span itemProp="name">{job.companies?.name || 'Company name not specified'}</span>
                                        {job.companies?.slug && (
                                            <span> - <a href={`https://jooble.az/en/companies/${job.companies.slug}`}>Company profile</a></span>
                                        )}
                                    </div>
                                    <div itemProp="jobLocation" itemScope itemType="https://schema.org/Place">
                                        <strong>Location:</strong> <span itemProp="address">{job.location || 'Baku, Azerbaijan'}</span>
                                    </div>
                                    <p>
                                        <strong>Job type:</strong> <span itemProp="employmentType">{job.type || 'Full-time'}</span>
                                        {job.salary && <> | <strong>Salary:</strong> <span itemProp="baseSalary">{job.salary}</span></>}
                                        {job.categories?.name && <> | <strong>Category:</strong> <span itemProp="occupationalCategory">{job.categories.name}</span></>}
                                    </p>
                                    {job.description && (
                                        <p itemProp="description">{stripHtml(job.description).substring(0, 250)}...</p>
                                    )}
                                    <p>
                                        <strong>Posted:</strong> <time itemProp="datePosted" dateTime={job.created_at}>{new Date(job.created_at).toLocaleDateString('en-US')}</time>
                                    </p>
                                </article>
                            </li>
                        ))}
                    </ul>
                    <p>
                        <a href="https://jooble.az/en/vacancies">View all {totalJobs} job listings →</a>
                    </p>
                </section>

                <section>
                    <h2>📂 Jobs by Field - {categories.length} Categories</h2>
                    <p>
                        To simplify your job search, all vacancies are divided into categories by field. 
                        Select the category that matches your specialty and find suitable job listings.
                    </p>
                    <ul>
                        {categories.map((category: any) => (
                            <li key={category.id}>
                                <a href={`https://jooble.az/en/categories/${category.slug}`}>
                                    <strong>{category.name}</strong>
                                </a>
                                {' - '}{category.jobsCount} active vacancies
                                {category.description && <p>{stripHtml(category.description).substring(0, 100)}</p>}
                            </li>
                        ))}
                    </ul>
                    <p>
                        <a href="https://jooble.az/en/categories">View all categories →</a>
                    </p>
                </section>

                <section>
                    <h2>🗺️ Jobs by Region - {regions.length} Cities and Districts</h2>
                    <p>
                        Job opportunities are available in different regions of Azerbaijan. By selecting the city 
                        where you live or want to work, you can see active vacancies in that area.
                    </p>
                    <ul>
                        {regions.map((region: any) => (
                            <li key={region.id}>
                                <a href={`https://jooble.az/en/regions/${region.slug}`}>
                                    <strong>{region.name}</strong>
                                </a>
                                {' - '}{region.jobsCount} active job listings
                            </li>
                        ))}
                    </ul>
                    <p>
                        <a href="https://jooble.az/en/regions">View all regions →</a>
                    </p>
                </section>

                <section>
                    <h2>🏢 Companies - {companies.length}+ Active Employers</h2>
                    <p>
                        Leading companies in Azerbaijan share their vacancies on Jooble.az. By viewing company profiles, 
                        you can learn about the work environment, corporate culture and open vacancies.
                    </p>
                    <ul>
                        {companies.map((company: any) => (
                            <li key={company.id}>
                                <a href={`https://jooble.az/en/companies/${company.slug}`}>
                                    <strong>{company.name}</strong>
                                    {company.is_verified && <span> ✓ Verified</span>}
                                </a>
                            </li>
                        ))}
                    </ul>
                    <p>
                        <a href="https://jooble.az/en/companies">View all companies →</a>
                    </p>
                </section>

                <section>
                    <h2>❓ Frequently Asked Questions</h2>
                    <dl>
                        <dt><strong>How many active vacancies are there on Jooble.az?</strong></dt>
                        <dd>Currently, there are {totalJobs} active job listings and vacancies on Jooble.az. Job listings are updated daily.</dd>

                        <dt><strong>In which fields can I find jobs?</strong></dt>
                        <dd>There are job listings in {categories.length} different fields: {categories.slice(0, 8).map((c: any) => c.name).join(', ')} and more.</dd>

                        <dt><strong>How do I find a job in Baku?</strong></dt>
                        <dd>Register on Jooble.az, upload your CV and apply to suitable vacancies.</dd>

                        <dt><strong>How often are job listings updated?</strong></dt>
                        <dd>Job listings are updated daily. Subscribe to notifications to stay informed about new listings.</dd>

                        <dt><strong>In which cities are job opportunities available?</strong></dt>
                        <dd>Job listings are available in {regions.length} regions of Azerbaijan: {regions.slice(0, 6).map((r: any) => r.name).join(', ')} and other cities.</dd>

                        <dt><strong>Are there remote job listings?</strong></dt>
                        <dd>Yes, remote work opportunities are also available on Jooble.az. You can find remote vacancies using search filters.</dd>

                        <dt><strong>How do companies post job listings?</strong></dt>
                        <dd>Companies can post their vacancies for free or as premium using the "Post a Job" section.</dd>
                    </dl>
                </section>

                <section>
                    <h2>📱 About Jooble Azerbaijan</h2>
                    <p>
                        Jooble.az is Azerbaijan's largest and most trusted job search platform. Operating since 2024, 
                        our platform connects thousands of job seekers with employers.
                    </p>
                    <h3>Why Jooble.az?</h3>
                    <ul>
                        <li>✅ {totalJobs}+ active job listings and vacancies</li>
                        <li>✅ {categories.length} different job fields</li>
                        <li>✅ Search in {regions.length} regions</li>
                        <li>✅ {companies.length}+ verified companies</li>
                        <li>✅ Daily updated job opportunities</li>
                        <li>✅ Free CV creation and upload</li>
                        <li>✅ Push notifications for new listings</li>
                        <li>✅ Mobile-friendly interface</li>
                    </ul>
                    <h3>Our Services</h3>
                    <ul>
                        <li><a href="https://jooble.az/en/vacancies">Job listings and vacancies</a></li>
                        <li><a href="https://jooble.az/en/categories">Job search by field</a></li>
                        <li><a href="https://jooble.az/en/regions">Job listings by region</a></li>
                        <li><a href="https://jooble.az/en/companies">Company profiles</a></li>
                        <li><a href="https://jooble.az/en/add_job">Post a job</a></li>
                        <li><a href="https://jooble.az/en/cv-builder">CV builder</a></li>
                        <li><a href="https://jooble.az/en/subscribe">Subscribe to notifications</a></li>
                        <li><a href="https://jooble.az/en/services">Premium services</a></li>
                    </ul>
                </section>

                <footer>
                    <p>
                        © 2024-2026 Jooble.az - Azerbaijan's largest job search platform. 
                        All rights reserved. | <a href="https://jooble.az/en/about">About Us</a>
                    </p>
                    <address>
                        Contact: Baku, Azerbaijan | Email: info@jooble.az
                    </address>
                </footer>
            </article>

            <HomeClient />
        </>
    );
}
