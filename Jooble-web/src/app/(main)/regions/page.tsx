import RegionsClient from '@/components/RegionsClient';
import SEOBreadcrumb from '@/components/SEOBreadcrumb';
import { Metadata } from 'next';
import { supabaseServer } from '@/integrations/supabase/server';

// Force dynamic rendering - no client-side bailout
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
    title: "Regionlar üzrə İş Elanları | Azərbaycan Vakansiyaları - Jooble.az",
    description: "Azərbaycanın müxtəlif regionlarında iş elanları və vakansiyalar. Bakı, Sumqayıt, Gəncə və digər şəhərlərdə aktual iş təklifləri.",
    keywords: "regionlar, iş elanları, vakansiyalar, Bakı, Sumqayıt, Gəncə, Azərbaycan, iş axtarışı",
    alternates: {
        canonical: "https://jooble.az/regions",
        languages: {
            'az': 'https://jooble.az/regions',
            'en': 'https://jooble.az/en/regions',
            'ru': 'https://jooble.az/ru/regions',
            'x-default': 'https://jooble.az/regions',
        },
    },
    openGraph: {
        title: "Regionlar üzrə İş Elanları | Azərbaycan Vakansiyaları - Jooble.az",
        description: "Azərbaycanın müxtəlif regionlarında iş elanları və vakansiyalar. Bakı, Sumqayıt, Gəncə və digər şəhərlərdə aktual iş təklifləri.",
        url: "https://jooble.az/regions",
        siteName: "Jooble.az",
        type: "website",
        images: [
            {
                url: "https://jooble.az/icons/icon-512x512.jpg",
                width: 512,
                height: 512,
                alt: "Regionlar üzrə İş Elanları",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Regionlar üzrə İş Elanları | Azərbaycan Vakansiyaları - Jooble.az",
        description: "Azərbaycanın müxtəlif regionlarında iş elanları və vakansiyalar. Bakı, Sumqayıt, Gəncə və digər şəhərlərdə aktual iş təklifləri.",
        images: ["https://jooble.az/icons/icon-512x512.jpg"],
    },
};

interface RegionWithJobs {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    h1_title: string | null;
    seo_description: string | null;
    jobsCount: number;
}

async function getRegionsData(): Promise<{ regions: RegionWithJobs[]; totalJobs: number }> {
    // Fetch regions
    const { data: regions } = await supabaseServer
        .from('regions')
        .select('id, name, slug, description, h1_title, seo_description')
        .eq('is_active', true)
        .order('name');
    
    // Fetch all active jobs to count by location
    const { data: jobs } = await supabaseServer
        .from('jobs')
        .select('location')
        .eq('is_active', true);
    
    // Count jobs per location
    const locationCounts: Record<string, number> = {};
    (jobs || []).forEach((job: { location: string | null }) => {
        const loc = job.location?.toLowerCase() || '';
        locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });
    
    // Map regions with job counts
    const regionsWithJobs: RegionWithJobs[] = (regions || []).map((region: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        h1_title: string | null;
        seo_description: string | null;
    }) => ({
        ...region,
        jobsCount: locationCounts[region.name.toLowerCase()] || 0
    }));
    
    return {
        regions: regionsWithJobs,
        totalJobs: jobs?.length || 0
    };
}

