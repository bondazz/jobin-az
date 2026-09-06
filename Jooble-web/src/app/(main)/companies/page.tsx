import CompaniesClient from '@/components/CompaniesClient';
import { Metadata } from 'next';
import { supabaseServer } from '@/integrations/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // 24 hours ISR cache

export const metadata: Metadata = {
    title: "Şirkətlər və İş Elanları 2026 - Azərbaycanda 500+ Şirkət Vakansiyaları",
    description: "2026 Azərbaycan şirkət vakansiyaları: 500+ şirkətin yenilənən iş imkanları, Bakı və regionlarda işə qəbul, maaş məlumatları, karyera imkanları. Kontakt Home, SOCAR, Bravo, Kapital Bank və digər aparıcı şirkətlərdə iş tap!",
    keywords: "şirkətlər, is elanlari, vakansiyalar, Azərbaycan şirkətləri, Bakı iş elanları, işə qəbul 2026, karyera, maaş, SOCAR vakansiya, Kontakt Home iş, bank vakansiyaları",
    alternates: {
        canonical: 'https://jooble.az/companies',
        languages: {
            'az': 'https://jooble.az/companies',
            'en': 'https://jooble.az/en/companies',
            'ru': 'https://jooble.az/ru/companies',
            'x-default': 'https://jooble.az/companies',
        },
    },
    openGraph: {
        title: "Şirkətlər və İş Elanları 2026 - Azərbaycanda 500+ Şirkət",
        description: "Azərbaycanda 500+ şirkətin vakansiyaları, iş elanları və karyera imkanları. Ən yaxşı işəgötürənləri kəşf edin!",
        url: 'https://jooble.az/companies',
        siteName: 'Jooble.az',
        type: 'website',
        images: [{
            url: 'https://jooble.az/icons/icon-512x512.jpg',
            width: 512,
            height: 512,
            alt: 'Jooble.az Şirkətlər'
        }]
    },
    twitter: {
        card: 'summary_large_image',
        title: "Şirkətlər və İş Elanları 2026",
        description: "Azərbaycanda 500+ şirkətin vakansiyaları və iş elanları",
        images: ['https://jooble.az/icons/icon-512x512.jpg']
    }
};

async function getCompaniesData() {
    const { data: companies } = await supabaseServer
        .from('companies')
        .select('id, name, slug, logo, description, is_verified, address')
        .eq('is_active', true)
        .order('is_verified', { ascending: false })
        .order('name', { ascending: true })
        .limit(100);

    // Get job counts per company
    const { data: jobCounts } = await supabaseServer
        .from('jobs')
        .select('company_id')
        .eq('is_active', true);

    const companyJobCounts: Record<string, number> = {};
    jobCounts?.forEach(job => {
        if (job.company_id) {
            companyJobCounts[job.company_id] = (companyJobCounts[job.company_id] || 0) + 1;
        }
    });

    // Get categories for SEO content
    const { data: categories } = await supabaseServer
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name', { ascending: true });

    // Get regions for SEO content
    const { data: regions } = await supabaseServer
        .from('regions')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name', { ascending: true });

    const verifiedCount = companies?.filter(c => c.is_verified).length || 0;
    const totalJobs = Object.values(companyJobCounts).reduce((sum, count) => sum + count, 0);

    return {
        companies: companies || [],
        companyJobCounts,
        categories: categories || [],
        regions: regions || [],
        verifiedCount,
        totalJobs,
        totalCompanies: companies?.length || 0
    };
}

function stripHtml(html: string): string {
    return html?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() || '';
}

