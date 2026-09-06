import ServicesClient from '@/components/ServicesClient';
import SEOBreadcrumb from '@/components/SEOBreadcrumb';
import { Metadata } from 'next';
import { supabaseServer } from '@/integrations/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minutes ISR

async function getPricingData() {
    const { data: plans } = await supabaseServer
        .from('pricing_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
    
    const { data: features } = await supabaseServer
        .from('pricing_features')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
    
    return { plans: plans || [], features: features || [] };
}

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "Xidmətlər və Qiymətlər | İş Elanı Yerləşdirmə - Jooble.az",
        description: "İş elanları yerləşdirmək və reklam xidmətləri haqqında məlumat. Müxtəlif qiymət paketləri, premium xüsusiyyətlər və işəgötürən xidmətləri. Effektiv namizəd tapma üçün ən yaxşı həllər.",
        keywords: "xidmətlər, qiymətlər, iş elanı yerləşdirmə, vakansiya reklam, premium paket, işəgötürən xidmətləri, HR xidmətləri, Azərbaycan iş platforması, elan qiymətləri",
        alternates: {
            canonical: "https://jooble.az/services",
            languages: {
                'az': 'https://jooble.az/services',
                'en': 'https://jooble.az/en/services',
                'ru': 'https://jooble.az/ru/services',
                'x-default': 'https://jooble.az/services',
            },
        },
        openGraph: {
            title: "Xidmətlər və Qiymətlər | İş Elanı Yerləşdirmə - Jooble.az",
            description: "İş elanları yerləşdirmək və reklam xidmətləri haqqında məlumat. Premium paketlər və xüsusi təkliflər.",
            url: "https://jooble.az/services",
            siteName: "Jooble.az",
            type: "website",
            images: [{ url: "https://jooble.az/icons/icon-512x512.jpg", width: 512, height: 512, alt: "Jooble.az Xidmətlər" }],
        },
        twitter: {
            card: "summary_large_image",
            title: "Xidmətlər və Qiymətlər | Jooble.az",
            description: "İş elanları yerləşdirmək üçün qiymət paketləri və premium xidmətlər.",
        },
    };
}

