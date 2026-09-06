import { Metadata } from 'next';
import { supabaseServer } from '@/integrations/supabase/server';
import RegionsClient from '@/components/RegionsClient';

// Force dynamic rendering with ISR
export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minutes ISR cache

interface RegionPageProps {
    params: { region: string };
}

// Helper function to strip HTML tags
function stripHtml(html: string): string {
    return html?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() || '';
}

async function getRegionData(slug: string) {
    const { data: region } = await supabaseServer
        .from('regions')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();
    
    if (!region) return null;
    
    // Get jobs in this region
    const { data: jobs, count: jobCount } = await supabaseServer
        .from('jobs')
        .select('id, title, slug, company_id, created_at, salary, type, location, description, companies:company_id(name, logo, slug)', { count: 'exact' })
        .eq('is_active', true)
        .ilike('location', `%${region.name}%`)
        .order('created_at', { ascending: false })
        .limit(30);
    
    // Get all categories for sidebar
    const { data: categories } = await supabaseServer
        .from('categories')
        .select('id, name, slug, icon')
        .eq('is_active', true)
        .order('name');
    
    // Get all regions for sidebar
    const { data: allRegions } = await supabaseServer
        .from('regions')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name');
    
    // Get total job count
    const { count: totalJobCount } = await supabaseServer
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
    
    // Get total company count
    const { count: totalCompanyCount } = await supabaseServer
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
    
    return {
        region,
        jobs: jobs || [],
        jobCount: jobCount || 0,
        categories: categories || [],
        allRegions: allRegions || [],
        totalJobCount: totalJobCount || 0,
        totalCompanyCount: totalCompanyCount || 0
    };
}

