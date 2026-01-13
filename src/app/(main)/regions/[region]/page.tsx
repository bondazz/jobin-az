import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import RegionsClient from '@/components/RegionsClient';
import { headers } from "next/headers";
import SeoShield from "@/components/SeoShield";
import { SEO_MASTER_KEYWORDS, SEO_HYDRATION_GUIDE } from "@/constants/seo-terms";

function getGooglebotRegionHydration(regionName: string): string {
    return `
        <section class="google-hydration-content sr-only">
            <h2>${regionName} Regionu üzrə İş Bazarı Analizi</h2>
            <p>${regionName} şəhərində 2026-cı il üçün iş imkanları və sosial-iqtisadi inkişaf templəri.</p>
            <p>${SEO_HYDRATION_GUIDE}</p>
            <p>Bu regionda iş tapmaq üçün ən perspektivli sahələr və ixtisaslaşmış vakansiyalar haqqında ətraflı məlumat.</p>
            <div class="master-keywords">
                ${SEO_MASTER_KEYWORDS.join(', ')}
            </div>
        </section>
    `;
}

const supabaseUrl = 'https://igrtzfvphltnoiwedbtz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTQzMDYsImV4cCI6MjA2Nzc5MDMwNn0.afoeynzfpIZMqMRgpD0fDQ_NdULXEML-LZ-SocnYKp0';

interface RegionPageProps {
    params: { region: string };
}

async function getRegionData(slug: string) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: region } = await supabase
        .from('regions')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

    if (!region) return null;

    // Get jobs in this region
    const { data: jobs } = await supabase
        .from('jobs')
        .select('id, title, slug, company_id, created_at, companies:company_id(name)')
        .eq('is_active', true)
        .ilike('location', `%${region.name}%`)
        .order('created_at', { ascending: false })
        .limit(20);

    return {
        region,
        jobs: jobs || [],
        jobCount: jobs?.length || 0
    };
}

export async function generateMetadata({ params }: RegionPageProps): Promise<Metadata> {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: region } = await supabase
        .from('regions')
        .select('*')
        .eq('slug', params.region)
        .eq('is_active', true)
        .single();

    if (!region) {
        return {
            title: 'Region tapılmadı - Jobin.az',
        };
    }

    const title = region.seo_title || `${region.name} İş Elanları | Vakansiyalar - Jobin.az`;
    const description = region.seo_description || `${region.name} regionunda aktual iş elanları və vakansiyalar. Ən yaxşı iş imkanlarını kəşf edin.`;

    return {
        title,
        description,
        keywords: region.seo_keywords?.join(', ') || `${region.name}, iş elanları, vakansiyalar, Azərbaycan`,
        alternates: {
            canonical: `https://jobin.az/regions/${region.slug}`,
        },
        openGraph: {
            title,
            description,
            url: `https://jobin.az/regions/${region.slug}`,
            siteName: 'Jobin.az',
            type: 'website',
            images: [
                {
                    url: 'https://jobin.az/icons/icon-512x512.jpg',
                    width: 512,
                    height: 512,
                    alt: region.name,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['https://jobin.az/icons/icon-512x512.jpg'],
        },
    };
}

export default async function RegionPage({ params }: RegionPageProps) {
    const userAgent = headers().get('user-agent') || '';
    const isGooglebot = /googlebot/i.test(userAgent);
    const data = await getRegionData(params.region);

    if (!data) {
        return <RegionsClient />;
    }

    const { region, jobs, jobCount } = data;

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `${region.name} İş Elanları`,
        "description": region.seo_description || `${region.name} regionunda aktual iş elanları`,
        "url": `https://jobin.az/regions/${region.slug}`,
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": jobCount,
            "itemListElement": jobs.slice(0, 10).map((job: any, index: number) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "JobPosting",
                    "title": job.title,
                    "url": `https://jobin.az/vacancies/${job.slug}`,
                    "hiringOrganization": {
                        "@type": "Organization",
                        "name": job.companies?.name || "Şirkət"
                    },
                    "jobLocation": {
                        "@type": "Place",
                        "address": {
                            "@type": "PostalAddress",
                            "addressLocality": region.name,
                            "addressCountry": "AZ"
                        }
                    }
                }
            }))
        }
    };

    const datasetSchema = {
        "@context": "https://schema.org",
        "@type": "Dataset",
        "@id": `https://jobin.az/regions/${region.slug}#dataset`,
        "name": `${region.name} Regional İş Datası 2026`,
        "description": `${region.name} regionu üzrə vakansiya və məşğulluq statistikası.`,
        "publisher": { "@id": "https://jobin.az#org" }
    };

    const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Ana Səhifə",
                "item": "https://jobin.az"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Regionlar",
                "item": "https://jobin.az/regions"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": region.name,
                "item": `https://jobin.az/regions/${region.slug}`
            }
        ]
    };

    return (
        <>
            {/* Server-rendered SEO content */}
            <div className="sr-only" aria-hidden="true">
                <h1>
                    <SeoShield text={region.h1_title || `${region.name} İş Elanları`} as="span" />
                </h1>
                <p>{region.seo_description || `${region.name} regionunda ${jobCount} aktiv iş elanı mövcuddur.`}</p>

                {region.description && (
                    <div>
                        <h2>{region.name} haqqında</h2>
                        <p>{region.description.replace(/<[^>]*>/g, '')}</p>
                    </div>
                )}

                <h2>{region.name} Vakansiyaları</h2>
                <p>Bu regionda {jobCount} aktiv vakansiya var.</p>
                <ul>
                    {jobs.map((job: any) => (
                        <li key={job.id}>
                            <a href={`/vacancies/${job.slug}`}>
                                {job.title} - {job.companies?.name || 'Şirkət'}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
            />

            {isGooglebot && (
                <div dangerouslySetInnerHTML={{ __html: getGooglebotRegionHydration(region.name) }} />
            )}
            <RegionsClient />
        </>
    );
}
