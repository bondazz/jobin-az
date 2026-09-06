import CategoriesClient from '@/components/CategoriesClient';
import { Metadata } from 'next';
import { supabaseServer } from '@/integrations/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minutes ISR cache

export const metadata: Metadata = {
    title: "İş Elanları Kateqoriyaları 2026 - Azərbaycanda 50+ Sahədə Vakansiyalar",
    description: "2026 Azərbaycan iş kateqoriyaları: IT, maliyyə, marketinq, satış, tibb, mühəndislik, mühasibatlıq və 50+ sahədə minlərlə aktiv vakansiya. Sahənizə uyğun iş tapın!",
    keywords: "iş elanları, vakansiyalar, kateqoriyalar, iş sahələri, Azərbaycan, iş axtarışı, karyera, IT vakansiyalar, maliyyə işləri, satış vakansiyaları, marketinq, tibb, mühəndislik",
    alternates: {
        canonical: 'https://jooble.az/categories',
        languages: {
            'az': 'https://jooble.az/categories',
            'en': 'https://jooble.az/en/categories',
            'ru': 'https://jooble.az/ru/categories',
            'x-default': 'https://jooble.az/categories',
        },
    },
    openGraph: {
        title: "İş Elanları Kateqoriyaları 2026 - 50+ Sahədə Vakansiyalar",
        description: "Azərbaycanda 50+ sahədə minlərlə aktiv vakansiya. IT, maliyyə, satış, tibb və digər kateqoriyalarda iş tapın!",
        url: 'https://jooble.az/categories',
        siteName: 'Jooble.az',
        type: 'website',
        images: [{
            url: 'https://jooble.az/icons/icon-512x512.jpg',
            width: 512,
            height: 512,
            alt: 'Jooble.az Kateqoriyalar'
        }]
    },
    twitter: {
        card: 'summary_large_image',
        title: "İş Elanları Kateqoriyaları 2026",
        description: "Azərbaycanda 50+ sahədə minlərlə aktiv vakansiya",
        images: ['https://jooble.az/icons/icon-512x512.jpg']
    }
};

async function getCategoriesData() {
    // Fetch categories
    const { data: categories } = await supabaseServer
        .from('categories')
        .select('id, name, slug, description, icon, h1_title, seo_title, seo_description')
        .eq('is_active', true)
        .order('name', { ascending: true });

    // Get job counts per category
    const { data: jobCounts } = await supabaseServer
        .from('jobs')
        .select('category_id')
        .eq('is_active', true);

    const categoryJobCounts: Record<string, number> = {};
    jobCounts?.forEach(job => {
        if (job.category_id) {
            categoryJobCounts[job.category_id] = (categoryJobCounts[job.category_id] || 0) + 1;
        }
    });

    // Get regions for SEO content
    const { data: regions } = await supabaseServer
        .from('regions')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name', { ascending: true });

    // Get companies count for SEO
    const { count: companiesCount } = await supabaseServer
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

    const totalJobs = Object.values(categoryJobCounts).reduce((sum, count) => sum + count, 0);

    // Add job counts to categories
    const categoriesWithCounts = categories?.map(cat => ({
        ...cat,
        jobsCount: categoryJobCounts[cat.id] || 0
    })) || [];

    // Sort by job count for popular categories
    const popularCategories = [...categoriesWithCounts].sort((a, b) => b.jobsCount - a.jobsCount);

    return {
        categories: categoriesWithCounts,
        popularCategories,
        categoryJobCounts,
        regions: regions || [],
        totalJobs,
        totalCategories: categories?.length || 0,
        companiesCount: companiesCount || 0
    };
}

function stripHtml(html: string): string {
    return html?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() || '';
}