export default async function CompaniesPage() {
    const { companies, companyJobCounts, categories, regions, verifiedCount, totalJobs, totalCompanies } = await getCompaniesData();

    const currentDate = new Date().toISOString();
    const currentYear = new Date().getFullYear();

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
                "@id": "https://jooble.az/companies/#webpage",
                "url": "https://jooble.az/companies",
                "name": `Şirkətlər və İş Elanları ${currentYear} - Azərbaycanda ${totalCompanies}+ Şirkət`,
                "description": `Azərbaycanda ${totalCompanies}+ şirkətin ${totalJobs}+ vakansiyası. Ən yaxşı işəgötürənləri kəşf edin!`,
                "isPartOf": { "@id": "https://jooble.az/#website" },
                "about": { "@id": "https://jooble.az/#organization" },
                "dateModified": currentDate,
                "inLanguage": "az-AZ",
                "mainEntity": {
                    "@type": "ItemList",
                    "numberOfItems": totalCompanies,
                    "itemListElement": companies.slice(0, 50).map((company, index) => ({
                        "@type": "ListItem",
                        "position": index + 1,
                        "item": {
                            "@type": "Organization",
                            "name": company.name,
                            "url": `https://jooble.az/companies/${company.slug}`,
                            "logo": company.logo || undefined,
                            "description": stripHtml(company.description || '').slice(0, 150),
                            "address": company.address ? {
                                "@type": "PostalAddress",
                                "streetAddress": company.address,
                                "addressCountry": "AZ"
                            } : undefined,
                            "numberOfEmployees": companyJobCounts[company.id] ? {
                                "@type": "QuantitativeValue",
                                "value": companyJobCounts[company.id]
                            } : undefined
                        }
                    }))
                }
            },
            {
                "@type": "BreadcrumbList",
                "@id": "https://jooble.az/companies/#breadcrumb",
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
                        "name": "Şirkətlər",
                        "item": "https://jooble.az/companies"
                    }
                ]
            },
            {
                "@type": "FAQPage",
                "@id": "https://jooble.az/companies/#faq",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "Azərbaycanda ən çox işçi axtaran şirkətlər hansılardır?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `${currentYear}-ci ildə Kontakt Home, SOCAR, Kapital Bank, Bravo, Azerconnect, PASHA Holding və digər aparıcı şirkətlər ən çox vakansiya elan edən şirkətlər sırasındadır. Jooble.az-da ${totalCompanies}+ şirkətin ${totalJobs}+ aktiv vakansiyasını görə bilərsiniz.`
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Şirkətlər haqqında məlumatı haradan əldə edə bilərəm?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Jooble.az-da hər şirkətin ayrıca profil səhifəsi var. Bu səhifələrdə şirkət haqqında məlumat, aktiv vakansiyalar, əlaqə məlumatları və digər detalları tapa bilərsiniz."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Təsdiqlənmiş şirkət nə deməkdir?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `Təsdiqlənmiş şirkətlər Jooble.az komandası tərəfindən yoxlanılmış və etibarlı işəgötürənlərdir. Hazırda ${verifiedCount} təsdiqlənmiş şirkət platformamızda qeydiyyatdadır.`
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Hansı sahələrdə ən çox vakansiya var?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `${currentYear}-ci ildə IT, Satış, Marketinq, Maliyyə, Mühasibatlıq, Tibb, Təhsil və Xidmət sektorlarında ən çox vakansiya mövcuddur. ${categories.slice(0, 5).map(c => c.name).join(', ')} kateqoriyalarında yüzlərlə iş elanı var.`
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Regionlarda hansı şirkətlər işçi axtarır?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `Bakı ilə yanaşı, ${regions.slice(0, 5).map(r => r.name).join(', ')} və digər regionlarda da aktiv şirkətlər və vakansiyalar mövcuddur.`
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
                    <h1>Azərbaycanda Şirkətlər və İş Elanları {currentYear} - {totalCompanies}+ İşəgötürən</h1>
                    <p>
                        Jooble.az Azərbaycanda ən böyük iş axtarış platformasıdır. {totalCompanies}+ şirkətin {totalJobs}+ aktiv vakansiyasını 
                        bir platformada təqdim edirik. Bakı və regionlarda minlərlə iş imkanı, karyera perspektivləri və peşəkar inkişaf 
                        şansları sizi gözləyir.
                    </p>
                </header>

                <section>
                    <h2>Azərbaycanda Aparıcı Şirkətlər və İşəgötürənlər</h2>
                    <p>
                        {currentYear}-ci ildə Azərbaycan əmək bazarında {totalCompanies}+ şirkət aktiv şəkildə işçi axtarır. Bu şirkətlər 
                        arasında neft-qaz sektoru, bank və maliyyə, telekommunikasiya, pərakəndə satış, IT və texnologiya, tikinti, 
                        turizm və qonaqpərvərlik, tibb və əczaçılıq, təhsil və digər sahələrdə fəaliyyət göstərən müəssisələr var.
                    </p>
                    <p>
                        Kontakt Home, SOCAR, Kapital Bank, PASHA Holding, Azerconnect, Bravo, Azersun Holding, ABB, ASAN Xidmət, 
                        Azərbaycan Dövlət Neft Şirkəti, Access Bank, Bank of Baku, Rabitəbank, Unibank, Xalq Bank, Azərbaycan 
                        Beynəlxalq Bankı və digər nüfuzlu şirkətlər platformamızda təmsil olunur.
                    </p>
                </section>

                <section>
                    <h2>Təsdiqlənmiş Şirkətlər - Etibarlı İşəgötürənlər</h2>
                    <p>
                        Jooble.az-da {verifiedCount} şirkət "Təsdiqlənmiş" statusuna malikdir. Bu şirkətlər komandamız tərəfindən 
                        yoxlanılmış, etibarlı və peşəkar işəgötürənlərdir. Təsdiqlənmiş şirkətlərdə işə müraciət edərkən daha 
                        təhlükəsiz hiss edə bilərsiniz.
                    </p>
                    <p>
                        Təsdiqlənmə prosesi şirkətin qanuni fəaliyyətini, vergi qeydiyyatını, işçi hüquqlarına riayət etməsini 
                        və digər meyarları əhatə edir. Bu sistem iş axtaranları fırıldaqçılardan qorumaq məqsədi daşıyır.
                    </p>
                </section>

                <section>
                    <h2>Sektorlar üzrə Şirkətlər və Vakansiyalar</h2>
                    
                    <h3>Neft-Qaz və Energetika Sektoru</h3>
                    <p>
                        Azərbaycanın iqtisadiyyatının təməlini təşkil edən neft-qaz sektoru ölkənin ən böyük işəgötürənlərindən biridir. 
                        SOCAR, BP Azerbaijan, TPAO, Lukoil, CNPC və digər beynəlxalq şirkətlər minlərlə mütəxəssisə iş imkanı yaradır. 
                        Mühəndislər, texniklər, geololar, neft-qaz operatorları, təhlükəsizlik mütəxəssisləri bu sektorda ən çox 
                        axtarılan peşələrdir.
                    </p>

                    <h3>Bank və Maliyyə Sektoru</h3>
                    <p>
                        Kapital Bank, PASHA Bank, Access Bank, Bank of Baku, Rabitəbank, Unibank, Xalq Bank, ABB, Azərbaycan 
                        Beynəlxalq Bankı və digər maliyyə institutları daim yeni kadrlar axtarır. Kredit mütəxəssisləri, 
                        mühasiblər, maliyyə analitikləri, risk menecerləri, müştəri xidmətləri nümayəndələri bank sektorunda 
                        populyar vəzifələrdir.
                    </p>

                    <h3>IT və Texnologiya Sahəsi</h3>
                    <p>
                        Rəqəmsal transformasiya ilə IT sektoru sürətlə inkişaf edir. Proqramçılar, veb developerlar, mobil 
                        tətbiq yaradıcıları, sistem administratorları, şəbəkə mühəndisləri, kibertəhlükəsizlik mütəxəssisləri, 
                        data analitikləri, UX/UI dizaynerləri IT şirkətlərinin ən çox axtardığı mütəxəssislərdir.
                    </p>

                    <h3>Pərakəndə Satış və Ticarət</h3>
                    <p>
                        Bravo, Araz, Bolmart, Neptun, Kontakt Home və digər pərakəndə satış şəbəkələri Azərbaycanda minlərlə 
                        insana iş imkanı yaradır. Satış məsləhətçiləri, mağaza müdirləri, kassirlar, anbardarlar, logistika 
                        mütəxəssisləri bu sektorda ən çox tələb olunan peşələrdir.
                    </p>

                    <h3>Telekommunikasiya Sektoru</h3>
                    <p>
                        Azercell, Bakcell, Nar (Azerfon), Azerconnect və digər telekommunikasiya şirkətləri texniki mütəxəssislər, 
                        satış menecerləri, müştəri xidmətləri nümayəndələri və marketinq mütəxəssisləri axtarır.
                    </p>

                    <h3>Tikinti və Daşınmaz Əmlak</h3>
                    <p>
                        Azərbaycanın tikinti sektoru dinamik inkişaf edir. Mühəndislər, arxitektorlar, prora, tikinti fəhlələri, 
                        daşınmaz əmlak agentləri və layihə menecerləri bu sahədə tələb olunan mütəxəssislərdir.
                    </p>

                    <h3>Tibb və Əczaçılıq</h3>
                    <p>
                        Xəstəxanalar, klinikalar, apteklər və tibbi avadanlıq şirkətləri həkim, tibb bacısı, laborant, 
                        əczaçı və tibbi satış nümayəndəsi kimi mütəxəssislər axtarır.
                    </p>

                    <h3>Turizm və Qonaqpərvərlik</h3>
                    <p>
                        Otellər, restoranlar, turizm agentlikləri və əyləncə mərkəzləri resepsionist, ofisiant, aşpaz, 
                        turizm meneceri və müştəri xidmətləri mütəxəssisləri axtarır.
                    </p>
                </section>

                <section>
                    <h2>Kateqoriyalar üzrə İş Elanları</h2>
                    <p>
                        Jooble.az-da iş elanları müxtəlif kateqoriyalara bölünüb. Bu sizə axtardığınız sahədə vakansiyaları 
                        daha asan tapmağa kömək edir:
                    </p>
                    <ul>
                        {categories.map(category => (
                            <li key={category.id}>
                                <a href={`/categories/${category.slug}`}>{category.name} vakansiyaları</a>
                            </li>
                        ))}
                    </ul>
                </section>

                <section>
                    <h2>Regionlar üzrə Şirkətlər</h2>
                    <p>
                        Bakı şəhəri ilə yanaşı, Azərbaycanın digər regionlarında da çoxlu şirkət və vakansiya mövcuddur. 
                        Regional işəgötürənlər yerli kadrların işə cəlb edilməsində mühüm rol oynayır:
                    </p>
                    <ul>
                        {regions.map(region => (
                            <li key={region.id}>
                                <a href={`/regions/${region.slug}`}>{region.name} şirkətləri və vakansiyaları</a>
                            </li>
                        ))}
                    </ul>
                </section>

                <section>
                    <h2>Şirkətlərin Tam Siyahısı - {totalCompanies} İşəgötürən</h2>
                    <p>Aşağıda platformamızda qeydiyyatda olan aktiv şirkətlərin siyahısı verilmişdir:</p>
                    <ul>
                        {companies.map(company => (
                            <li key={company.id}>
                                <a href={`/companies/${company.slug}`}>
                                    {company.name} {company.is_verified && '✓ Təsdiqlənmiş'} 
                                    {companyJobCounts[company.id] && ` - ${companyJobCounts[company.id]} aktiv vakansiya`}
                                </a>
                                {company.description && (
                                    <p>{stripHtml(company.description).slice(0, 200)}...</p>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>

                <section>
                    <h2>İş Axtaranlar üçün Tövsiyələr</h2>
                    <p>
                        Uğurlu karyera qurmaq üçün düzgün şirkət seçimi çox vacibdir. İşə müraciət etməzdən əvvəl şirkət 
                        haqqında araşdırma aparın, rəyləri oxuyun, korporativ mədəniyyəti öyrənin. CV-nizi müntəzəm 
                        yeniləyin, müsahibəyə hazırlaşın, peşəkar bacarıqlarınızı inkişaf etdirin.
                    </p>
                    <p>
                        Jooble.az-da iş elanlarına abunə ola, seçdiyiniz kateqoriyalarda yeni vakansiyalar haqqında 
                        bildiriş ala bilərsiniz. Bu, istədiyiniz vəzifəni ilk siz görməyinizə kömək edəcək.
                    </p>
                </section>

                <section>
                    <h2>Şirkətlər üçün Xidmətlər</h2>
                    <p>
                        İşəgötürənlər Jooble.az-da pulsuz və pullu vakansiya yerləşdirmə xidmətlərindən istifadə edə bilər. 
                        Premium vakansiyalar daha çox namizəd cəlb edir, TOP yerləşmə ilə elanınız daha çox görünür. 
                        Referral proqramımız vasitəsilə partnyor olaraq qazanc əldə edə bilərsiniz.
                    </p>
                </section>

                <section>
                    <h2>Tez-tez Verilən Suallar</h2>
                    <dl>
                        <dt>Azərbaycanda ən çox işçi axtaran şirkətlər hansılardır?</dt>
                        <dd>
                            {currentYear}-ci ildə Kontakt Home, SOCAR, Kapital Bank, Bravo, Azerconnect, PASHA Holding 
                            və digər aparıcı şirkətlər ən çox vakansiya elan edən şirkətlər sırasındadır.
                        </dd>

                        <dt>Şirkətlər haqqında məlumatı haradan əldə edə bilərəm?</dt>
                        <dd>
                            Jooble.az-da hər şirkətin ayrıca profil səhifəsi var. Bu səhifələrdə şirkət haqqında məlumat, 
                            aktiv vakansiyalar, əlaqə məlumatları və digər detalları tapa bilərsiniz.
                        </dd>

                        <dt>Təsdiqlənmiş şirkət nə deməkdir?</dt>
                        <dd>
                            Təsdiqlənmiş şirkətlər Jooble.az komandası tərəfindən yoxlanılmış və etibarlı işəgötürənlərdir. 
                            Hazırda {verifiedCount} təsdiqlənmiş şirkət platformamızda qeydiyyatdadır.
                        </dd>

                        <dt>Hansı sahələrdə ən çox vakansiya var?</dt>
                        <dd>
                            IT, Satış, Marketinq, Maliyyə, Mühasibatlıq, Tibb, Təhsil və Xidmət sektorlarında ən çox vakansiya mövcuddur.
                        </dd>

                        <dt>Regionlarda hansı şirkətlər işçi axtarır?</dt>
                        <dd>
                            Bakı ilə yanaşı, Sumqayıt, Gəncə, Mingəçevir, Lənkəran və digər regionlarda da aktiv şirkətlər 
                            və vakansiyalar mövcuddur.
                        </dd>
                    </dl>
                </section>

                <footer>
                    <p>
                        © {currentYear} Jooble.az - Azərbaycanda ən böyük iş axtarış platforması. {totalCompanies}+ şirkət, 
                        {totalJobs}+ vakansiya. Karyeranızı bizimlə qurun!
                    </p>
                    <nav>
                        <a href="/">Ana Səhifə</a> | 
                        <a href="/vacancies">Vakansiyalar</a> | 
                        <a href="/categories">Kateqoriyalar</a> | 
                        <a href="/regions">Regionlar</a> | 
                        <a href="/blog">Bloq</a> | 
                        <a href="/about">Haqqımızda</a>
                    </nav>
                </footer>
            </article>

            {/* Interactive client component */}
            <CompaniesClient />
        </>
    );
}
