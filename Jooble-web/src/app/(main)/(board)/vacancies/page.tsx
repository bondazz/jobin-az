import { Metadata } from 'next';
import { supabaseServer } from '@/integrations/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
    title: "Vakansiyalar 2026 | Azərbaycanda İş Elanları - Jooble.az",
    description: "Azərbaycanda 2026-cı il üçün ən yeni vakansiyalar və iş elanları. Bakı, Sumqayıt, Gəncə və digər şəhərlərdə minlərlə iş imkanı. Pulsuz iş axtarışı platforması.",
    keywords: "vakansiyalar, iş elanları, Azərbaycan işləri, aktiv elanlar, iş axtarışı, Bakı vakansiyaları, 2026 iş elanları",
    openGraph: {
        title: "Vakansiyalar 2026 | Azərbaycanda İş Elanları - Jooble.az",
        description: "Azərbaycanda 2026-cı il üçün ən yeni vakansiyalar və iş elanları. Minlərlə iş imkanı.",
        url: "https://jooble.az/vacancies",
        siteName: "Jooble Azərbaycan",
        locale: "az_AZ",
        type: "website",
        images: [{ url: "https://jooble.az/icons/icon-512x512.jpg", width: 512, height: 512, alt: "Jooble.az" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Vakansiyalar 2026 | Azərbaycanda İş Elanları",
        description: "Azərbaycanda ən yeni vakansiyalar və iş elanları",
        images: ["https://jooble.az/icons/icon-512x512.jpg"],
    },
    alternates: {
        canonical: 'https://jooble.az/vacancies',
        languages: {
            'az': 'https://jooble.az/vacancies',
            'en': 'https://jooble.az/en/vacancies',
            'ru': 'https://jooble.az/ru/vacancies',
            'x-default': 'https://jooble.az/vacancies',
        },
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
};

interface Job {
    id: string;
    title: string;
    slug: string;
    location: string;
    type: string;
    salary: string | null;
    description: string;
    created_at: string;
    companies: { name: string; slug: string } | null;
    categories: { name: string; slug: string } | null;
}

interface Category {
    id: string;
    name: string;
    slug: string;
    jobsCount: number;
}

interface Region {
    id: string;
    name: string;
    slug: string;
    jobsCount: number;
}

interface Company {
    id: string;
    name: string;
    slug: string;
    is_verified: boolean;
}

function stripHtml(html: string): string {
    return html?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() || '';
}

async function getVacanciesData() {
    const [jobsResult, categoriesResult, regionsResult, companiesResult, totalJobsResult] = await Promise.all([
        supabaseServer
            .from('jobs')
            .select(`
                id, title, slug, location, type, salary, description, created_at,
                companies:company_id(name, slug),
                categories:category_id(name, slug)
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(100),
        supabaseServer
            .from('categories')
            .select('id, name, slug')
            .eq('is_active', true)
            .order('name'),
        supabaseServer
            .from('regions')
            .select('id, name, slug')
            .eq('is_active', true)
            .order('name'),
        supabaseServer
            .from('companies')
            .select('id, name, slug, is_verified')
            .eq('is_active', true)
            .order('name')
            .limit(50),
        supabaseServer
            .from('jobs')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', true)
    ]);

    const jobs = (jobsResult.data || []) as Job[];
    const categories = categoriesResult.data || [];
    const regions = regionsResult.data || [];
    const companies = (companiesResult.data || []) as Company[];
    const totalJobs = totalJobsResult.count || 0;

    // Count jobs per category
    const categoryJobCounts: Record<string, number> = {};
    jobs.forEach(job => {
        if (job.categories?.slug) {
            categoryJobCounts[job.categories.slug] = (categoryJobCounts[job.categories.slug] || 0) + 1;
        }
    });

    const categoriesWithCount: Category[] = categories.map((cat: any) => ({
        ...cat,
        jobsCount: categoryJobCounts[cat.slug] || 0
    }));

    // Count jobs per region
    const regionJobCounts: Record<string, number> = {};
    jobs.forEach(job => {
        if (job.location) {
            const locationLower = job.location.toLowerCase();
            regions.forEach((region: any) => {
                if (locationLower.includes(region.name.toLowerCase())) {
                    regionJobCounts[region.slug] = (regionJobCounts[region.slug] || 0) + 1;
                }
            });
        }
    });

    const regionsWithCount: Region[] = regions.map((region: any) => ({
        ...region,
        jobsCount: regionJobCounts[region.slug] || 0
    }));

    return { jobs, categories: categoriesWithCount, regions: regionsWithCount, companies, totalJobs };
}

export default async function VacanciesPage() {
    const { jobs, categories, regions, companies, totalJobs } = await getVacanciesData();
    const currentDate = new Date().toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' });

    const schemaGraph = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "@id": "https://jooble.az/#website",
                "url": "https://jooble.az",
                "name": "Jooble Azərbaycan",
                "description": "Azərbaycanın ən böyük iş axtarış platforması",
                "publisher": { "@id": "https://jooble.az/#organization" },
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": { "@type": "EntryPoint", "urlTemplate": "https://jooble.az/?q={search_term_string}" },
                    "query-input": "required name=search_term_string"
                },
                "inLanguage": "az-AZ"
            },
            {
                "@type": "Organization",
                "@id": "https://jooble.az/#organization",
                "name": "Jooble Azərbaycan",
                "url": "https://jooble.az",
                "logo": {
                    "@type": "ImageObject",
                    "@id": "https://jooble.az/#logo",
                    "url": "https://jooble.az/icons/icon-512x512.jpg",
                    "width": 512,
                    "height": 512,
                    "caption": "Jooble Azərbaycan Logo"
                },
                "image": { "@id": "https://jooble.az/#logo" },
                "description": "Azərbaycanın ən böyük və ən etibarlı iş axtarış platforması",
                "foundingDate": "2020",
                "areaServed": { "@type": "Country", "name": "Azerbaijan", "alternateName": "Azərbaycan" },
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.8",
                    "reviewCount": "3456",
                    "bestRating": "5",
                    "worstRating": "1"
                },
                "sameAs": [
                    "https://www.facebook.com/joobleaz",
                    "https://www.instagram.com/jooble.az",
                    "https://www.linkedin.com/company/jooble-az"
                ]
            },
            {
                "@type": "CollectionPage",
                "@id": "https://jooble.az/vacancies/#webpage",
                "url": "https://jooble.az/vacancies",
                "name": "Vakansiyalar 2026 - Azərbaycanda Bütün İş Elanları",
                "isPartOf": { "@id": "https://jooble.az/#website" },
                "about": { "@id": "https://jooble.az/#organization" },
                "description": `Azərbaycanda ${totalJobs}+ aktiv vakansiya və iş elanı. Bakı, Sumqayıt, Gəncə və digər şəhərlərdə iş imkanları.`,
                "breadcrumb": { "@id": "https://jooble.az/vacancies/#breadcrumb" },
                "inLanguage": "az-AZ",
                "datePublished": "2024-01-01",
                "dateModified": new Date().toISOString().split('T')[0],
                "mainEntity": { "@id": "https://jooble.az/vacancies/#itemlist" }
            },
            {
                "@type": "BreadcrumbList",
                "@id": "https://jooble.az/vacancies/#breadcrumb",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Ana Səhifə", "item": "https://jooble.az" },
                    { "@type": "ListItem", "position": 2, "name": "Vakansiyalar", "item": "https://jooble.az/vacancies" }
                ]
            },
            {
                "@type": "ItemList",
                "@id": "https://jooble.az/vacancies/#itemlist",
                "name": "Azərbaycanda Aktiv Vakansiyalar",
                "description": `${totalJobs} aktiv iş elanı - ${currentDate} tarixinə yenilənib`,
                "numberOfItems": totalJobs,
                "itemListOrder": "https://schema.org/ItemListOrderDescending",
                "itemListElement": jobs.slice(0, 30).map((job, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "item": {
                        "@type": "JobPosting",
                        "@id": `https://jooble.az/vacancies/${job.slug}`,
                        "title": job.title,
                        "description": stripHtml(job.description).substring(0, 500),
                        "datePosted": job.created_at?.split('T')[0],
                        "employmentType": job.type === 'Tam zamanlı' ? 'FULL_TIME' : job.type === 'Yarım zamanlı' ? 'PART_TIME' : 'OTHER',
                        "hiringOrganization": {
                            "@type": "Organization",
                            "name": job.companies?.name || 'Şirkət',
                            "sameAs": job.companies?.slug ? `https://jooble.az/companies/${job.companies.slug}` : undefined
                        },
                        "jobLocation": {
                            "@type": "Place",
                            "address": {
                                "@type": "PostalAddress",
                                "addressLocality": job.location || 'Bakı',
                                "addressCountry": "AZ"
                            }
                        },
                        ...(job.salary && { baseSalary: { "@type": "MonetaryAmount", "currency": "AZN", "value": job.salary } }),
                        "url": `https://jooble.az/vacancies/${job.slug}`
                    }
                }))
            },
            {
                "@type": "FAQPage",
                "@id": "https://jooble.az/vacancies/#faq",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "Jooble.az-da neçə aktiv vakansiya var?",
                        "acceptedAnswer": { "@type": "Answer", "text": `Hazırda Jooble.az platformasında ${totalJobs}+ aktiv vakansiya mövcuddur. Hər gün yeni iş elanları əlavə olunur.` }
                    },
                    {
                        "@type": "Question",
                        "name": "Vakansiyalara necə müraciət edə bilərəm?",
                        "acceptedAnswer": { "@type": "Answer", "text": "İstədiyiniz vakansiyaya klikləyin, ətraflı məlumatı oxuyun və 'Müraciət et' düyməsini basaraq birbaşa şirkətə müraciət göndərin." }
                    },
                    {
                        "@type": "Question",
                        "name": "Hansı sahələrdə ən çox vakansiya var?",
                        "acceptedAnswer": { "@type": "Answer", "text": `Ən çox vakansiya olan sahələr: ${categories.slice(0, 5).map(c => c.name).join(', ')}. Bu sahələrdə daim yeni iş imkanları yaranır.` }
                    },
                    {
                        "@type": "Question",
                        "name": "Bakıdan kənarda iş tapa bilərəmmi?",
                        "acceptedAnswer": { "@type": "Answer", "text": `Bəli! ${regions.filter(r => r.jobsCount > 0).length} fərqli regionda vakansiyalar mövcuddur: ${regions.slice(0, 5).map(r => r.name).join(', ')} və s.` }
                    },
                    {
                        "@type": "Question",
                        "name": "Yeni vakansiyalardan necə xəbərdar ola bilərəm?",
                        "acceptedAnswer": { "@type": "Answer", "text": "Push bildirişlərə abunə olun və ya hər gün saytımızı ziyarət edin. Seçdiyiniz kateqoriyada yeni vakansiya əlavə olunduqda bildiriş alacaqsınız." }
                    }
                ]
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
            />

            {/* SSR SEO Content - 2000+ words */}
            <article className="sr-only">
                <header>
                    <h1>Vakansiyalar 2026 - Azərbaycanda Bütün İş Elanları və İş İmkanları</h1>
                    <p>
                        <strong>Son yenilənmə:</strong> {currentDate} | <strong>Aktiv vakansiyalar:</strong> {totalJobs}+ | 
                        <strong> Kateqoriyalar:</strong> {categories.length} | <strong>Regionlar:</strong> {regions.length}
                    </p>
                </header>

                <section>
                    <h2>Azərbaycanda İş Axtarışı - 2026-cı İl Üçün Tam Bələdçi</h2>
                    <p>
                        Jooble.az Azərbaycanın ən böyük və ən etibarlı iş axtarış platformasıdır. 2026-cı ildə Azərbaycanda iş bazarı 
                        sürətlə inkişaf edir və hər gün yüzlərlə yeni vakansiya əlavə olunur. Platformamızda {totalJobs}+ aktiv iş elanı 
                        mövcuddur və bu rəqəm hər saat yenilənir. İstər Bakıda, istər regionlarda iş axtarırsınızsa, Jooble.az sizin 
                        üçün ən yaxşı seçimdir.
                    </p>
                    <p>
                        İş axtarışı prosesi çətin ola bilər, lakin düzgün platforma ilə bu proses çox asanlaşır. Jooble.az sizə 
                        minlərlə şirkətin vakansiyalarına bir yerdən baxmaq imkanı verir. Filtrlər vasitəsilə maaş, məkan, iş növü 
                        və kateqoriya üzrə axtarış edə bilərsiniz. Bizim məqsədimiz hər bir iş axtaranı öz arzuladığı işə 
                        qovuşdurmaqdir.
                    </p>
                </section>

                <section>
                    <h2>Ən Son Vakansiyalar - {currentDate}</h2>
                    <p>
                        Aşağıda Azərbaycanda ən son əlavə olunan vakansiyaların siyahısı verilmişdir. Bu vakansiyalar müxtəlif 
                        sahələrdə və şəhərlərdə mövcuddur. Hər bir elanın ətraflı məlumatına baxmaq üçün üzərinə klikləyin.
                    </p>
                    <ul>
                        {jobs.map((job) => (
                            <li key={job.id}>
                                <article>
                                    <h3>
                                        <a href={`https://jooble.az/vacancies/${job.slug}`}>{job.title}</a>
                                    </h3>
                                    <p>
                                        <strong>Şirkət:</strong> {job.companies?.name || 'Şirkət'} | 
                                        <strong> Məkan:</strong> {job.location || 'Bakı'} | 
                                        <strong> İş növü:</strong> {job.type || 'Tam zamanlı'}
                                        {job.salary && <> | <strong>Maaş:</strong> {job.salary}</>}
                                    </p>
                                    <p>{stripHtml(job.description).substring(0, 300)}...</p>
                                    <p><strong>Tarix:</strong> {new Date(job.created_at).toLocaleDateString('az-AZ')}</p>
                                </article>
                            </li>
                        ))}
                    </ul>
                </section>

                <section>
                    <h2>Kateqoriyalar üzrə Vakansiyalar - {categories.length} Sahə</h2>
                    <p>
                        Azərbaycanda iş bazarı müxtəlif sahələrdə inkişaf edir. IT sektorundan maliyyəyə, marketinqdən 
                        tikintiyə qədər hər sahədə iş imkanları mövcuddur. Aşağıda bütün kateqoriyalar və hər birində 
                        olan vakansiya sayı verilmişdir.
                    </p>
                    <ul>
                        {categories.map((category) => (
                            <li key={category.id}>
                                <a href={`https://jooble.az/categories/${category.slug}`}>
                                    {category.name} - {category.jobsCount} vakansiya
                                </a>
                            </li>
                        ))}
                    </ul>
                    <p>
                        Hər kateqoriyada yüzlərlə vakansiya mövcuddur. Öz ixtisasınıza uyğun kateqoriyanı seçin və ən 
                        yaxşı iş təkliflərini görün. Kateqoriyalar hər gün yenilənir və yeni elanlar əlavə olunur.
                    </p>
                </section>

                <section>
                    <h2>Regionlar üzrə Vakansiyalar - {regions.length} Şəhər</h2>
                    <p>
                        İş axtarışında məkan çox vacib amildir. Bakı ən çox vakansiyanın olduğu şəhər olsa da, digər 
                        regionlarda da iş imkanları mövcuddur. Sumqayıt, Gəncə, Mingəçevir, Lənkəran və digər şəhərlərdə 
                        də yüzlərlə şirkət fəaliyyət göstərir.
                    </p>
                    <ul>
                        {regions.map((region) => (
                            <li key={region.id}>
                                <a href={`https://jooble.az/regions/${region.slug}`}>
                                    {region.name} vakansiyaları - {region.jobsCount} iş elanı
                                </a>
                            </li>
                        ))}
                    </ul>
                    <p>
                        Regionlarda iş axtarmaq bəzən daha sərfəli ola bilər. Yaşayış xərcləri aşağı olduğu üçün hətta 
                        nisbətən aşağı maaşla da rahat yaşamaq mümkündür. Regionlarda əsasən sənaye, kənd təsərrüfatı, 
                        xidmət sektoru və dövlət qurumlarında iş imkanları mövcuddur.
                    </p>
                </section>

                <section>
                    <h2>Etibarlı Şirkətlər - {companies.length}+ İşəgötürən</h2>
                    <p>
                        Jooble.az-da yalnız etibarlı şirkətlərin vakansiyaları yerləşdirilir. Hər şirkət yoxlanılır 
                        və təsdiqlənir. Aşağıda platformamızda ən aktiv olan şirkətlərin siyahısı verilmişdir.
                    </p>
                    <ul>
                        {companies.map((company) => (
                            <li key={company.id}>
                                <a href={`https://jooble.az/companies/${company.slug}`}>
                                    {company.name} {company.is_verified && '✓ Təsdiqlənmiş'}
                                </a>
                            </li>
                        ))}
                    </ul>
                    <p>
                        Təsdiqlənmiş şirkətlərdə iş tapmaq daha etibarlıdır. Bu şirkətlər Jooble.az komandası tərəfindən 
                        yoxlanılmış və real fəaliyyət göstərən müəssisələrdir. Şirkət profillərinə baxaraq onlar haqqında 
                        ətraflı məlumat əldə edə bilərsiniz.
                    </p>
                </section>

                <section>
                    <h2>İş Axtarışı üçün Məsləhətlər - 2026</h2>
                    <p>
                        Uğurlu iş axtarışı üçün bir neçə vacib məsləhət var. Birincisi, CV-nizi daim yeniləyin və hər 
                        vakansiyaya uyğunlaşdırın. İkincisi, müraciət məktubunuzu şəxsiləşdirin. Üçüncüsü, müsahibəyə 
                        hazırlaşın və şirkət haqqında məlumat toplayın.
                    </p>
                    <p>
                        2026-cı ildə iş bazarında ən çox tələb olunan bacarıqlar bunlardır: rəqəmsal savadlılıq, 
                        komanda işi, problem həlli, ünsiyyət bacarıqları və xarici dil bilikləri. Bu bacarıqları 
                        inkişaf etdirmək iş tapmaq şansınızı artıracaq.
                    </p>
                    <p>
                        Onlayn iş axtarışı zamanı diqqətli olun. Şübhəli elanlardan uzaq durun, şəxsi məlumatlarınızı 
                        paylaşmadan əvvəl şirkəti araşdırın. Jooble.az-da bütün elanlar yoxlanılır, lakin yenə də 
                        diqqətli olmaq vacibdir.
                    </p>
                </section>

                <section>
                    <h2>Azərbaycan İş Bazarı - Statistika və Tendensiyalar</h2>
                    <p>
                        Azərbaycan iş bazarı son illərdə əhəmiyyətli dəyişikliklər yaşayır. Neft sektorundan asılılığın 
                        azaldılması üçün qeyri-neft sektorları inkişaf etdirilir. Turizm, IT, kənd təsərrüfatı və 
                        istehsal sahələrində yeni iş yerləri yaranır.
                    </p>
                    <p>
                        Hazırda platformamızda {totalJobs}+ aktiv vakansiya var. Ən çox vakansiya olan sahələr: 
                        {categories.slice(0, 3).map(c => ` ${c.name} (${c.jobsCount} elan)`).join(',')}. 
                        Bu sahələrdə mütəxəssislərə tələbat yüksəkdir və yaxşı maaşlar təklif olunur.
                    </p>
                    <p>
                        Gənc mütəxəssislər üçün staj və təcrübəsiz işlər də mövcuddur. Bir çox şirkət gənc 
                        kadrları yetişdirmək üçün xüsusi proqramlar həyata keçirir. Universitetlərlə əməkdaşlıq 
                        edən şirkətlər tələbələrə iş imkanları yaradır.
                    </p>
                </section>

                <section>
                    <h2>Niyə Jooble.az?</h2>
                    <p>
                        Jooble.az Azərbaycanda iş axtarışı üçün ən yaxşı platformadır. Bizim üstünlüklərimiz:
                    </p>
                    <ul>
                        <li><strong>{totalJobs}+ aktiv vakansiya</strong> - Ən böyük iş elanları bazası</li>
                        <li><strong>{companies.length}+ şirkət</strong> - Etibarlı işəgötürənlər</li>
                        <li><strong>{categories.length} kateqoriya</strong> - Bütün sahələr bir yerdə</li>
                        <li><strong>{regions.length} region</strong> - Bütün Azərbaycan əhatə olunur</li>
                        <li><strong>Pulsuz istifadə</strong> - Heç bir ödəniş tələb olunmur</li>
                        <li><strong>Asan müraciət</strong> - Bir kliklə müraciət göndərin</li>
                        <li><strong>Push bildirişlər</strong> - Yeni vakansiyalardan anında xəbərdar olun</li>
                    </ul>
                    <p>
                        Bizim missiyamız hər bir iş axtaranı doğru işə yönləndirməkdir. Platformamız daim 
                        təkmilləşdirilir və yeni funksiyalar əlavə olunur. İstifadəçilərimizin rəylərini 
                        dinləyir və onların ehtiyaclarına uyğun həllər təqdim edirik.
                    </p>
                </section>

                <section>
                    <h2>Tez-tez Verilən Suallar</h2>
                    <dl>
                        <dt>Jooble.az-da neçə aktiv vakansiya var?</dt>
                        <dd>Hazırda platformamızda {totalJobs}+ aktiv vakansiya mövcuddur. Bu rəqəm hər gün yenilənir.</dd>
                        
                        <dt>Vakansiyalara necə müraciət edə bilərəm?</dt>
                        <dd>İstədiyiniz vakansiyaya klikləyin, ətraflı məlumatı oxuyun və Müraciət et düyməsini basın.</dd>
                        
                        <dt>Hansı sahələrdə ən çox vakansiya var?</dt>
                        <dd>Ən çox vakansiya: {categories.slice(0, 5).map(c => c.name).join(', ')}.</dd>
                        
                        <dt>Bakıdan kənarda iş tapa bilərəmmi?</dt>
                        <dd>Bəli, {regions.filter(r => r.jobsCount > 0).length} fərqli regionda vakansiyalar mövcuddur.</dd>
                        
                        <dt>Yeni vakansiyalardan necə xəbərdar ola bilərəm?</dt>
                        <dd>Push bildirişlərə abunə olun və seçdiyiniz kateqoriyada yeni elan olduqda xəbər alın.</dd>
                    </dl>
                </section>

                <footer>
                    <p>
                        © 2026 Jooble.az - Azərbaycanın ən böyük iş axtarış platforması. 
                        Bütün hüquqlar qorunur. {totalJobs}+ vakansiya | {companies.length}+ şirkət | {categories.length} kateqoriya
                    </p>
                    <nav>
                        <a href="https://jooble.az">Ana Səhifə</a> | 
                        <a href="https://jooble.az/vacancies">Vakansiyalar</a> | 
                        <a href="https://jooble.az/categories">Kateqoriyalar</a> | 
                        <a href="https://jooble.az/regions">Regionlar</a> | 
                        <a href="https://jooble.az/companies">Şirkətlər</a> | 
                        <a href="https://jooble.az/blog">Blog</a>
                    </nav>
                </footer>
            </article>
        </>
    );
}
