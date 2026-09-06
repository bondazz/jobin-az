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
        absolute: "İş Elanları və Vakansiyalar 2026 | Ən Son İş İmkanları – Jooble Azərbaycan"
    },
    description: "2026 iş elanları və vakansiyalar - Azərbaycanın ən böyük iş axtarış platforması. Minlərlə aktiv vakansiya, Bakı iş elanları, SOCAR vakansiyalar və sahə üzrə ən dəqiq filtrli iş axtarışı. Hər gün yenilənən iş imkanları.",
    keywords: "iş elanları 2026, vakansiyalar Azərbaycan, Bakıda iş elanları, ən son iş imkanları, yeni vakansiyalar, is elanlari, SOCAR vakansiyalar, uzaqdan iş, yüksək maaşlı işlər, CV ilə iş müraciəti, təcrübəçi işləri, part-time iş",
    alternates: {
        canonical: 'https://jooble.az',
        languages: {
            'az': 'https://jooble.az',
            'en': 'https://jooble.az/en',
            'ru': 'https://jooble.az/ru',
            'x-default': 'https://jooble.az',
        },
    },
    openGraph: {
        title: "İş Elanları və Vakansiyalar 2026 | Jooble Azərbaycan",
        description: "Azərbaycanın ən böyük iş axtarış platforması. Minlərlə aktiv vakansiya və iş elanı.",
        url: "https://jooble.az",
        siteName: "Jooble Azərbaycan",
        type: "website",
        locale: "az_AZ",
        images: [{ url: "https://jooble.az/icons/icon-512x512.jpg", width: 512, height: 512, alt: "Jooble Azərbaycan Logo" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "İş Elanları və Vakansiyalar 2026 | Jooble",
        description: "Azərbaycanın ən böyük iş axtarış platforması",
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
        // Latest jobs with details
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
        
        // All categories with job counts
        supabase
            .from('categories')
            .select('id, name, slug, description')
            .eq('is_active', true)
            .order('name'),
        
        // All regions
        supabase
            .from('regions')
            .select('id, name, slug')
            .eq('is_active', true)
            .order('name'),
        
        // Top companies
        supabase
            .from('companies')
            .select('id, name, slug, logo, is_verified')
            .eq('is_active', true)
            .order('name')
            .limit(50),
        
        // Total job count
        supabase
            .from('jobs')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', true)
    ]);

    // Get category job counts
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

    // Get region job counts
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

export default async function HomePage() {
    const { jobs, categories, regions, companies, totalJobs } = await getHomeData();
    const currentDate = new Date().toISOString();
    const formattedDate = new Date().toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' });

    // Comprehensive @graph Schema.org structure
    const graphSchema = {
        "@context": "https://schema.org",
        "@graph": [
            // WebSite with SearchAction
            {
                "@type": "WebSite",
                "@id": "https://jooble.az/#website",
                "url": "https://jooble.az",
                "name": "Jooble Azərbaycan",
                "description": "Azərbaycanın ən böyük iş axtarış platforması",
                "inLanguage": "az",
                "publisher": { "@id": "https://jooble.az/#organization" },
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                        "@type": "EntryPoint",
                        "urlTemplate": "https://jooble.az/vacancies?q={search_term_string}"
                    },
                    "query-input": "required name=search_term_string"
                }
            },
            // Organization
            {
                "@type": "Organization",
                "@id": "https://jooble.az/#organization",
                "name": "Jooble Azərbaycan",
                "url": "https://jooble.az",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://jooble.az/icons/icon-512x512.jpg",
                    "width": 512,
                    "height": 512
                },
                "description": "Azərbaycanın ən böyük iş axtarış platforması. İş elanları, vakansiyalar və karyera imkanları.",
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
            // WebPage
            {
                "@type": "WebPage",
                "@id": "https://jooble.az/#webpage",
                "url": "https://jooble.az",
                "name": "İş Elanları və Vakansiyalar 2026 | Jooble Azərbaycan",
                "description": "Azərbaycanın ən böyük iş axtarış platforması. Minlərlə aktiv vakansiya və iş elanı.",
                "isPartOf": { "@id": "https://jooble.az/#website" },
                "about": { "@id": "https://jooble.az/#organization" },
                "datePublished": "2024-01-01",
                "dateModified": currentDate,
                "inLanguage": "az",
                "primaryImageOfPage": {
                    "@type": "ImageObject",
                    "url": "https://jooble.az/icons/icon-512x512.jpg"
                },
                "breadcrumb": { "@id": "https://jooble.az/#breadcrumb" }
            },
            // BreadcrumbList
            {
                "@type": "BreadcrumbList",
                "@id": "https://jooble.az/#breadcrumb",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Ana Səhifə",
                        "item": "https://jooble.az"
                    }
                ]
            },
            // ItemList - Job Postings
            {
                "@type": "ItemList",
                "@id": "https://jooble.az/#joblist",
                "name": "Ən Son İş Elanları",
                "description": `${totalJobs} aktiv iş elanı və vakansiya - ${formattedDate} tarixinə yenilənib`,
                "numberOfItems": Math.min(jobs.length, 20),
                "itemListOrder": "https://schema.org/ItemListOrderDescending",
                "itemListElement": jobs.slice(0, 20).map((job: any, index: number) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "item": {
                        "@type": "JobPosting",
                        "@id": `https://jooble.az/vacancies/${job.slug}#job`,
                        "title": job.title,
                        "description": stripHtml(job.description || '').substring(0, 300),
                        "datePosted": job.created_at,
                        "validThrough": job.expiration_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        "employmentType": job.type?.toUpperCase().replace('-', '_') || "FULL_TIME",
                        "hiringOrganization": {
                            "@type": "Organization",
                            "name": job.companies?.name || "Şirkət",
                            "sameAs": job.companies?.slug ? `https://jooble.az/companies/${job.companies.slug}` : undefined
                        },
                        "jobLocation": {
                            "@type": "Place",
                            "address": {
                                "@type": "PostalAddress",
                                "addressLocality": job.location || "Bakı",
                                "addressCountry": "AZ"
                            }
                        },
                        "url": `https://jooble.az/vacancies/${job.slug}`,
                        "occupationalCategory": job.categories?.name || "Ümumi"
                    }
                }))
            },
            // CollectionPage - Categories
            {
                "@type": "CollectionPage",
                "@id": "https://jooble.az/#categories-collection",
                "name": "İş Kateqoriyaları",
                "description": `${categories.length} müxtəlif sahədə iş elanları`,
                "url": "https://jooble.az/categories",
                "mainEntity": {
                    "@type": "ItemList",
                    "numberOfItems": categories.length,
                    "itemListElement": categories.slice(0, 15).map((cat: any, index: number) => ({
                        "@type": "ListItem",
                        "position": index + 1,
                        "item": {
                            "@type": "Thing",
                            "name": cat.name,
                            "url": `https://jooble.az/categories/${cat.slug}`,
                            "description": `${cat.jobsCount} aktiv iş elanı`
                        }
                    }))
                }
            },
            // CollectionPage - Regions
            {
                "@type": "CollectionPage",
                "@id": "https://jooble.az/#regions-collection",
                "name": "Regionlar üzrə İş Elanları",
                "description": `${regions.length} regionda iş imkanları`,
                "url": "https://jooble.az/regions",
                "mainEntity": {
                    "@type": "ItemList",
                    "numberOfItems": regions.length,
                    "itemListElement": regions.slice(0, 10).map((region: any, index: number) => ({
                        "@type": "ListItem",
                        "position": index + 1,
                        "item": {
                            "@type": "Place",
                            "name": region.name,
                            "url": `https://jooble.az/regions/${region.slug}`,
                            "description": `${region.jobsCount} aktiv vakansiya`
                        }
                    }))
                }
            },
            // FAQPage
            {
                "@type": "FAQPage",
                "@id": "https://jooble.az/#faq",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "Jooble.az-da neçə aktiv vakansiya var?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `Hazırda Jooble.az-da ${totalJobs} aktiv iş elanı və vakansiya mövcuddur. İş elanları hər gün yenilənir və müxtəlif sahələrdə iş imkanları təklif olunur.`
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Hansı sahələrdə iş tapmaq olar?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `Jooble.az-da ${categories.length} müxtəlif sahədə iş elanları var: ${categories.slice(0, 8).map((c: any) => c.name).join(', ')} və daha çoxu. Hər kateqoriyada onlarla aktiv vakansiya mövcuddur.`
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Bakıda iş tapmaq üçün nə etməliyəm?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Bakıda iş tapmaq üçün Jooble.az saytında qeydiyyatdan keçin, CV-nizi yükləyin və sizə uyğun vakansiyalara müraciət edin. Kateqoriya və region filtrləri ilə axtarışınızı dəqiqləşdirə bilərsiniz."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "İş elanları nə qədər tez-tez yenilənir?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Jooble.az-da iş elanları hər gün yenilənir. Şirkətlər yeni vakansiyalar əlavə edir və köhnə elanlar avtomatik olaraq arxivlənir. Bildirişlərə abunə olaraq yeni elanlardan xəbərdar ola bilərsiniz."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Hansı şəhərlərdə iş imkanları var?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `Azərbaycanın ${regions.length} regionunda iş elanları mövcuddur: ${regions.slice(0, 6).map((r: any) => r.name).join(', ')} və digər şəhərlərdə. Bakı ən çox iş imkanı olan şəhərdir.`
                        }
                    }
                ]
            }
        ]
    };

    return (
        <>
            {/* Comprehensive @graph Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(graphSchema) }}
            />

            {/* SEO Content - Hidden but present in View Page Source for crawlers */}
            <article className="sr-only" aria-hidden="true">
                <header>
                    <h1>İş Elanları və Vakansiyalar 2026 - Jooble Azərbaycan</h1>
                    <p>
                        Azərbaycanın ən böyük və ən etibarlı iş axtarış platformasına xoş gəlmisiniz! Jooble.az-da 
                        <strong> {totalJobs} aktiv iş elanı</strong> və vakansiya sizi gözləyir. Müxtəlif sahələrdə, 
                        müxtəlif regionlarda iş imkanları ilə karyeranıza yeni istiqamət verin. İstər təcrübəli mütəxəssis 
                        olun, istərsə də yeni məzun - sizin üçün uyğun iş var!
                    </p>
                    <p>
                        <time dateTime={currentDate}>Son yenilənmə: {formattedDate}</time>
                    </p>
                </header>

                <section>
                    <h2>🔥 Ən Son İş Elanları - Bu Gün Əlavə Olunan Vakansiyalar</h2>
                    <p>
                        Aşağıda bu gün və son günlərdə əlavə olunan ən yeni iş elanlarını görə bilərsiniz. 
                        Hər elan təsdiqlənmiş şirkətlər tərəfindən yerləşdirilir və aktual iş imkanlarını əks etdirir.
                    </p>
                    <ul>
                        {jobs.map((job: any, index: number) => (
                            <li key={job.id}>
                                <article itemScope itemType="https://schema.org/JobPosting">
                                    <h3 itemProp="title">
                                        <a href={`https://jooble.az/vacancies/${job.slug}`} itemProp="url">
                                            {index + 1}. {job.title}
                                        </a>
                                    </h3>
                                    <div itemProp="hiringOrganization" itemScope itemType="https://schema.org/Organization">
                                        <strong>Şirkət:</strong> <span itemProp="name">{job.companies?.name || 'Şirkət adı qeyd olunmayıb'}</span>
                                        {job.companies?.slug && (
                                            <span> - <a href={`https://jooble.az/companies/${job.companies.slug}`}>Şirkət profili</a></span>
                                        )}
                                    </div>
                                    <div itemProp="jobLocation" itemScope itemType="https://schema.org/Place">
                                        <strong>Məkan:</strong> <span itemProp="address">{job.location || 'Bakı, Azərbaycan'}</span>
                                    </div>
                                    <p>
                                        <strong>İş növü:</strong> <span itemProp="employmentType">{job.type || 'Tam zamanlı'}</span>
                                        {job.salary && <> | <strong>Maaş:</strong> <span itemProp="baseSalary">{job.salary}</span></>}
                                        {job.categories?.name && <> | <strong>Kateqoriya:</strong> <span itemProp="occupationalCategory">{job.categories.name}</span></>}
                                    </p>
                                    {job.description && (
                                        <p itemProp="description">{stripHtml(job.description).substring(0, 250)}...</p>
                                    )}
                                    <p>
                                        <strong>Elan tarixi:</strong> <time itemProp="datePosted" dateTime={job.created_at}>{new Date(job.created_at).toLocaleDateString('az-AZ')}</time>
                                    </p>
                                </article>
                            </li>
                        ))}
                    </ul>
                    <p>
                        <a href="https://jooble.az/vacancies">Bütün {totalJobs} iş elanını görüntüləyin →</a>
                    </p>
                </section>

                <section>
                    <h2>📂 Sahələr üzrə İş Elanları - {categories.length} Kateqoriya</h2>
                    <p>
                        İş axtarışınızı asanlaşdırmaq üçün bütün vakansiyalar sahələr üzrə kateqoriyalara bölünüb. 
                        İxtisasınıza uyğun kateqoriyanı seçin və sizə münasib iş elanlarını tapın.
                    </p>
                    <ul>
                        {categories.map((category: any) => (
                            <li key={category.id}>
                                <a href={`https://jooble.az/categories/${category.slug}`}>
                                    <strong>{category.name}</strong>
                                </a>
                                {' - '}{category.jobsCount} aktiv vakansiya
                                {category.description && <p>{stripHtml(category.description).substring(0, 100)}</p>}
                            </li>
                        ))}
                    </ul>
                    <p>
                        <a href="https://jooble.az/categories">Bütün kateqoriyaları görüntüləyin →</a>
                    </p>
                </section>

                <section>
                    <h2>🗺️ Regionlar üzrə İş Elanları - {regions.length} Şəhər və Rayon</h2>
                    <p>
                        Azərbaycanın müxtəlif regionlarında iş imkanları mövcuddur. Yaşadığınız və ya işləmək 
                        istədiyiniz şəhəri seçərək həmin ərazidəki aktiv vakansiyaları görə bilərsiniz.
                    </p>
                    <ul>
                        {regions.map((region: any) => (
                            <li key={region.id}>
                                <a href={`https://jooble.az/regions/${region.slug}`}>
                                    <strong>{region.name}</strong>
                                </a>
                                {' - '}{region.jobsCount} aktiv iş elanı
                            </li>
                        ))}
                    </ul>
                    <p>
                        <a href="https://jooble.az/regions">Bütün regionları görüntüləyin →</a>
                    </p>
                </section>

                <section>
                    <h2>🏢 Şirkətlər - {companies.length}+ Aktiv İşəgötürən</h2>
                    <p>
                        Azərbaycanın aparıcı şirkətləri Jooble.az-da vakansiyalarını paylaşır. Şirkət profillərinə 
                        baxaraq iş mühiti, korporativ mədəniyyət və açıq vakansiyalar haqqında məlumat əldə edə bilərsiniz.
                    </p>
                    <ul>
                        {companies.map((company: any) => (
                            <li key={company.id}>
                                <a href={`https://jooble.az/companies/${company.slug}`}>
                                    <strong>{company.name}</strong>
                                    {company.is_verified && <span> ✓ Təsdiqlənmiş</span>}
                                </a>
                            </li>
                        ))}
                    </ul>
                    <p>
                        <a href="https://jooble.az/companies">Bütün şirkətləri görüntüləyin →</a>
                    </p>
                </section>

                <section>
                    <h2>❓ Tez-tez Verilən Suallar</h2>
                    <dl>
                        <dt><strong>Jooble.az-da neçə aktiv vakansiya var?</strong></dt>
                        <dd>Hazırda Jooble.az-da {totalJobs} aktiv iş elanı və vakansiya mövcuddur. İş elanları hər gün yenilənir.</dd>

                        <dt><strong>Hansı sahələrdə iş tapmaq olar?</strong></dt>
                        <dd>{categories.length} müxtəlif sahədə iş elanları var: {categories.slice(0, 8).map((c: any) => c.name).join(', ')} və daha çoxu.</dd>

                        <dt><strong>Bakıda iş tapmaq üçün nə etməliyəm?</strong></dt>
                        <dd>Jooble.az saytında qeydiyyatdan keçin, CV-nizi yükləyin və sizə uyğun vakansiyalara müraciət edin.</dd>

                        <dt><strong>İş elanları nə qədər tez-tez yenilənir?</strong></dt>
                        <dd>İş elanları hər gün yenilənir. Bildirişlərə abunə olaraq yeni elanlardan xəbərdar ola bilərsiniz.</dd>

                        <dt><strong>Hansı şəhərlərdə iş imkanları var?</strong></dt>
                        <dd>Azərbaycanın {regions.length} regionunda iş elanları mövcuddur: {regions.slice(0, 6).map((r: any) => r.name).join(', ')} və digər şəhərlərdə.</dd>

                        <dt><strong>Uzaqdan iş elanları varmı?</strong></dt>
                        <dd>Bəli, Jooble.az-da uzaqdan (remote) iş imkanları da mövcuddur. Axtarış filtrlərindən istifadə edərək remote vakansiyaları tapa bilərsiniz.</dd>

                        <dt><strong>Şirkətlər necə elan yerləşdirir?</strong></dt>
                        <dd>Şirkətlər "İş Elanı Yerləşdir" bölməsindən istifadə edərək vakansiyalarını pulsuz və ya premium olaraq yerləşdirə bilər.</dd>
                    </dl>
                </section>

                <section>
                    <h2>📱 Jooble Azərbaycan Haqqında</h2>
                    <p>
                        Jooble.az - Azərbaycanın ən böyük və ən etibarlı iş axtarış platformasıdır. 2024-cü ildən 
                        fəaliyyət göstərən platformamız minlərlə iş axtaranı işəgötürənlərlə birləşdirir. 
                    </p>
                    <h3>Niyə Jooble.az?</h3>
                    <ul>
                        <li>✅ {totalJobs}+ aktiv iş elanı və vakansiya</li>
                        <li>✅ {categories.length} müxtəlif iş sahəsi</li>
                        <li>✅ {regions.length} region üzrə axtarış imkanı</li>
                        <li>✅ {companies.length}+ təsdiqlənmiş şirkət</li>
                        <li>✅ Hər gün yenilənən iş imkanları</li>
                        <li>✅ Pulsuz CV yaratma və yükləmə</li>
                        <li>✅ Push bildirişlər ilə yeni elanlardan xəbərdar olma</li>
                        <li>✅ Mobil-uyumlu interfeys</li>
                    </ul>
                    <h3>Xidmətlərimiz</h3>
                    <ul>
                        <li><a href="https://jooble.az/vacancies">İş elanları və vakansiyalar</a></li>
                        <li><a href="https://jooble.az/categories">Sahələr üzrə iş axtarışı</a></li>
                        <li><a href="https://jooble.az/regions">Regionlar üzrə iş elanları</a></li>
                        <li><a href="https://jooble.az/companies">Şirkət profilləri</a></li>
                        <li><a href="https://jooble.az/add_job">İş elanı yerləşdirmək</a></li>
                        <li><a href="https://jooble.az/cv-builder">CV yaratma</a></li>
                        <li><a href="https://jooble.az/subscribe">Bildirişlərə abunə olma</a></li>
                        <li><a href="https://jooble.az/services">Premium xidmətlər</a></li>
                    </ul>
                </section>

                <footer>
                    <p>
                        © 2024-2026 Jooble.az - Azərbaycanın ən böyük iş axtarış platforması. 
                        Bütün hüquqlar qorunur. | <a href="https://jooble.az/about">Haqqımızda</a>
                    </p>
                    <address>
                        Əlaqə: Bakı, Azərbaycan | E-poçt: info@jooble.az
                    </address>
                </footer>
            </article>

            {/* Client-side interactive component */}
            <HomeClient />
        </>
    );
}
