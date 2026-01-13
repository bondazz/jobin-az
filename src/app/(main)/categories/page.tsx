import CategoriesClient from '@/components/CategoriesClient';
import { Metadata } from 'next';
import { supabase } from '@/integrations/supabase/client';

export const metadata: Metadata = {
    title: "İş Elanları Kateqoriyaları | Sahələr üzrə Vakansiyalar - Jobin.az",
    description: "Azərbaycanda müxtəlif sahələr üzrə iş elanları və vakansiyalar. IT, maliyyə, marketinq, satış, tibb və digər kateqoriyalarda aktual iş təklifləri.",
    keywords: "iş elanları, vakansiyalar, kateqoriyalar, iş sahələri, Azərbaycan, iş axtarışı, karyera",
    alternates: {
        canonical: "https://Jobin.az/categories",
    },
    openGraph: {
        title: "İş Elanları Kateqoriyaları | Sahələr üzrə Vakansiyalar - Jobin.az",
        description: "Azərbaycanda müxtəlif sahələr üzrə iş elanları və vakansiyalar. IT, maliyyə, marketinq, satış, tibb və digər kateqoriyalarda aktual iş təklifləri.",
        url: "https://Jobin.az/categories",
        siteName: "Jobin.az",
        type: "website",
        images: [
            {
                url: "https://Jobin.az/icons/icon-512x512.jpg",
                width: 512,
                height: 512,
                alt: "İş Elanları Kateqoriyaları",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "İş Elanları Kateqoriyaları | Sahələr üzrə Vakansiyalar - Jobin.az",
        description: "Azərbaycanda müxtəlif sahələr üzrə iş elanları və vakansiyalar. IT, maliyyə, marketinq, satış, tibb və digər kateqoriyalarda aktual iş təklifləri.",
        images: ["https://Jobin.az/icons/icon-512x512.jpg"],
    },
};

// Helper function to strip HTML tags
function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

async function getAllCategories() {
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name, slug, description, icon, h1_title, seo_title, seo_description')
        .eq('is_active', true)
        .order('name');

    if (!categories) return [];

    // Get job counts for each category
    const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
            const { count } = await supabase
                .from('jobs')
                .select('*', { count: 'exact', head: true })
                .eq('category_id', category.id)
                .eq('is_active', true);
            
            return {
                ...category,
                jobsCount: count || 0
            };
        })
    );

    return categoriesWithCounts;
}

export default async function CategoriesPage() {
    const categories = await getAllCategories();
    const totalJobs = categories.reduce((sum, cat) => sum + cat.jobsCount, 0);

    // Structured data for categories page
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "İş Elanları Kateqoriyaları",
        "description": "Azərbaycanda müxtəlif sahələr üzrə iş elanları və vakansiyalar",
        "url": "https://Jobin.az/categories",
        "mainEntity": {
            "@type": "ItemList",
            "name": "İş Kateqoriyaları",
            "numberOfItems": categories.length,
            "itemListElement": categories.map((category, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "Thing",
                    "name": category.name,
                    "url": `https://Jobin.az/categories/${category.slug}`,
                    "description": category.seo_description || `${category.name} sahəsində iş elanları`
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
                "name": "Kateqoriyalar",
                "item": "https://Jobin.az/categories"
            }
        ]
    };

    return (
        <>
            {/* Server-rendered SEO content */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
            />
            
            {/* Hidden SEO content for search engines */}
            <div className="sr-only">
                <article>
                    <h1>İş Elanları Kateqoriyaları - Azərbaycanda Vakansiyalar</h1>
                    
                    <section>
                        <h2>Kateqoriyalar Haqqında</h2>
                        <p><strong>Ümumi Kateqoriya Sayı:</strong> {categories.length}</p>
                        <p><strong>Ümumi Aktiv Vakansiya:</strong> {totalJobs}</p>
                        <p>
                            Azərbaycanda müxtəlif sahələr üzrə iş elanları və vakansiyalar. 
                            IT, maliyyə, marketinq, satış, tibb, mühəndislik, insan resursları və digər kateqoriyalarda aktual iş təklifləri.
                        </p>
                    </section>

                    <section>
                        <h2>Bütün İş Kateqoriyaları</h2>
                        <ul>
                            {categories.map((category) => (
                                <li key={category.id}>
                                    <a href={`https://Jobin.az/categories/${category.slug}`}>
                                        <strong>{category.name}</strong>
                                        {` - ${category.jobsCount} aktiv vakansiya`}
                                        {category.description && (
                                            <span>. {stripHtml(category.description).substring(0, 150)}</span>
                                        )}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2>Populyar Kateqoriyalar</h2>
                        <ul>
                            {categories
                                .sort((a, b) => b.jobsCount - a.jobsCount)
                                .slice(0, 10)
                                .map((category) => (
                                    <li key={category.id}>
                                        <a href={`https://Jobin.az/categories/${category.slug}`}>
                                            {category.name} - {category.jobsCount} vakansiya
                                        </a>
                                    </li>
                                ))}
                        </ul>
                    </section>

                    <section>
                        <h2>İş Axtarışı</h2>
                        <p>
                            Platformamızda {categories.length} fərqli kateqoriyada {totalJobs} aktiv vakansiya mövcuddur. 
                            IT, maliyyə, satış, marketinq, mühəndislik, mühasibatlıq və digər sahələrdə iş axtarışı edən 
                            peşəkarlar üçün uyğun iş təklifləri tapa bilərsiniz.
                        </p>
                    </section>

                    <nav aria-label="Breadcrumb">
                        <ol>
                            <li><a href="https://jooble.az">Ana Səhifə</a></li>
                            <li>Kateqoriyalar</li>
                        </ol>
                    </nav>
                </article>
            </div>

            <CategoriesClient />
        </>
    );
}