export async function generateMetadata({ params }: RegionPageProps): Promise<Metadata> {
    const data = await getRegionData(params.region);

    if (!data) {
        return {
            title: 'Region tapılmadı - Jooble.az',
        };
    }

    const { region, jobCount } = data;
    const title = region.seo_title || `${region.name} İş Elanları (${jobCount} Vakansiya) | Jooble.az`;
    const description = region.seo_description || `${region.name} regionunda ${jobCount}+ aktual iş elanları və vakansiyalar. ${region.name} şəhərində ən yaxşı iş imkanlarını kəşf edin. Pulsuz müraciət, gündəlik yenilənmə.`;

    return {
        title,
        description,
        keywords: region.seo_keywords?.join(', ') || `${region.name}, iş elanları, vakansiyalar, ${region.name} işlər, Azərbaycan`,
        alternates: {
            canonical: `https://jooble.az/regions/${region.slug}`,
            languages: {
                'az': `https://jooble.az/regions/${region.slug}`,
                'en': `https://jooble.az/en/regions/${region.slug}`,
                'ru': `https://jooble.az/ru/regions/${region.slug}`,
                'x-default': `https://jooble.az/regions/${region.slug}`,
            },
        },
        openGraph: {
            title,
            description,
            url: `https://jooble.az/regions/${region.slug}`,
            siteName: 'Jooble.az',
            type: 'website',
            locale: 'az_AZ',
            images: [
                {
                    url: 'https://jooble.az/icons/icon-512x512.jpg',
                    width: 512,
                    height: 512,
                    alt: `${region.name} İş Elanları`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['https://jooble.az/icons/icon-512x512.jpg'],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}

export default async function RegionPage({ params }: RegionPageProps) {
    const data = await getRegionData(params.region);
    
    if (!data) {
        return <RegionsClient />;
    }
    
    const { region, jobs, jobCount, categories, allRegions, totalJobCount, totalCompanyCount } = data;
    const plainDescription = stripHtml(region.description || '');
    const currentDate = new Date().toISOString();

    // Comprehensive @graph JSON-LD structure
    const graphData = {
        "@context": "https://schema.org",
        "@graph": [
            // WebSite
            {
                "@type": "WebSite",
                "@id": "https://jooble.az/#website",
                "url": "https://jooble.az",
                "name": "Jooble.az",
                "description": "Azərbaycanda iş axtarışı üçün ən böyük platforma",
                "publisher": { "@id": "https://jooble.az/#organization" },
                "inLanguage": "az-AZ"
            },
            // Organization
            {
                "@type": "Organization",
                "@id": "https://jooble.az/#organization",
                "name": "Jooble.az",
                "url": "https://jooble.az",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://jooble.az/icons/icon-512x512.jpg",
                    "width": 512,
                    "height": 512
                },
                "sameAs": [
                    "https://www.facebook.com/joobleaz",
                    "https://www.instagram.com/jooble.az",
                    "https://www.linkedin.com/company/jooble-az"
                ],
                "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "customer service",
                    "availableLanguage": ["az", "ru", "en"]
                }
            },
            // Place (Region)
            {
                "@type": "Place",
                "@id": `https://jooble.az/regions/${region.slug}/#place`,
                "name": region.name,
                "description": plainDescription || `${region.name} - Azərbaycanın əsas regionlarından biri. Bu regionda müxtəlif sahələrdə iş imkanları mövcuddur.`,
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": region.name,
                    "addressRegion": region.name,
                    "addressCountry": "AZ"
                },
                "geo": {
                    "@type": "GeoCoordinates",
                    "addressCountry": "AZ"
                },
                "containedInPlace": {
                    "@type": "Country",
                    "name": "Azərbaycan"
                }
            },
            // CollectionPage
            {
                "@type": "CollectionPage",
                "@id": `https://jooble.az/regions/${region.slug}/#webpage`,
                "url": `https://jooble.az/regions/${region.slug}`,
                "name": region.seo_title || `${region.name} İş Elanları`,
                "description": region.seo_description || `${region.name} regionunda ${jobCount} aktual iş elanı`,
                "isPartOf": { "@id": "https://jooble.az/#website" },
                "about": { "@id": `https://jooble.az/regions/${region.slug}/#place` },
                "inLanguage": "az-AZ",
                "dateModified": currentDate,
                "breadcrumb": { "@id": `https://jooble.az/regions/${region.slug}/#breadcrumb` },
                "mainEntity": { "@id": `https://jooble.az/regions/${region.slug}/#itemlist` }
            },
            // BreadcrumbList
            {
                "@type": "BreadcrumbList",
                "@id": `https://jooble.az/regions/${region.slug}/#breadcrumb`,
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
                        "name": "Regionlar",
                        "item": "https://jooble.az/regions"
                    },
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "name": region.name,
                        "item": `https://jooble.az/regions/${region.slug}`
                    }
                ]
            },
            // ItemList with JobPosting
            {
                "@type": "ItemList",
                "@id": `https://jooble.az/regions/${region.slug}/#itemlist`,
                "name": `${region.name} Vakansiyaları`,
                "description": `${region.name} regionunda ən son ${jobCount} iş elanı`,
                "numberOfItems": jobCount,
                "itemListElement": jobs.slice(0, 30).map((job: any, index: number) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "item": {
                        "@type": "JobPosting",
                        "@id": `https://jooble.az/vacancies/${job.slug}`,
                        "title": job.title,
                        "description": stripHtml(job.description || '').slice(0, 500),
                        "url": `https://jooble.az/vacancies/${job.slug}`,
                        "datePosted": job.created_at,
                        "employmentType": job.type === 'Tam ştat' ? 'FULL_TIME' : job.type === 'Part-time' ? 'PART_TIME' : 'OTHER',
                        "hiringOrganization": {
                            "@type": "Organization",
                            "name": job.companies?.name || "Şirkət",
                            "logo": job.companies?.logo || "https://jooble.az/icons/icon-192x192.jpg"
                        },
                        "jobLocation": {
                            "@type": "Place",
                            "address": {
                                "@type": "PostalAddress",
                                "addressLocality": region.name,
                                "addressRegion": region.name,
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
                        })
                    }
                }))
            },
            // FAQPage
            {
                "@type": "FAQPage",
                "@id": `https://jooble.az/regions/${region.slug}/#faq`,
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": `${region.name} regionunda neçə iş elanı var?`,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `Hazırda ${region.name} regionunda ${jobCount} aktiv iş elanı mövcuddur. İş elanları hər gün yenilənir və müxtəlif sahələri əhatə edir.`
                        }
                    },
                    {
                        "@type": "Question",
                        "name": `${region.name} şəhərində hansı sahələrdə iş tapmaq olar?`,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `${region.name} regionunda IT, satış, marketinq, maliyyə, inzibati, tikinti, təhsil, səhiyyə və digər sahələrdə iş imkanları mövcuddur. Jooble.az platformasında bütün vakansiyaları pulsuz görə bilərsiniz.`
                        }
                    },
                    {
                        "@type": "Question",
                        "name": `${region.name} regionunda iş axtarmaq üçün nə etməliyəm?`,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `${region.name} regionunda iş tapmaq üçün Jooble.az saytında axtarış edin, sizə uyğun vakansiyaları seçin və birbaşa şirkətlərə müraciət edin. Qeydiyyat tələb olunmur.`
                        }
                    },
                    {
                        "@type": "Question",
                        "name": `${region.name} şəhərində orta maaş nə qədərdir?`,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `${region.name} regionunda maaşlar sahəyə və təcrübəyə görə dəyişir. Ətraflı maaş məlumatları hər vakansiyada göstərilir. Bəzi vakansiyalarda maaş razılaşma yolu ilə müəyyənləşir.`
                        }
                    },
                    {
                        "@type": "Question",
                        "name": `Jooble.az-da ${region.name} vakansiyalarına necə müraciət edim?`,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `${region.name} vakansiyalarına müraciət etmək üçün vakansiya səhifəsinə daxil olun, "Müraciət et" düyməsini basın və şirkətin göstərdiyi formada (email, sayt və ya telefon) ərizənizi göndərin.`
                        }
                    },
                    {
                        "@type": "Question",
                        "name": `${region.name} regionunda uzaqdan iş imkanları varmı?`,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `Bəli, ${region.name} regionunda remote (uzaqdan) iş imkanları da mövcuddur. Xüsusilə IT, dizayn, marketinq və müştəri xidmətləri sahələrində uzaqdan işləmək mümkündür.`
                        }
                    }
                ]
            }
        ]
    };

    // Get popular job types in this region
    const jobTypes = Array.from(new Set(jobs.map((job: any) => job.type))).filter(Boolean);
    
    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(graphData) }}
            />
            
            {/* Server-rendered SEO content - 2000+ words, 100+ readability */}
            <article className="sr-only" aria-hidden="true" itemScope itemType="https://schema.org/Article">
                <header>
                    <h1 itemProp="headline">{region.h1_title || `${region.name} İş Elanları - Ən Yaxşı Vakansiyalar`}</h1>
                    <p itemProp="description">
                        {region.name} regionunda {jobCount} aktiv iş elanı mövcuddur. Bu səhifədə {region.name} şəhərində olan bütün vakansiyaları görə bilərsiniz.
                    </p>
                    <meta itemProp="dateModified" content={currentDate} />
                    <meta itemProp="author" content="Jooble.az" />
                </header>

                <nav aria-label="Breadcrumb">
                    <ol>
                        <li><a href="https://jooble.az">Ana Səhifə</a></li>
                        <li><a href="https://jooble.az/regions">Regionlar</a></li>
                        <li>{region.name}</li>
                    </ol>
                </nav>

                <section itemProp="articleBody">
                    <h2>{region.name} Haqqında Ətraflı Məlumat</h2>
                    {plainDescription && region.description ? (
                        <div dangerouslySetInnerHTML={{ __html: region.description }} />
                    ) : (
                        <p>
                            {region.name} Azərbaycanın ən vacib regionlarından biridir. Bu regionda müxtəlif sahələrdə iş imkanları mövcuddur.
                            {region.name} şəhəri iqtisadi inkişaf baxımından strateji əhəmiyyətə malikdir. Burada yerləşən şirkətlər müxtəlif sahələrdə
                            fəaliyyət göstərir və daim yeni işçilərə ehtiyac duyurlar. {region.name} regionunda yaşayan insanlar üçün iş tapmaq indi
                            daha asandır çünki Jooble.az platforması bütün vakansiyaları bir yerdə toplayır.
                        </p>
                    )}

                    <h2>{region.name} Regionunda İş Bazarı</h2>
                    <p>
                        {region.name} şəhərində iş bazarı dinamik şəkildə inkişaf edir. Hazırda bu regionda {jobCount} aktiv vakansiya mövcuddur.
                        Jooble.az platforması vasitəsilə siz {region.name} regionundakı bütün iş elanlarını pulsuz görə və müraciət edə bilərsiniz.
                        İş axtarışı prosesini asanlaşdırmaq üçün biz hər gün yeni vakansiyalar əlavə edirik.
                    </p>

                    <h3>{region.name} Şəhərində Populyar İş Sahələri</h3>
                    <p>
                        {region.name} regionunda ən çox tələb olunan sahələr bunlardır: IT və proqramlaşdırma, satış və marketinq, maliyyə və mühasibat,
                        inzibati işlər, tikinti və mühəndislik, təhsil və təlim, səhiyyə və tibb, turizm və mehmanxana biznesi, nəqliyyat və logistika,
                        istehsal və sənaye. Bu sahələrdə iş axtaran namizədlər üçün {region.name} şəhəri əla imkanlar təqdim edir.
                    </p>

                    <h2>{region.name} Vakansiyaları - Ən Son İş Elanları</h2>
                    <p>
                        Aşağıda {region.name} regionunda olan ən son {Math.min(jobCount, 30)} vakansiya siyahısı verilmişdir.
                        Hər vakansiya haqqında ətraflı məlumat almaq üçün elanın üzərinə klikləyin.
                    </p>
                    
                    <ul>
                        {jobs.map((job: any) => (
                            <li key={job.id}>
                                <article itemScope itemType="https://schema.org/JobPosting">
                                    <a href={`https://jooble.az/vacancies/${job.slug}`} itemProp="url">
                                        <h4 itemProp="title">{job.title}</h4>
                                    </a>
                                    <p>
                                        <span itemProp="hiringOrganization" itemScope itemType="https://schema.org/Organization">
                                            <span itemProp="name">{job.companies?.name || 'Şirkət'}</span>
                                        </span>
                                        {job.salary && <span> - Maaş: <span itemProp="baseSalary">{job.salary}</span></span>}
                                        <span> - Yer: <span itemProp="jobLocation">{job.location || region.name}</span></span>
                                        {job.type && <span> - Növ: <span itemProp="employmentType">{job.type}</span></span>}
                                    </p>
                                    <meta itemProp="datePosted" content={job.created_at} />
                                    <meta itemProp="description" content={stripHtml(job.description || '').slice(0, 200)} />
                                </article>
                            </li>
                        ))}
                    </ul>

                    <h2>{region.name} Regionunda İş Tapmaq Üçün Məsləhətlər</h2>
                    <p>
                        {region.name} şəhərində iş axtararkən bu məsləhətlərə əməl edin: CV-nizi daim yeniləyin və hər vakansiyaya uyğun düzəldin,
                        müraciət məktubunuzu hər iş üçün fərdiləşdirin, şirkətlər haqqında əvvəlcədən araşdırma aparın, müsahibəyə hazır olun,
                        peşəkar şəbəkənizi genişləndirin, LinkedIn profilinizi aktiv saxlayın. Bu məsləhətlər sizə {region.name} regionunda
                        daha tez iş tapmağa kömək edəcək.
                    </p>

                    <h3>İşəgötürənlər Üçün Məlumat</h3>
                    <p>
                        {region.name} regionunda işçi axtaran şirkətlər Jooble.az platformasından istifadə edərək vakansiyalarını pulsuz yerləşdirə bilərlər.
                        Platformamız Azərbaycanda {totalJobCount}+ aktiv vakansiya və {totalCompanyCount}+ qeydiyyatlı şirkətə ev sahibliyi edir.
                        {region.name} şəhərində iş elanı vermək üçün bizimlə əlaqə saxlayın.
                    </p>

                    <h2>Digər Regionlarda İş Elanları</h2>
                    <p>
                        {region.name} regionundan başqa Azərbaycanın digər bölgələrində də iş imkanları mövcuddur.
                        Aşağıda Azərbaycanın əsas regionları sadalanmışdır:
                    </p>
                    <ul>
                        {allRegions.filter((r: any) => r.slug !== region.slug).slice(0, 20).map((r: any) => (
                            <li key={r.id}>
                                <a href={`https://jooble.az/regions/${r.slug}`}>{r.name} İş Elanları</a>
                            </li>
                        ))}
                    </ul>

                    <h2>Kateqoriyalar üzrə İş Elanları</h2>
                    <p>
                        {region.name} regionunda müxtəlif kateqoriyalarda iş elanları mövcuddur.
                        Sizə uyğun sahəni seçin və bu sahədəki vakansiyaları araşdırın:
                    </p>
                    <ul>
                        {categories.slice(0, 20).map((cat: any) => (
                            <li key={cat.id}>
                                <a href={`https://jooble.az/categories/${cat.slug}`}>{cat.name}</a>
                            </li>
                        ))}
                    </ul>

                    <h2>{region.name} İş Bazarı Haqqında Statistika</h2>
                    <p>
                        {region.name} regionunda iş bazarı haqqında vacib statistik məlumatlar: Bu regionda hazırda {jobCount} aktiv vakansiya var.
                        Jooble.az platformasında ümumilikdə {totalJobCount}+ iş elanı və {totalCompanyCount}+ şirkət qeydiyyatdan keçib.
                        {categories.length} müxtəlif kateqoriyada vakansiyalar mövcuddur. {allRegions.length} regionda iş elanları yerləşdirilir.
                        Hər gün onlarla yeni vakansiya əlavə olunur və mövcud elanlar yenilənir.
                    </p>

                    {jobTypes.length > 0 && (
                        <>
                            <h3>{region.name} Regionunda İş Növləri</h3>
                            <p>
                                {region.name} şəhərində müxtəlif iş növləri mövcuddur: {jobTypes.join(', ')}.
                                Tam ştat, part-time, uzaqdan iş və digər formatlardan sizə uyğun olanı seçə bilərsiniz.
                            </p>
                        </>
                    )}

                    <h2>Niyə Jooble.az?</h2>
                    <p>
                        Jooble.az Azərbaycanda ən böyük iş axtarış platformasıdır. Biz {region.name} regionu daxil olmaqla bütün Azərbaycan üzrə
                        vakansiyaları bir yerdə toplayırıq. Platformamızın üstünlükləri: pulsuz istifadə, qeydiyyat tələb olunmur, gündəlik yenilənən
                        vakansiyalar, mobil uyğunluq, asan axtarış sistemi, birbaşa şirkətlərə müraciət imkanı. {region.name} şəhərində iş axtarırsınızsa,
                        Jooble.az sizin üçün ən yaxşı seçimdir.
                    </p>

                    <h2>Tez-tez Verilən Suallar - {region.name} İş Elanları</h2>
                    <dl>
                        <dt><strong>{region.name} regionunda neçə iş elanı var?</strong></dt>
                        <dd>Hazırda {region.name} regionunda {jobCount} aktiv iş elanı mövcuddur. İş elanları hər gün yenilənir.</dd>
                        
                        <dt><strong>{region.name} şəhərində hansı sahələrdə iş tapmaq olar?</strong></dt>
                        <dd>{region.name} regionunda IT, satış, marketinq, maliyyə, inzibati, tikinti, təhsil, səhiyyə sahələrində iş imkanları var.</dd>
                        
                        <dt><strong>{region.name} regionunda iş axtarmaq üçün nə etməliyəm?</strong></dt>
                        <dd>Jooble.az saytında axtarış edin, sizə uyğun vakansiyaları seçin və birbaşa şirkətlərə müraciət edin. Qeydiyyat tələb olunmur.</dd>
                        
                        <dt><strong>{region.name} şəhərində orta maaş nə qədərdir?</strong></dt>
                        <dd>Maaşlar sahəyə və təcrübəyə görə dəyişir. Ətraflı maaş məlumatları hər vakansiyada göstərilir.</dd>
                        
                        <dt><strong>Jooble.az-da {region.name} vakansiyalarına necə müraciət edim?</strong></dt>
                        <dd>Vakansiya səhifəsinə daxil olun, "Müraciət et" düyməsini basın və şirkətin göstərdiyi formada ərizənizi göndərin.</dd>
                        
                        <dt><strong>{region.name} regionunda uzaqdan iş imkanları varmı?</strong></dt>
                        <dd>Bəli, xüsusilə IT, dizayn, marketinq və müştəri xidmətləri sahələrində uzaqdan işləmək mümkündür.</dd>
                    </dl>

                    <h2>{region.name} - Əlaqə və Dəstək</h2>
                    <p>
                        {region.name} regionunda iş axtarışı ilə bağlı suallarınız varsa, bizimlə əlaqə saxlaya bilərsiniz.
                        Jooble.az komandası sizə kömək etməyə hazırdır. İş axtarışınızda uğurlar arzulayırıq!
                        Unutmayın ki, {region.name} şəhərində hər gün yeni iş imkanları yaranır. Mütəmadi olaraq platformamızı ziyarət edin
                        və ən son vakansiyalardan xəbərdar olun.
                    </p>

                    <h3>Son Sözlər</h3>
                    <p>
                        {region.name} regionu Azərbaycanda iş imkanları baxımından əhəmiyyətli bir bölgədir. Bu regionda {jobCount}+ aktiv vakansiya
                        sizin müraciətinizi gözləyir. İstər təcrübəli mütəxəssis olun, istərsə də karyeranıza yeni başlayan - {region.name} şəhərində
                        sizin üçün uyğun iş var. Jooble.az platforması vasitəsilə bütün vakansiyaları pulsuz görə, müqayisə edə və müraciət edə bilərsiniz.
                        İş axtarışınızda müvəffəqiyyətlər!
                    </p>
                </section>

                <footer>
                    <p>© 2024-2025 Jooble.az - {region.name} İş Elanları. Bütün hüquqlar qorunur.</p>
                    <p>Son yenilənmə: {new Date().toLocaleDateString('az-AZ')}</p>
                </footer>
            </article>
            
            <RegionsClient />
        </>
    );
}
