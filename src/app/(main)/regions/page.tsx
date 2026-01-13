import RegionsClient from '@/components/RegionsClient';
import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://igrtzfvphltnoiwedbtz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTQzMDYsImV4cCI6MjA2Nzc5MDMwNn0.afoeynzfpIZMqMRgpD0fDQ_NdULXEML-LZ-SocnYKp0';

export const metadata: Metadata = {
    title: "Regionlar üzrə İş Elanları | Azərbaycan Vakansiyaları - Jobin.az",
    description: "Azərbaycanın müxtəlif regionlarında iş elanları və vakansiyalar. Bakı, Sumqayıt, Gəncə və digər şəhərlərdə aktual iş təklifləri.",
    keywords: "regionlar, iş elanları, vakansiyalar, Bakı, Sumqayıt, Gəncə, Azərbaycan, iş axtarışı",
    alternates: {
        canonical: "https://Jobin.az/regions",
    },
    openGraph: {
        title: "Regionlar üzrə İş Elanları | Azərbaycan Vakansiyaları - Jobin.az",
        description: "Azərbaycanın müxtəlif regionlarında iş elanları və vakansiyalar. Bakı, Sumqayıt, Gəncə və digər şəhərlərdə aktual iş təklifləri.",
        url: "https://Jobin.az/regions",
        siteName: "Jobin.az",
        type: "website",
        images: [
            {
                url: "https://Jobin.az/icons/icon-512x512.jpg",
                width: 512,
                height: 512,
                alt: "Regionlar üzrə İş Elanları",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Regionlar üzrə İş Elanları | Azərbaycan Vakansiyaları - Jobin.az",
        description: "Azərbaycanın müxtəlif regionlarında iş elanları və vakansiyalar. Bakı, Sumqayıt, Gəncə və digər şəhərlərdə aktual iş təklifləri.",
        images: ["https://Jobin.az/icons/icon-512x512.jpg"],
    },
};

async function getRegionsData() {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data: regions } = await supabase
        .from('regions')
        .select('id, name, slug, description')
        .eq('is_active', true)
        .order('name');
    
    const { data: jobs } = await supabase
        .from('jobs')
        .select('location')
        .eq('is_active', true);
    
    const locationCounts: Record<string, number> = {};
    jobs?.forEach(job => {
        const loc = job.location?.toLowerCase() || '';
        locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });
    
    return {
        regions: regions || [],
        locationCounts,
        totalJobs: jobs?.length || 0
    };
}

export default async function RegionsPage() {
    const { regions, locationCounts, totalJobs } = await getRegionsData();
    
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Regionlar üzrə İş Elanları",
        "description": "Azərbaycanın müxtəlif regionlarında iş elanları və vakansiyalar",
        "url": "https://Jobin.az/regions",
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": regions.length,
            "itemListElement": regions.slice(0, 20).map((region, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "Place",
                    "name": region.name,
                    "url": `https://Jobin.az/regions/${region.slug}`
                }
            }))
        }
    };

    const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Ana Səhifə",
                "item": "https://Jobin.az"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Regionlar",
                "item": "https://Jobin.az/regions"
            }
        ]
    };
    
    return (
        <>
            {/* Server-rendered SEO content */}
            <div className="sr-only" aria-hidden="true">
                <h1>Regionlar üzrə İş Elanları - Azərbaycan Vakansiyaları</h1>
                <p>Azərbaycanın müxtəlif regionlarında {totalJobs} aktiv iş elanı mövcuddur.</p>
                
                <h2>Bütün Regionlar</h2>
                <ul>
                    {regions.map(region => {
                        const jobCount = locationCounts[region.name.toLowerCase()] || 0;
                        return (
                            <li key={region.id}>
                                <a href={`/regions/${region.slug}`}>
                                    {region.name} - {jobCount} vakansiya
                                </a>
                                {region.description && <p>{region.description.replace(/<[^>]*>/g, '').substring(0, 200)}</p>}
                            </li>
                        );
                    })}
                </ul>
                
                <h2>Populyar Regionlar</h2>
                <ul>
                    {regions.slice(0, 10).map(region => (
                        <li key={region.id}>
                            <a href={`/regions/${region.slug}`}>{region.name} iş elanları</a>
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
            
            <RegionsClient />
        </>
    );
}
