import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabaseUrl = 'https://igrtzfvphltnoiwedbtz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTQzMDYsImV4cCI6MjA2Nzc5MDMwNn0.afoeynzfpIZMqMRgpD0fDQ_NdULXEML-LZ-SocnYKp0';

export const metadata: Metadata = {
    title: "Regionlar üzrə İş Elanları | Azərbaycan Vakansiyaları - Jooble.az",
    description: "Azərbaycanın müxtəlif regionlarında iş elanları və vakansiyalar. Bakı, Sumqayıt, Gəncə və digər şəhərlərdə aktual iş təklifləri.",
    keywords: "regionlar, iş elanları, vakansiyalar, Bakı, Sumqayıt, Gəncə, Azərbaycan, iş axtarışı",
    alternates: {
        canonical: "https://jooble.az/regions",
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

async function getRegionsData() {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data: regions } = await supabase
        .from('regions')
        .select('id, name, slug, description')
        .eq('is_active', true)
        .order('name');
    
    // Get job counts per region location
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
        "url": "https://jooble.az/regions",
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": regions.length,
            "itemListElement": regions.slice(0, 20).map((region, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "Place",
                    "name": region.name,
                    "url": `https://jooble.az/regions/${region.slug}`
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
                "item": "https://jooble.az"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Regionlar",
                "item": "https://jooble.az/regions"
            }
        ]
    };
    
    return (
        <main>
            {/* JSON-LD Structured Data - Must be first for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
            />
            
            {/* Server-rendered SEO content - visible to crawlers */}
            <article className="px-4 py-6 max-w-4xl mx-auto">
                <header>
                    <h1 className="text-2xl font-bold mb-4">Regionlar üzrə İş Elanları - Azərbaycan Vakansiyaları</h1>
                    <p className="text-muted-foreground mb-6">
                        Azərbaycanın müxtəlif regionlarında {totalJobs} aktiv iş elanı mövcuddur. 
                        Bakı, Sumqayıt, Gəncə, Mingəçevir və digər şəhərlərdə ən yeni vakansiyaları kəşf edin.
                    </p>
                </header>
                
                <section>
                    <h2 className="text-xl font-semibold mb-4">Bütün Regionlar ({regions.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {regions.map(region => {
                            const jobCount = locationCounts[region.name.toLowerCase()] || 0;
                            return (
                                <Link 
                                    key={region.id}
                                    href={`/regions/${region.slug}`}
                                    className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <h3 className="font-medium">{region.name}</h3>
                                    <p className="text-sm text-muted-foreground">{jobCount} vakansiya</p>
                                    {region.description && (
                                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                            {region.description.replace(/<[^>]*>/g, '').substring(0, 100)}...
                                        </p>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </section>
                
                <section className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Populyar Regionlar</h2>
                    <nav>
                        <ul className="flex flex-wrap gap-2">
                            {regions.slice(0, 10).map(region => (
                                <li key={region.id}>
                                    <Link 
                                        href={`/regions/${region.slug}`}
                                        className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
                                    >
                                        {region.name} iş elanları
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </section>
                
                <section className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Region üzrə İş Axtarışı</h2>
                    <p className="text-muted-foreground">
                        Azərbaycanın hər bölgəsində iş imkanları mövcuddur. Bakı paytaxt olaraq ən çox vakansiyaya malik olsa da, 
                        Sumqayıt, Gəncə, Lənkəran və digər regionlarda da müxtəlif sahələrdə iş yerləri təklif edilir. 
                        Regionunuzu seçin və sizə uyğun vakansiyaları tapın.
                    </p>
                </section>
            </article>
        </main>
    );
}