export default async function CategoriesPage() {
    const { categories, popularCategories, categoryJobCounts, regions, totalJobs, totalCategories, companiesCount } = await getCategoriesData();

    const currentDate = new Date().toISOString();
    const currentYear = new Date().getFullYear();
    const top10Categories = popularCategories.slice(0, 10);
    const top5Categories = popularCategories.slice(0, 5);

    // @graph JSON-LD structured data
    const graphJsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "@id": "https://jooble.az/#website",
                "url": "https://jooble.az",
                "name": "Jooble.az",
                "description": "Azərbaycanda ən böyük iş axtarış platforması",
                "publisher": { "@id": "https://jooble.az/#organization" },
                "inLanguage": "az-AZ"
            },
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
                    "https://www.instagram.com/jooble.az"
                ],
                "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "customer service",
                    "availableLanguage": ["az", "ru", "en"]
                }
            },
            {
                "@type": "CollectionPage",
                "@id": "https://jooble.az/categories/#webpage",
                "url": "https://jooble.az/categories",
                "name": `İş Elanları Kateqoriyaları ${currentYear} - ${totalCategories}+ Sahədə Vakansiyalar`,
                "description": `Azərbaycanda ${totalCategories}+ sahədə ${totalJobs}+ aktiv vakansiya. İT, maliyyə, satış, tibb və digər kateqoriyalarda iş tapın!`,
                "isPartOf": { "@id": "https://jooble.az/#website" },
                "about": { "@id": "https://jooble.az/#organization" },
                "dateModified": currentDate,
                "inLanguage": "az-AZ"
            },
            {
                "@type": "ItemList",
                "@id": "https://jooble.az/categories/#itemlist",
                "name": "Azərbaycanda İş Kateqoriyaları",
                "description": `${totalCategories} fərqli iş sahəsində ${totalJobs} aktiv vakansiya`,
                "numberOfItems": totalCategories,
                "itemListElement": categories.slice(0, 50).map((category, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "name": category.name,
                    "url": `https://jooble.az/categories/${category.slug}`,
                    "description": stripHtml(category.seo_description || category.description || '').slice(0, 150) || `${category.name} sahəsində ${category.jobsCount} aktiv vakansiya`
                }))
            },
            {
                "@type": "BreadcrumbList",
                "@id": "https://jooble.az/categories/#breadcrumb",
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
                    }
                ]
            },
            {
                "@type": "FAQPage",
                "@id": "https://jooble.az/categories/#faq",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "Jooble.az-da neçə iş kateqoriyası var?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `Jooble.az platformasında ${totalCategories} fərqli iş kateqoriyası mövcuddur. Bu kateqoriyalarda cəmi ${totalJobs} aktiv vakansiya yerləşdirilib.`
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Ən çox vakansiya hansı sahələrdə var?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `${currentYear}-ci ildə ən çox vakansiya olan sahələr: ${top5Categories.map(c => `${c.name} (${c.jobsCount} vakansiya)`).join(', ')}. Bu sahələrdə daima yeni iş imkanları əlavə olunur.`
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "İş elanlarına necə müraciət edə bilərəm?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "İstənilən vakansiyaya müraciət etmək üçün elanın üzərinə klikləyin, təfərrüatları oxuyun və 'Müraciət et' düyməsinə basın. Əksər vakansiyalara birbaşa şirkətin veb-saytı və ya e-poçt vasitəsilə müraciət edə bilərsiniz."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Hansı regionlarda iş tapmaq olar?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `Bakı ilə yanaşı, ${regions.slice(0, 5).map(r => r.name).join(', ')} və digər regionlarda da aktiv vakansiyalar mövcuddur.`
                        }
                    }
                ]
            }
        ]
    };

    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(graphJsonLd) }}
            />

            {/* Server-rendered SEO content - hidden but crawlable */}
            <article className="sr-only" aria-hidden="true">
                <header>
                    <h1>İş Elanları Kateqoriyaları {currentYear} - Azərbaycanda {totalCategories}+ Sahədə Vakansiyalar</h1>
                    <p>
                        Jooble.az Azərbaycanda ən böyük iş axtarış platformasıdır. {totalCategories}+ fərqli sahədə {totalJobs}+ aktiv vakansiya 
                        sizin karyera yolunuzu tapmağınız üçün hazırdır. IT, maliyyə, marketinq, satış, tibb, mühəndislik, insan resursları 
                        və bir çox digər sahələrdə iş imkanları təqdim edirik.
                    </p>
                </header>

                <section>
                    <h2>Azərbaycanda İş Kateqoriyaları və Vakansiyalar</h2>
                    <p>
                        {currentYear}-ci ildə Azərbaycan əmək bazarı dinamik şəkildə inkişaf edir. {companiesCount}+ şirkət {totalCategories}+ 
                        fərqli sahədə {totalJobs}+ aktiv vakansiya elan edib. İT sektorundan tutmuş tibb sahəsinə, maliyyədən tutmuş 
                        marketinqə qədər - bütün sahələrdə sizin üçün uyğun iş imkanları mövcuddur.
                    </p>
                    <p>
                        Müasir əmək bazarı sürətlə dəyişir və yeni peşələr, yeni iş imkanları yaranır. Rəqəmsal transformasiya, 
                        süni intellekt, e-ticarət və fintech sahələrində tələb artır. Jooble.az olaraq biz bu dəyişikliklərə 
                        uyğunlaşaraq sizə ən müasir və tələb olunan sahələrdə iş tapmaq imkanı veririk.
                    </p>
                </section>

                <section>
                    <h2>Ən Populyar İş Kateqoriyaları - Top 10</h2>
                    <p>
                        İş axtarışında ən çox tələb olunan və ən çox vakansiya olan kateqoriyalar aşağıda sadalanmışdır. 
                        Bu sahələr Azərbaycan əmək bazarında ən aktiv sektorlardır.
                    </p>
                    <ol>
                        {top10Categories.map((category, index) => (
                            <li key={category.id}>
                                <a href={`/categories/${category.slug}`}>
                                    <strong>{index + 1}. {category.name}</strong> - {category.jobsCount} aktiv vakansiya
                                </a>
                                <p>
                                    {category.name} sahəsində Azərbaycanda {category.jobsCount} iş elanı mövcuddur. 
                                    Bu sahə işəgötürənlər tərəfindən yüksək tələbatla seçilir.
                                </p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section>
                    <h2>IT və Texnologiya Sahəsində İş İmkanları</h2>
                    <p>
                        İnformasiya texnologiyaları sahəsi Azərbaycanda ən sürətlə inkişaf edən sektorlardan biridir. 
                        Proqramçılar, sistem administratorları, veb dizaynerlər, data analitikləri və digər IT 
                        mütəxəssisləri üçün geniş iş imkanları mövcuddur. Şirkətlər rəqəmsal transformasiyaya 
                        keçdikcə IT mütəxəssislərinə olan tələbat artır.
                    </p>
                    <p>
                        Front-end və back-end development, mobil proqramlaşdırma, cloud computing, DevOps, 
                        kibertəhlükəsizlik və süni intellekt sahələrində iş axtaranlar üçün platformamızda 
                        çoxsaylı vakansiyalar mövcuddur. Python, JavaScript, Java, C#, PHP, React, Angular, 
                        Vue.js, Node.js kimi texnologiyalarda ixtisaslaşmış mütəxəssislər xüsusilə tələb olunur.
                    </p>
                </section>

                <section>
                    <h2>Maliyyə və Bank Sektoru Vakansiyaları</h2>
                    <p>
                        Maliyyə sektoru Azərbaycan iqtisadiyyatının əsas sütunlarından biridir. Banklar, sığorta 
                        şirkətləri, investisiya fondları və digər maliyyə institutları daima peşəkar kadrlar axtarır. 
                        Mühasib, auditor, maliyyə analitiki, kredit mütəxəssisi, risk meneceri və digər maliyyə 
                        peşəkarları üçün geniş iş imkanları mövcuddur.
                    </p>
                    <p>
                        Kapital Bank, PASHA Bank, Access Bank, Rabitəbank, Unibank, Xalq Bank və digər maliyyə 
                        institutları hər gün yeni vakansiyalar elan edir. CFA, ACCA, CPA sertifikatlarına malik 
                        mütəxəssislər üçün xüsusi imkanlar var.
                    </p>
                </section>

                <section>
                    <h2>Satış və Marketinq Sahəsində Karyera</h2>
                    <p>
                        Satış və marketinq sahəsi biznesin inkişafı üçün kritik əhəmiyyət daşıyır. Satış 
                        menecerləri, marketinq mütəxəssisləri, brend menecerləri, rəqəmsal marketinq ekspertləri 
                        və PR mütəxəssisləri üçün Azərbaycanda çoxsaylı iş imkanları mövcuddur.
                    </p>
                    <p>
                        Sosial media marketinqi, SEO mütəxəssisliyi, content marketing, performance marketing, 
                        Google Ads, Facebook Ads sahələrində ixtisaslaşmış kadrlar xüsusilə tələb olunur. 
                        B2B və B2C satış təcrübəsi olan mütəxəssislər üçün yaxşı maaş imkanları var.
                    </p>
                </section>

                <section>
                    <h2>Tibb və Səhiyyə Sektorunda İş</h2>
                    <p>
                        Səhiyyə sektoru həmişə peşəkar kadrlara ehtiyac duyur. Həkimlər, tibb bacıları, 
                        laborantlar, farmakoloqlar və digər tibb mütəxəssisləri üçün Azərbaycanda geniş 
                        iş imkanları var. Həm dövlət, həm də özəl tibb müəssisələri daima yeni kadrlar axtarır.
                    </p>
                    <p>
                        Ailə həkimləri, pediatrlar, cərrahlar, stomatoloqlar, oftalmoloqular və digər 
                        ixtisaslaşmış həkimlər üçün yaxşı iş şərtləri təklif olunur. Tibbi avadanlıq 
                        satış nümayəndələri, əczaçılar və tibb texnologiyaları mütəxəssisləri də tələb olunur.
                    </p>
                </section>

                <section>
                    <h2>Mühəndislik və Texniki Sahələr</h2>
                    <p>
                        Mühəndislik sahəsi Azərbaycan iqtisadiyyatının əsas sütunlarından biridir. Neft-qaz, 
                        tikinti, elektrik, mexanika, kimya mühəndisliyi sahələrində iş axtaranlar üçün 
                        platformamızda çoxsaylı vakansiyalar mövcuddur. SOCAR, BP, TPAO və digər şirkətlər 
                        daima mühəndis axtarır.
                    </p>
                    <p>
                        Layihə mühəndisləri, texniki mütəxəssislər, QA/QC mühəndisləri, HSE mütəxəssisləri, 
                        prosesş mühəndisləri və digər texniki kadrlar üçün həm yerli, həm də beynəlxalq 
                        şirkətlərdən iş təklifləri var.
                    </p>
                </section>

                <section>
                    <h2>İnsan Resursları və HR Sahəsi</h2>
                    <p>
                        İnsan resursları idarəetməsi hər şirkət üçün vacib funksiyalardan biridir. HR menecerləri, 
                        işə qəbul mütəxəssisləri (recruiter), təlim və inkişaf mütəxəssisləri, kompensasiya və 
                        benefitlər mütəxəssisləri HR sahəsində ən çox tələb olunan peşələrdir.
                    </p>
                    <p>
                        HR analitikləri, HRIS mütəxəssisləri və strateji HR partnerlər üçün də iş imkanları 
                        artmaqdadır. SHRM, CIPD sertifikatlarına malik mütəxəssislər üstünlük qazanır.
                    </p>
                </section>

                <section>
                    <h2>Bütün İş Kateqoriyaları - Tam Siyahı</h2>
                    <p>
                        Aşağıda Azərbaycanda mövcud olan bütün iş kateqoriyalarının tam siyahısı verilmişdir. 
                        Hər bir kateqoriyada aktiv vakansiya sayı göstərilir.
                    </p>
                    <ul>
                        {categories.map(category => (
                            <li key={category.id}>
                                <a href={`/categories/${category.slug}`}>
                                    <strong>{category.name}</strong> - {category.jobsCount} aktiv vakansiya
                                    {category.description && (
                                        <span>. {stripHtml(category.description).slice(0, 150)}</span>
                                    )}
                                </a>
                            </li>
                        ))}
                    </ul>
                </section>

                <section>
                    <h2>Regionlar üzrə İş İmkanları</h2>
                    <p>
                        Bakı şəhəri ilə yanaşı, Azərbaycanın digər regionlarında da çoxlu vakansiya mövcuddur. 
                        Gəncə, Sumqayıt, Mingəçevir, Şəki və digər şəhərlərdə iş imkanları artır.
                    </p>
                    <ul>
                        {regions.map(region => (
                            <li key={region.id}>
                                <a href={`/regions/${region.slug}`}>{region.name} vakansiyaları</a>
                            </li>
                        ))}
                    </ul>
                </section>

                <section>
                    <h2>İş Axtarışı üçün Tövsiyələr</h2>
                    <p>
                        Uğurlu iş axtarışı üçün bir neçə vacib məqamı nəzərə almaq lazımdır. İlk növbədə, 
                        öz ixtisasınıza və təcrübənizə uyğun kateqoriyanı seçin. CV-nizi yeniləyin və 
                        hər vakansiyaya uyğun tənzimləyin. Motivasiya məktubunuzu fərdiləşdirin.
                    </p>
                    <p>
                        LinkedIn profilinizi aktiv saxlayın, peşəkar şəbəkənizi genişləndirin. İş müsahibəsinə 
                        hazırlaşarkən şirkət haqqında araşdırma aparın. Maaş gözləntilərinizi bazarla 
                        müqayisə edin. Müntəzəm axtarış və aktiv müraciət uğurun açarıdır.
                    </p>
                </section>

                <section>
                    <h2>Niyə Jooble.az?</h2>
                    <p>
                        Jooble.az Azərbaycanın aparıcı iş axtarış platformasıdır. Biz sizə ən son və ən 
                        etibarlı iş elanlarını təqdim edirik:
                    </p>
                    <ul>
                        <li>Hər gün yenilənən {totalJobs}+ aktiv vakansiya</li>
                        <li>{totalCategories}+ fərqli iş kateqoriyası</li>
                        <li>{companiesCount}+ yoxlanılmış şirkət</li>
                        <li>Asan axtarış və filtrasiya sistemi</li>
                        <li>Pulsuz qeydiyyat və müraciət imkanı</li>
                        <li>Mobil tətbiq vasitəsilə hər yerdə əlçatan</li>
                        <li>Push bildirişlər ilə yeni vakansiyalardan xəbərdar olun</li>
                    </ul>
                </section>

                <section>
                    <h2>Tez-tez Verilən Suallar</h2>
                    <dl>
                        <dt>Jooble.az-da neçə iş kateqoriyası var?</dt>
                        <dd>Platformamızda {totalCategories} fərqli iş kateqoriyası mövcuddur.</dd>
                        
                        <dt>Ən çox vakansiya hansı sahələrdə var?</dt>
                        <dd>Ən çox vakansiya olan sahələr: {top5Categories.map(c => c.name).join(', ')}.</dd>
                        
                        <dt>Vakansiyalara necə müraciət edə bilərəm?</dt>
                        <dd>İstənilən vakansiyaya klikləyərək təfərrüatları görə və müraciət edə bilərsiniz.</dd>
                        
                        <dt>İş elanları nə qədər tez-tez yenilənir?</dt>
                        <dd>İş elanları hər gün yenilənir və yeni vakansiyalar əlavə olunur.</dd>
                        
                        <dt>Qeydiyyat pulsuzdurmu?</dt>
                        <dd>Bəli, Jooble.az-da qeydiyyat və iş axtarışı tamamilə pulsuzdur.</dd>
                    </dl>
                </section>

                <nav aria-label="Breadcrumb">
                    <ol>
                        <li><a href="https://jooble.az">Ana Səhifə</a></li>
                        <li><a href="https://jooble.az/categories">İş Elanları Kateqoriyaları</a></li>
                    </ol>
                </nav>

                <footer>
                    <p>
                        Bu səhifədə Azərbaycanda mövcud olan bütün iş kateqoriyaları haqqında məlumat verilir. 
                        Jooble.az - Azərbaycanın ən böyük iş axtarış platforması. {totalCategories} kateqoriyada 
                        {totalJobs}+ vakansiya. Son yenilənmə: {new Date().toLocaleDateString('az-AZ')}.
                    </p>
                </footer>
            </article>

            <CategoriesClient />
        </>
    );
}
