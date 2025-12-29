import SubscribeClient from '@/components/SubscribeClient';
import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://igrtzfvphltnoiwedbtz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTQzMDYsImV4cCI6MjA2Nzc5MDMwNn0.afoeynzfpIZMqMRgpD0fDQ_NdULXEML-LZ-SocnYKp0';

export const metadata: Metadata = {
    title: "Abunə ol | Yeni Vakansiyalardan Xəbərdar Olun - Jooble.az",
    description: "Yeni iş elanları və vakansiyalardan xəbərdar olmaq üçün abunə olun. Seçdiyiniz kateqoriyalar üzrə bildirişlər alın.",
    keywords: "abunə ol, vakansiya bildirişləri, iş elanları xəbərdarlığı, email abunəlik, push bildirişlər",
    alternates: {
        canonical: "https://jooble.az/subscribe",
    },
    openGraph: {
        title: "Abunə ol | Yeni Vakansiyalardan Xəbərdar Olun - Jooble.az",
        description: "Yeni iş elanları və vakansiyalardan xəbərdar olmaq üçün abunə olun.",
        url: "https://jooble.az/subscribe",
        siteName: "Jooble.az",
        type: "website",
        images: [{ url: "https://jooble.az/icons/icon-512x512.jpg", width: 512, height: 512 }],
    },
};

async function getCategoriesData() {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name');
    return categories || [];
}

export default async function SubscribePage() {
    const categories = await getCategoriesData();

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Abunə ol - Vakansiya Bildirişləri",
        "description": "Yeni iş elanları və vakansiyalardan xəbərdar olmaq üçün abunə olun",
        "url": "https://jooble.az/subscribe"
    };

    const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Ana Səhifə", "item": "https://jooble.az" },
            { "@type": "ListItem", "position": 2, "name": "Abunə ol", "item": "https://jooble.az/subscribe" }
        ]
    };

    return (
        <>
            <div className="sr-only" aria-hidden="true">
                <h1>Abunə ol - Yeni Vakansiyalardan Xəbərdar Olun</h1>
                <p>Seçdiyiniz kateqoriyalar üzrə yeni iş elanları haqqında bildirişlər alın.</p>
                
                <h2>Abunəlik Üstünlükləri</h2>
                <ul>
                    <li>Yeni vakansiyalardan anında xəbərdar olun</li>
                    <li>Seçdiyiniz kateqoriyalar üzrə bildirişlər</li>
                    <li>Push bildirişləri ilə mobil xəbərdarlıq</li>
                    <li>İlk müraciət edənlərdən olun</li>
                </ul>
                
                <h2>Mövcud Kateqoriyalar</h2>
                <ul>
                    {categories.map(cat => (
                        <li key={cat.id}>
                            <a href={`/categories/${cat.slug}`}>{cat.name}</a>
                        </li>
                    ))}
                </ul>
            </div>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
            <SubscribeClient />
        </>
    );
}