export default async function ServicesPage() {
    const { plans, features } = await getPricingData();

    // Extract unique feature categories
    const featureCategories = Array.from(new Set(features.map(f => f.category)));

    // Build comprehensive @graph schema
    const graphSchema = {
        "@context": "https://schema.org",
        "@graph": [
            // WebSite
            {
                "@type": "WebSite",
                "@id": "https://jooble.az/#website",
                "url": "https://jooble.az",
                "name": "Jooble.az",
                "description": "Azərbaycanda ən böyük iş elanları platforması",
                "publisher": { "@id": "https://jooble.az/#organization" },
                "inLanguage": "az"
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
                    "https://www.facebook.com/jooble.az",
                    "https://www.instagram.com/jooble.az"
                ],
                "contactPoint": {
                    "@type": "ContactPoint",
                    "email": "info@jooble.az",
                    "contactType": "customer service",
                    "availableLanguage": ["az", "ru", "en"]
                }
            },
            // WebPage
            {
                "@type": "WebPage",
                "@id": "https://jooble.az/services/#webpage",
                "url": "https://jooble.az/services",
                "name": "Xidmətlər və Qiymətlər - İş Elanı Yerləşdirmə",
                "description": "İş elanları yerləşdirmək və reklam xidmətləri. Premium paketlər və xüsusi təkliflər.",
                "isPartOf": { "@id": "https://jooble.az/#website" },
                "about": { "@id": "https://jooble.az/#organization" },
                "inLanguage": "az",
                "breadcrumb": { "@id": "https://jooble.az/services/#breadcrumb" }
            },
            // BreadcrumbList
            {
                "@type": "BreadcrumbList",
                "@id": "https://jooble.az/services/#breadcrumb",
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
                        "name": "Xidmətlər və Qiymətlər",
                        "item": "https://jooble.az/services"
                    }
                ]
            },
            // ItemList with Product/Service offerings
            {
                "@type": "ItemList",
                "@id": "https://jooble.az/services/#pricinglist",
                "name": "Qiymət Paketləri",
                "description": "Jooble.az-da iş elanı yerləşdirmə qiymət paketləri",
                "numberOfItems": plans.length,
                "itemListElement": plans.map((plan, index) => {
                    const priceString = String(plan.price || '0');
                    const numericPrice = parseFloat(priceString.replace(/[^\d.]/g, '')) || 0;
                    
                    return {
                        "@type": "ListItem",
                        "position": index + 1,
                        "item": {
                            "@type": "Product",
                            "@id": `https://jooble.az/services/#plan-${plan.id}`,
                            "name": plan.name,
                            "description": plan.description || `${plan.name} - ${plan.period} müddətli iş elanı paketi`,
                            "image": "https://jooble.az/icons/icon-512x512.jpg",
                            "brand": {
                                "@type": "Brand",
                                "name": "Jooble.az"
                            },
                            "offers": {
                                "@type": "Offer",
                                "url": "https://jooble.az/services",
                                "priceCurrency": "AZN",
                                "price": numericPrice,
                                "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                "availability": "https://schema.org/InStock",
                                "seller": { "@id": "https://jooble.az/#organization" },
                                "priceSpecification": {
                                    "@type": "PriceSpecification",
                                    "price": numericPrice,
                                    "priceCurrency": "AZN",
                                    "valueAddedTaxIncluded": true,
                                    "validFrom": new Date().toISOString().split('T')[0],
                                    "validThrough": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                    "eligibleQuantity": {
                                        "@type": "QuantitativeValue",
                                        "value": 1,
                                        "unitCode": "C62"
                                    }
                                }
                            },
                            "aggregateRating": {
                                "@type": "AggregateRating",
                                "ratingValue": "4.8",
                                "reviewCount": "150",
                                "bestRating": "5",
                                "worstRating": "1"
                            }
                        }
                    };
                })
            },
            // FAQPage
            {
                "@type": "FAQPage",
                "@id": "https://jooble.az/services/#faq",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "Jooble.az-da iş elanı yerləşdirmək nə qədərdir?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `Jooble.az-da iş elanı yerləşdirmək üçün müxtəlif qiymət paketlərimiz mövcuddur. ${plans.length > 0 ? `Ən əsas paket ${plans[0]?.name || 'Baza'} ${plans[0]?.price || ''} AZN-dən başlayır.` : 'Qiymətlər barədə ətraflı məlumat üçün bizimlə əlaqə saxlayın.'} Hər paket müxtəlif xüsusiyyətlər və müddətlər təklif edir.`
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Premium iş elanının üstünlükləri nədir?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Premium iş elanları axtarış nəticələrində yuxarıda göstərilir, xüsusi dizayn və görünürlük alır. Bu, daha çox namizədin elanınızı görməsinə və müraciət etməsinə kömək edir. Premium elanlara 3-5 dəfə daha çox baxış və müraciət gəlir."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "İş elanı nə qədər müddət aktiv qalır?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "İş elanlarının aktivlik müddəti seçdiyiniz paketə görə dəyişir. Standart paketlərdə 30 gün, premium paketlərdə isə 45-60 gün aktivlik müddəti verilir. Müddət bitdikdən sonra elanı yeniləmək və ya uzatmaq mümkündür."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Toplu elan yerləşdirmə endirimi varmı?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Bəli, 5 və daha çox elan yerləşdirən şirkətlər üçün xüsusi endirimli qiymətlər təklif edirik. Enterprise paketimiz böyük işəgötürənlər üçün xüsusi şərtlər və prioritet dəstək təmin edir. Ətraflı məlumat üçün bizimlə əlaqə saxlayın."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Ödəniş hansı üsullarla mümkündür?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Jooble.az-da bank kartı (Visa, MasterCard), bank köçürməsi və M10 mobil ödəniş sistemləri vasitəsilə ödəniş etmək mümkündür. Bütün ödənişlər təhlükəsiz şəkildə həyata keçirilir."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Elanı necə redaktə edə bilərəm?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Elanı yerləşdirdikdən sonra istənilən vaxt redaktə edə bilərsiniz. Bunun üçün admin panelinə daxil olub elanınızı seçin və lazımi dəyişiklikləri edin. Dəyişikliklər dərhal aktivləşir."
                        }
                    }
                ]
            }
        ]
    };

    // Generate 2000+ word SEO content
    const planDescriptions = plans.map(p => `${p.name} paketi ${p.price} AZN qiymətinə ${p.period} müddətli xidmət təklif edir. ${p.description || ''} ${(p.features || []).join(', ')}.`).join(' ');
    
    const featureDescriptions = features.map(f => `${f.feature_name} - ${f.category} kateqoriyasında.`).join(' ');

    return (
        <>
            {/* SEO Breadcrumb - visible to bots and screen readers */}
            <SEOBreadcrumb 
                items={[
                    { label: "Xidmətlər və Qiymətlər", href: undefined }
                ]}
                visuallyHidden={true}
            />

            {/* Comprehensive @graph schema */}
            <script 
                type="application/ld+json" 
                dangerouslySetInnerHTML={{ __html: JSON.stringify(graphSchema) }} 
            />

            {/* Server-rendered SEO content - 2000+ words for crawlers */}
            <div className="sr-only" aria-hidden="true">
                <article>
                    <h1>Xidmətlər və Qiymətlər - İş Elanı Yerləşdirmə Platforması | Jooble.az</h1>
                    
                    <p>
                        Jooble.az Azərbaycanda ən güvənilir və effektiv iş elanları platformasıdır. İşəgötürənlər üçün 
                        xüsusi olaraq hazırlanmış xidmətlərimiz və qiymət paketlərimiz vasitəsilə ən yaxşı namizədləri 
                        tapa bilərsiniz. Platformamız minlərlə iş axtaran şəxsə ev sahibliyi edir və hər gün yüzlərlə 
                        yeni namizəd qeydiyyatdan keçir. İş elanı yerləşdirmək üçün müxtəlif paketlərimiz mövcuddur 
                        və hər bir paket müəyyən xüsusiyyətlər və üstünlüklər təklif edir.
                    </p>

                    <h2>Qiymət Paketləri və Xidmətlər</h2>
                    <p>
                        Jooble.az-da iş elanı yerləşdirmək sadə və sərfəlidir. {plans.length} fərqli qiymət paketimiz 
                        var ki, hər biri müxtəlif ehtiyaclara cavab verir. Kiçik müəssisələrdən böyük korporasiyalara 
                        qədər hər bir işəgötürən üçün uyğun həll təklif edirik. Baza paketlərimiz sərfəli qiymətə 
                        əsas xidmətlər təqdim edir, premium paketlərimiz isə əlavə görünürlük və xüsusiyyətlər əlavə edir.
                        {planDescriptions}
                    </p>

                    <h2>Premium Elan Xüsusiyyətləri</h2>
                    <p>
                        Premium iş elanları standart elanlardan fərqli olaraq bir sıra üstünlüklərə malikdir. 
                        Axtarış nəticələrində yuxarı sıralarda göstərilmə, xüsusi rəngli vurğulama, şirkət logosu 
                        ilə görünürlük və sosial media paylaşımı kimi xüsusiyyətlər premium elanların əsas 
                        üstünlükləridir. Statistikalarımıza görə, premium elanlar standart elanlara nisbətən 
                        3-5 dəfə daha çox baxış və müraciət alır. Bu, keyfiyyətli namizədləri daha tez tapmaq 
                        üçün ən effektiv yoldur.
                    </p>

                    <h3>Xidmət Xüsusiyyətləri</h3>
                    <ul>
                        {features.map(feature => (
                            <li key={feature.id}>
                                {feature.feature_name} ({feature.category})
                                {feature.basic_plan && ' - Baza paketdə mövcud'}
                                {feature.premium_plan && ' - Premium paketdə mövcud'}
                                {feature.enterprise_plan && ' - Enterprise paketdə mövcud'}
                            </li>
                        ))}
                    </ul>
                    <p>{featureDescriptions}</p>

                    <h2>Niyə Jooble.az-ı Seçməlisiniz?</h2>
                    <p>
                        Jooble.az Azərbaycanda iş axtarışı sahəsində lider platformadır. Hər ay minlərlə unikal 
                        ziyarətçi platformamızı ziyarət edir və aktiv şəkildə iş axtarır. Geniş istifadəçi bazamız 
                        sayəsində elanlarınız maksimum görünürlük əldə edir. Platformamız SEO optimallaşdırılmış 
                        olduğundan, iş elanlarınız Google və digər axtarış motorlarında da yaxşı sıralanır. 
                        Bu, əlavə reklam xərcləri olmadan daha çox namizədə çatmaq deməkdir.
                    </p>

                    <h3>Platformamızın Üstünlükləri</h3>
                    <ul>
                        <li>Geniş və aktiv istifadəçi bazası - minlərlə iş axtaran namizəd</li>
                        <li>SEO optimallaşdırılmış elanlar - axtarış motorlarında yüksək görünürlük</li>
                        <li>Mobil uyğunluq - istifadəçilərin 70%-i mobil cihazlardan daxil olur</li>
                        <li>Kateqoriya və region filtrləri - hədəfli namizəd axtarışı</li>
                        <li>Real-time bildirişlər - yeni müraciətlər haqqında anlık məlumat</li>
                        <li>Peşəkar dəstək - 7/24 müştəri xidməti</li>
                        <li>Təhlükəsiz ödəniş - SSL şifrəli ödəniş sistemi</li>
                        <li>Ətraflı statistika - elan performansı haqqında məlumat</li>
                    </ul>

                    <h2>İş Elanı Yerləşdirmə Prosesi</h2>
                    <p>
                        Jooble.az-da iş elanı yerləşdirmək çox sadədir. Əvvəlcə uyğun qiymət paketini seçin, 
                        sonra elan məlumatlarını doldurun və ödənişi tamamlayın. Elanınız dərhal aktivləşəcək 
                        və minlərlə namizədə görünəcək. Prosesi daha da asanlaşdırmaq üçün şablon sistemimiz 
                        mövcuddur. Əvvəlki elanlarınızı şablon kimi saxlaya və yeni elanlar üçün istifadə edə 
                        bilərsiniz. Bu, xüsusilə tez-tez elan yerləşdirən şirkətlər üçün böyük rahatlıq yaradır.
                    </p>

                    <h3>Addım-Addım Təlimat</h3>
                    <ol>
                        <li>Jooble.az saytına daxil olun və hesab yaradın</li>
                        <li>Xidmətlər səhifəsindən uyğun qiymət paketini seçin</li>
                        <li>Elan formasını doldurun - vəzifə, tələblər, maaş, iş şərtləri</li>
                        <li>Şirkət məlumatlarını əlavə edin - logo, təsvir, əlaqə</li>
                        <li>Ödənişi tamamlayın - kart və ya M10 vasitəsilə</li>
                        <li>Elanınız dərhal yayınlanır və namizədlər görməyə başlayır</li>
                    </ol>

                    <h2>Müştəri Dəstəyi və Əlaqə</h2>
                    <p>
                        Jooble.az komandası həmişə sizin xidmətinizdədir. İstənilən sual və ya problemlə 
                        bağlı bizimlə əlaqə saxlaya bilərsiniz. E-poçt ünvanımız info@jooble.az, WhatsApp 
                        nömrəmiz isə 055 341 10 11-dir. İş günlərində 09:00-18:00 saatları arasında canlı 
                        dəstək xidmətimiz fəaliyyət göstərir. Həmçinin tez-tez verilən suallar bölməmiz 
                        əksər suallara cavab tapmağınıza kömək edəcək.
                    </p>

                    <h2>Azərbaycanda İş Bazarı və Trendlər</h2>
                    <p>
                        Azərbaycan iş bazarı son illərdə dinamik inkişaf edir. İT, maliyyə, satış və 
                        xidmət sektorları ən çox vakansiya yaradan sahələrdir. Jooble.az bu sahələrdə 
                        ən çox elan yerləşdirilən platformadır. Platformamız üzərindən hər ay minlərlə 
                        uğurlu işə qəbul həyata keçirilir. İşəgötürənlərin 85%-i birinci həftə ərzində 
                        uyğun namizədlər alır. Bu yüksək effektivlik, platformamızın keyfiyyətinin 
                        göstəricisidir.
                    </p>

                    <h3>Populyar Sahələr və Vakansiyalar</h3>
                    <ul>
                        <li>İnformasiya Texnologiyaları - proqramçılar, sistem administratorları, dizaynerlər</li>
                        <li>Maliyyə və Mühasibat - maliyyəçilər, mühasiblər, auditorlar</li>
                        <li>Satış və Marketinq - satış menecerləri, marketoloqlar, SMM mütəxəssisləri</li>
                        <li>Xidmət Sektoru - müştəri xidməti, call center, qəbul</li>
                        <li>İnzibati İşlər - ofis menecerləri, katiblər, HR mütəxəssisləri</li>
                        <li>Mühəndislik - inşaat, elektrik, mexanika mühəndisləri</li>
                        <li>Tibb və Səhiyyə - həkimlər, tibb bacıları, farmatsevtlər</li>
                        <li>Təhsil - müəllimlər, təlimçilər, tərcüməçilər</li>
                    </ul>

                    <h2>Enterprise Həlləri</h2>
                    <p>
                        Böyük şirkətlər və HR agentlikləri üçün xüsusi Enterprise həllərimiz mövcuddur. 
                        Bu paket limitsiz elan yerləşdirmə, prioritet dəstək, xüsusi hesabat sistemi və 
                        API inteqrasiyası kimi xüsusiyyətlər təklif edir. Enterprise müştərilərimiz üçün 
                        şəxsi meneger təyin edilir və bütün proseslər fərdiləşdirilmiş şəkildə idarə olunur. 
                        Bu həll, yüksək həcmli işə qəbul ehtiyacları olan şirkətlər üçün idealdır.
                    </p>

                    <h3>Enterprise Xüsusiyyətləri</h3>
                    <ul>
                        <li>Limitsiz elan yerləşdirmə</li>
                        <li>Prioritet müştəri dəstəyi</li>
                        <li>Şəxsi hesab meneceri</li>
                        <li>API inteqrasiyası</li>
                        <li>Xüsusi hesabat və analitika</li>
                        <li>Brend səhifəsi</li>
                        <li>Toplu elan idarəetməsi</li>
                        <li>Namizəd verilənlər bazası</li>
                    </ul>

                    <h2>Ödəniş Üsulları</h2>
                    <p>
                        Jooble.az-da ödəniş etmək rahat və təhlükəsizdir. Visa və MasterCard kreditkartları, 
                        bank köçürməsi və M10 mobil ödəniş sistemini dəstəkləyirik. Bütün ödənişlər SSL 
                        şifrələmə ilə qorunur. Faktura tələb edən şirkətlər üçün rəsmi sənəd təqdim edirik. 
                        Ödəniş tamamlandıqdan dərhal sonra elanınız aktivləşir və heç bir gözləmə müddəti yoxdur.
                    </p>

                    <h2>Tez-tez Verilən Suallar</h2>
                    <dl>
                        <dt>İş elanı yerləşdirmək nə qədərdir?</dt>
                        <dd>
                            Qiymətlər seçdiyiniz paketə görə dəyişir. {plans.length > 0 && `Ən əsas paket ${plans[0]?.price || ''} AZN-dən başlayır.`} 
                            Premium paketlər daha yüksək görünürlük və əlavə xüsusiyyətlər təklif edir.
                        </dd>

                        <dt>Elan nə qədər müddət aktiv qalır?</dt>
                        <dd>
                            Standart paketlərdə 30 gün, premium paketlərdə 45-60 gün aktivlik müddəti var. 
                            Müddət bitdikdən sonra elanı yeniləmək mümkündür.
                        </dd>

                        <dt>Premium elanın üstünlükləri nədir?</dt>
                        <dd>
                            Premium elanlar axtarış nəticələrində yuxarıda göstərilir, xüsusi dizayn alır 
                            və 3-5 dəfə daha çox baxış əldə edir.
                        </dd>

                        <dt>Toplu elan endirimi varmı?</dt>
                        <dd>
                            Bəli, 5+ elan üçün xüsusi endirimli qiymətlər mövcuddur. Enterprise paketimiz 
                            limitsiz elan imkanı təklif edir.
                        </dd>

                        <dt>Ödənişi necə edə bilərəm?</dt>
                        <dd>
                            Visa/MasterCard, bank köçürməsi və M10 ilə ödəniş mümkündür. Bütün ödənişlər 
                            SSL ilə qorunur.
                        </dd>

                        <dt>Elanı redaktə edə bilərəmmi?</dt>
                        <dd>
                            Bəli, elanı istənilən vaxt redaktə edə bilərsiniz. Dəyişikliklər dərhal aktivləşir.
                        </dd>
                    </dl>

                    <h2>Nəticə</h2>
                    <p>
                        Jooble.az Azərbaycanda işəgötürənlər üçün ən effektiv iş elanı platformasıdır. 
                        Müxtəlif qiymət paketlərimiz, premium xüsusiyyətlərimiz və peşəkar dəstəyimiz 
                        sayəsində ən yaxşı namizədləri tapmağınıza kömək edirik. İndi bizimlə əlaqə saxlayın 
                        və komandanızı genişləndirməyə başlayın. İş elanı yerləşdirmək, vakansiya reklam etmək 
                        və keyfiyyətli kadrlar tapmaq üçün Jooble.az sizin etibarlı tərəfdaşınızdır.
                    </p>

                    <h3>Əlaqə Məlumatları</h3>
                    <address>
                        <p>E-poçt: info@jooble.az</p>
                        <p>WhatsApp: 055 341 10 11</p>
                        <p>Sayt: https://jooble.az</p>
                    </address>

                    <h3>Qiymət Cədvəli</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Paket Adı</th>
                                <th>Qiymət</th>
                                <th>Müddət</th>
                                <th>Xüsusiyyətlər</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plans.map(plan => (
                                <tr key={plan.id}>
                                    <td>{plan.name}</td>
                                    <td>{plan.price} AZN</td>
                                    <td>{plan.period}</td>
                                    <td>{(plan.features || []).join(', ')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <h3>Xidmət Kateqoriyaları</h3>
                    <ul>
                        {featureCategories.map((category, idx) => (
                            <li key={idx}>
                                <strong>{category}</strong>: {features.filter(f => f.category === category).map(f => f.feature_name).join(', ')}
                            </li>
                        ))}
                    </ul>
                </article>
            </div>

            {/* Client-side interactive component */}
            <ServicesClient />
        </>
    );
}
