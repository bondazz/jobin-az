import CategoriesClient from '@/components/CategoriesClient';
import { Metadata } from 'next';
import { supabaseServer } from '@/integrations/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

type Props = {
    params: { category: string }
};

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

async function getCategoryData(slug: string) {
    const { data: category } = await supabaseServer
        .from('categories')
        .select('id, name, description, seo_title, seo_description, seo_keywords, slug, h1_title, icon')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

    if (!category) return null;

    const { count: jobsCount } = await supabaseServer
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)
        .eq('is_active', true);

    const { data: recentJobs } = await supabaseServer
        .from('jobs')
        .select(`
            id, title, slug, location, type, salary, created_at, description,
            companies:company_id(name, logo, slug)
        `)
        .eq('category_id', category.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(30);

    const { data: allCategories } = await supabaseServer
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .neq('id', category.id)
        .limit(10);

    const { data: regions } = await supabaseServer
        .from('regions')
        .select('id, name, slug')
        .eq('is_active', true)
        .limit(10);

    return {
        category,
        jobsCount: jobsCount || 0,
        recentJobs: recentJobs || [],
        relatedCategories: allCategories || [],
        regions: regions || []
    };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const data = await getCategoryData(params.category);

    if (!data) return {};

    const { category, jobsCount } = data;
    const title = category.seo_title || `${category.name} Vakansiyaları | ${jobsCount} İş Elanı - Jooble.az`;
    const description = category.seo_description || `${category.name} sahəsində ${jobsCount} aktiv vakansiya. Azərbaycanda ${category.name} üzrə ən yeni iş elanları və vakansiyalar.`;
    const keywords = category.seo_keywords?.join(', ') || `${category.name}, vakansiya, iş elanları, ${category.name} işləri, ${category.name} vakansiyaları`;
    const canonicalUrl = `https://jooble.az/categories/${category.slug}`;

    return {
        title,
        description,
        keywords,
        alternates: {
            canonical: canonicalUrl,
            languages: {
                'az': `https://jooble.az/categories/${category.slug}`,
                'en': `https://jooble.az/en/categories/${category.slug}`,
                'ru': `https://jooble.az/ru/categories/${category.slug}`,
                'x-default': `https://jooble.az/categories/${category.slug}`,
            },
        },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            siteName: 'Jooble.az',
            type: 'website',
            locale: 'az_AZ',
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

    const { category, jobsCount, recentJobs, relatedCategories, regions } = data;
    const plainDescription = category.description ? stripHtml(category.description) : '';
    const currentDate = new Date().toISOString();
    const categoryTitle = category.h1_title || `${category.name} Vakansiyaları`;

    const graphData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "@id": "https://jooble.az/#website",
                "url": "https://jooble.az",
                "name": "Jooble.az",
                "description": "Azərbaycanda iş elanları və vakansiyalar portalı",
                "inLanguage": "az-AZ",
                "publisher": { "@id": "https://jooble.az/#organization" }
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
                "sameAs": [],
                "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "customer service",
                    "availableLanguage": ["az", "ru", "en"]
                }
            },
            {
                "@type": "CollectionPage",
                "@id": `https://jooble.az/categories/${category.slug}/#webpage`,
                "url": `https://jooble.az/categories/${category.slug}`,
                "name": categoryTitle,
                "description": category.seo_description || `${category.name} sahəsində ${jobsCount} aktiv vakansiya`,
                "isPartOf": { "@id": "https://jooble.az/#website" },
                "about": { "@id": "https://jooble.az/#organization" },
                "dateModified": currentDate,
                "inLanguage": "az-AZ"
            },
            {
                "@type": "ItemList",
                "@id": `https://jooble.az/categories/${category.slug}/#itemlist`,
                "name": `${category.name} Vakansiyaları`,
                "description": `${category.name} sahəsində ${jobsCount} aktiv iş elanı`,
                "numberOfItems": Math.min(recentJobs.length, 30),
                "itemListElement": recentJobs.slice(0, 30).map((job: any, index: number) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "item": {
                        "@type": "JobPosting",
                        "@id": `https://jooble.az/vacancies/${job.slug}`,
                        "title": job.title,
                        "description": stripHtml(job.description || job.title).slice(0, 200),
                        "datePosted": job.created_at ? new Date(job.created_at).toISOString().split('T')[0] : currentDate.split('T')[0],
                        "url": `https://jooble.az/vacancies/${job.slug}`,
                        "hiringOrganization": {
                            "@type": "Organization",
                            "name": job.companies?.name || "Şirkət",
                            "logo": job.companies?.logo || "https://jooble.az/icons/icon-512x512.jpg"
                        },
                        "jobLocation": {
                            "@type": "Place",
                            "address": {
                                "@type": "PostalAddress",
                                "addressLocality": job.location || "Bakı",
                                "addressCountry": "AZ"
                            }
                        },
                        "employmentType": job.type === "Tam zamanlı" ? "FULL_TIME" : job.type === "Yarım zamanlı" ? "PART_TIME" : "OTHER",
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
            {
                "@type": "BreadcrumbList",
                "@id": `https://jooble.az/categories/${category.slug}/#breadcrumb`,
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
            },
            {
                "@type": "FAQPage",
                "@id": `https://jooble.az/categories/${category.slug}/#faq`,
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": `${category.name} sahəsində neçə vakansiya var?`,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `Hazırda Jooble.az-da ${category.name} sahəsində ${jobsCount} aktiv vakansiya mövcuddur. Yeni iş elanları hər gün əlavə olunur.`
                        }
                    },
                    {
                        "@type": "Question",
                        "name": `${category.name} sahəsində iş tapmaq üçün nə etməliyəm?`,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `${category.name} sahəsində iş tapmaq üçün Jooble.az saytında bu kateqoriyadakı vakansiyaları nəzərdən keçirin. Uyğun vakansiya tapdıqda "Müraciət et" düyməsini basaraq birbaşa şirkətə müraciət edə bilərsiniz.`
                        }
                    },
                    {
                        "@type": "Question",
                        "name": `${category.name} üzrə maaş səviyyəsi nə qədərdir?`,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `${category.name} sahəsində maaş səviyyəsi təcrübə, vəzifə və şirkətdən asılı olaraq dəyişir. Dəqiq maaş məlumatları hər vakansiya elanında göstərilir.`
                        }
                    },
                    {
                        "@type": "Question",
                        "name": `${category.name} vakansiyalarına necə müraciət edim?`,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `Jooble.az-da ${category.name} vakansiyasına müraciət etmək üçün elanı açın və "Müraciət et" düyməsini basın. Bəzi elanlar e-poçt, bəziləri isə şirkətin öz saytı vasitəsilə müraciət qəbul edir.`
                        }
                    },
                    {
                        "@type": "Question",
                        "name": `${category.name} sahəsində uzaqdan iş imkanları varmı?`,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `Bəli, ${category.name} sahəsində uzaqdan (remote) iş imkanları da mövcuddur. Vakansiya axtarışı zamanı iş növü filterindən "Uzaqdan" seçimini edərək bu tip elanları tapa bilərsiniz.`
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
                dangerouslySetInnerHTML={{ __html: JSON.stringify(graphData) }}
            />
            
            {/* Hidden SEO content for search engines */}
            <div className="sr-only">
                <article>
                    <h1>{categoryTitle}</h1>
                    
                    <section>
                        <h2>{category.name} Haqqında</h2>
                        <p><strong>Kateqoriya:</strong> {category.name}</p>
                        <p><strong>Aktiv Vakansiya Sayı:</strong> {jobsCount}</p>
                        {plainDescription && (
                            <div>
                                <h3>Təsvir</h3>
                                <p>{plainDescription}</p>
                            </div>
                        )}
                    </section>

                    <section>
                        <h2>{category.name} Sahəsində İş İmkanları</h2>
                        <p>
                            Azərbaycanda {category.name} sahəsi dinamik inkişaf edən sektorlardan biridir. 
                            Bu sahədə çalışmaq istəyən mütəxəssislər üçün Jooble.az platformasında 
                            {jobsCount} aktiv vakansiya mövcuddur. {category.name} üzrə iş elanları 
                            müxtəlif şirkətlərdən, tam zamanlı və yarım zamanlı iş imkanlarını əhatə edir.
                        </p>
                        <p>
                            {category.name} sahəsində karyera qurmaq istəyənlər üçün bu kateqoriya 
                            geniş imkanlar təqdim edir. Şirkətlər daim yeni mütəxəssislər axtarır 
                            və rəqabətqabiliyyətli maaşlar təklif edirlər. İş axtaranlar öz bacarıqlarına 
                            və təcrübələrinə uyğun vakansiyaları asanlıqla tapa bilərlər.
                        </p>
                    </section>

                    {recentJobs.length > 0 && (
                        <section>
                            <h2>{category.name} Sahəsində Son Vakansiyalar</h2>
                            <p>
                                Bu gün {category.name} kateqoriyasında {recentJobs.length} yeni vakansiya əlavə edilib. 
                                Aşağıda ən son iş elanlarını görə bilərsiniz:
                            </p>
                            <ul>
                                {recentJobs.map((job: any) => (
                                    <li key={job.id}>
                                        <a href={`https://jooble.az/vacancies/${job.slug}`}>
                                            <strong>{job.title}</strong>
                                            {job.companies?.name && ` - ${job.companies.name}`}
                                            {job.location && ` | Yer: ${job.location}`}
                                            {job.salary && ` | Maaş: ${job.salary}`}
                                            {job.type && ` | Tip: ${job.type}`}
                                        </a>
                                        <p>{stripHtml(job.description || '').slice(0, 150)}...</p>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <section>
                        <h2>{category.name} Sahəsində İş Axtarışı Üçün Məsləhətlər</h2>
                        <p>
                            {category.name} sahəsində uğurlu iş axtarışı üçün aşağıdakı məsləhətlərə əməl edin:
                        </p>
                        <ul>
                            <li>CV-nizi {category.name} sahəsinə uyğun hazırlayın və əsas bacarıqlarınızı vurğulayın</li>
                            <li>Şirkətlər haqqında əvvəlcədən araşdırma aparın</li>
                            <li>Müsahibəyə hazırlaşarkən {category.name} sahəsindəki son trendləri öyrənin</li>
                            <li>LinkedIn və digər peşəkar şəbəkələrdə aktiv olun</li>
                            <li>Jooble.az-da bildirişlərə abunə olun ki, yeni {category.name} vakansiyalarından xəbərdar olasınız</li>
                        </ul>
                    </section>

                    <section>
                        <h2>{category.name} Sahəsində Tələb Olunan Bacarıqlar</h2>
                        <p>
                            {category.name} sahəsində işləmək üçün müəyyən texniki və ümumi bacarıqlar tələb olunur. 
                            İşəgötürənlər adətən aşağıdakı keyfiyyətlərə üstünlük verirlər:
                        </p>
                        <ul>
                            <li>Sahəyə aid peşəkar bilik və təcrübə</li>
                            <li>Komanda işi və kommunikasiya bacarıqları</li>
                            <li>Problem həll etmə qabiliyyəti</li>
                            <li>Azərbaycan, rus və ingilis dillərini bilmək</li>
                            <li>Kompüter savadlılığı və müasir texnologiyalardan istifadə bacarığı</li>
                        </ul>
                    </section>

                    {relatedCategories.length > 0 && (
                        <section>
                            <h2>Əlaqəli İş Kateqoriyaları</h2>
                            <p>
                                {category.name} sahəsi ilə yanaşı, aşağıdakı kateqoriyalarda da iş imkanlarına baxa bilərsiniz:
                            </p>
                            <ul>
                                {relatedCategories.map((cat: any) => (
                                    <li key={cat.id}>
                                        <a href={`https://jooble.az/categories/${cat.slug}`}>
                                            {cat.name} Vakansiyaları
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {regions.length > 0 && (
                        <section>
                            <h2>{category.name} Vakansiyaları Regionlar Üzrə</h2>
                            <p>
                                Azərbaycanın müxtəlif regionlarında {category.name} sahəsində iş imkanları mövcuddur:
                            </p>
                            <ul>
                                {regions.map((region: any) => (
                                    <li key={region.id}>
                                        <a href={`https://jooble.az/regions/${region.slug}`}>
                                            {region.name} - İş Elanları
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <section>
                        <h2>Tez-tez Verilən Suallar</h2>
                        
                        <h3>{category.name} sahəsində neçə vakansiya var?</h3>
                        <p>Hazırda Jooble.az-da {category.name} sahəsində {jobsCount} aktiv vakansiya mövcuddur. Yeni iş elanları hər gün əlavə olunur.</p>
                        
                        <h3>{category.name} sahəsində iş tapmaq üçün nə etməliyəm?</h3>
                        <p>{category.name} sahəsində iş tapmaq üçün Jooble.az saytında bu kateqoriyadakı vakansiyaları nəzərdən keçirin. Uyğun vakansiya tapdıqda "Müraciət et" düyməsini basaraq birbaşa şirkətə müraciət edə bilərsiniz.</p>
                        
                        <h3>{category.name} üzrə maaş səviyyəsi nə qədərdir?</h3>
                        <p>{category.name} sahəsində maaş səviyyəsi təcrübə, vəzifə və şirkətdən asılı olaraq dəyişir. Dəqiq maaş məlumatları hər vakansiya elanında göstərilir.</p>
                        
                        <h3>{category.name} vakansiyalarına necə müraciət edim?</h3>
                        <p>Jooble.az-da {category.name} vakansiyasına müraciət etmək üçün elanı açın və "Müraciət et" düyməsini basın. Bəzi elanlar e-poçt, bəziləri isə şirkətin öz saytı vasitəsilə müraciət qəbul edir.</p>
                        
                        <h3>{category.name} sahəsində uzaqdan iş imkanları varmı?</h3>
                        <p>Bəli, {category.name} sahəsində uzaqdan (remote) iş imkanları da mövcuddur. Vakansiya axtarışı zamanı iş növü filterindən "Uzaqdan" seçimini edərək bu tip elanları tapa bilərsiniz.</p>
                    </section>

                    <section>
                        <h2>Niyə Jooble.az?</h2>
                        <p>
                            Jooble.az Azərbaycanın aparıcı iş axtarış platformasıdır. Biz hər gün minlərlə 
                            yeni vakansiya əlavə edirik və iş axtaranlara ən müasir alətləri təqdim edirik. 
                            {category.name} sahəsində iş axtarırsınızsa, doğru yerə gəlmisiniz!
                        </p>
                        <ul>
                            <li>Hər gün yenilənən vakansiya bazası</li>
                            <li>Etibarlı şirkətlərdən iş elanları</li>
                            <li>Asan və sürətli müraciət prosesi</li>
                            <li>Pulsuz bildiriş xidməti</li>
                            <li>Mobil tətbiq dəstəyi</li>
                        </ul>
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