export default async function RegionsPage() {
    const { regions, totalJobs } = await getRegionsData();
    
    // Build comprehensive @graph schema
    const schemaGraph = {
        "@context": "https://schema.org",
        "@graph": [
            // 1. CollectionPage - Main page schema
            {
                "@type": "CollectionPage",
                "@id": "https://jooble.az/regions#webpage",
                "url": "https://jooble.az/regions",
                "name": "Regionlar üzrə İş Elanları | Azərbaycan Vakansiyaları",
                "description": `Azərbaycanın ${regions.length} regionunda ${totalJobs} aktiv iş elanı. Bakı, Sumqayıt, Gəncə və digər şəhərlərdə iş imkanları.`,
                "inLanguage": "az",
                "isPartOf": {
                    "@type": "WebSite",
                    "@id": "https://jooble.az/#website",
                    "url": "https://jooble.az",
                    "name": "Jooble.az",
                    "description": "Azərbaycanda iş axtarışı portalı",
                    "publisher": {
                        "@id": "https://jooble.az/#organization"
                    }
                },
                "about": {
                    "@type": "Thing",
                    "name": "Azərbaycan Regionları üzrə İş Elanları"
                },
                "mainEntity": {
                    "@id": "https://jooble.az/regions#itemlist"
                },
                "breadcrumb": {
                    "@id": "https://jooble.az/regions#breadcrumb"
                }
            },
            // 2. Organization
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
            // 3. BreadcrumbList
            {
                "@type": "BreadcrumbList",
                "@id": "https://jooble.az/regions#breadcrumb",
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
                    }
                ]
            },
            // 4. ItemList - All regions as Place items
            {
                "@type": "ItemList",
                "@id": "https://jooble.az/regions#itemlist",
                "name": "Azərbaycan Regionları üzrə İş Elanları",
                "description": `${regions.length} region, ${totalJobs} aktiv vakansiya`,
                "numberOfItems": regions.length,
                "itemListOrder": "https://schema.org/ItemListOrderAscending",
                "itemListElement": regions.map((region, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "name": region.h1_title || `${region.name} İş Elanları`,
                    "url": `https://jooble.az/regions/${region.slug}`,
                    "item": {
                        "@type": "Place",
                        "@id": `https://jooble.az/regions/${region.slug}#place`,
                        "name": region.name,
                        "description": region.seo_description || `${region.name} regionunda ${region.jobsCount} aktiv iş elanı`,
                        "url": `https://jooble.az/regions/${region.slug}`,
                        "address": {
                            "@type": "PostalAddress",
                            "addressLocality": region.name,
                            "addressCountry": "AZ"
                        },
                        "geo": {
                            "@type": "GeoCoordinates",
                            "addressCountry": "AZ"
                        },
                        "additionalProperty": [
                            {
                                "@type": "PropertyValue",
                                "name": "Aktiv Vakansiyalar",
                                "value": region.jobsCount
                            }
                        ]
                    }
                }))
            },
            // 5. FAQPage - Popular region questions
            {
                "@type": "FAQPage",
                "@id": "https://jooble.az/regions#faq",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "Azərbaycanda hansı regionlarda ən çox iş elanı var?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `Ən çox iş elanı olan regionlar: ${regions.slice(0, 5).map(r => `${r.name} (${r.jobsCount} vakansiya)`).join(', ')}.`
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Regionlar üzrə neçə aktiv iş elanı var?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `Hazırda Azərbaycanın ${regions.length} regionunda cəmi ${totalJobs} aktiv iş elanı mövcuddur.`
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Bakı xaricində hansı şəhərlərdə iş tapmaq olar?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `Bakı xaricində ${regions.filter(r => r.name.toLowerCase() !== 'bakı').slice(0, 5).map(r => r.name).join(', ')} və digər şəhərlərdə iş imkanları mövcuddur.`
                        }
                    },
                    ...regions.slice(0, 3).map(region => ({
                        "@type": "Question",
                        "name": `${region.name} regionunda hansı iş imkanları var?`,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": region.seo_description || `${region.name} regionunda ${region.jobsCount} aktiv vakansiya mövcuddur. Müxtəlif sahələrdə iş imkanlarını kəşf edin.`
                        }
                    }))
                ]
            }
        ]
    };

    return (
        <>
            {/* SEO Breadcrumb - visible to bots and screen readers */}
            <SEOBreadcrumb 
                items={[
                    { label: "Regionlar", href: undefined }
                ]}
                visuallyHidden={true}
            />
            
            {/* Server-rendered SEO content - visible to crawlers */}
            <div className="sr-only" aria-hidden="true">
                <h1>Regionlar üzrə İş Elanları - Azərbaycan Vakansiyaları</h1>
                <p>Azərbaycanın {regions.length} regionunda {totalJobs} aktiv iş elanı mövcuddur.</p>
                
                <h2>Bütün Regionlar ({regions.length})</h2>
                <ul>
                    {regions.map(region => (
                        <li key={region.id}>
                            <a href={`/regions/${region.slug}`}>
                                {region.name} - {region.jobsCount} vakansiya
                            </a>
                            {region.description && (
                                <p>{region.description.replace(/<[^>]*>/g, '').substring(0, 200)}</p>
                            )}
                        </li>
                    ))}
                </ul>
                
                <h2>Populyar Regionlar</h2>
                <ul>
                    {regions
                        .sort((a, b) => b.jobsCount - a.jobsCount)
                        .slice(0, 10)
                        .map(region => (
                            <li key={region.id}>
                                <a href={`/regions/${region.slug}`}>
                                    {region.name} - {region.jobsCount} iş elanı
                                </a>
                            </li>
                        ))}
                </ul>
                
                <h2>Tez-tez verilən suallar</h2>
                <p>Azərbaycanda hansı regionlarda ən çox iş elanı var?</p>
                <p>Regionlar üzrə neçə aktiv iş elanı var?</p>
            </div>
            
            {/* Single comprehensive JSON-LD with @graph */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
            />
            
            <RegionsClient />
        </>
    );
}
