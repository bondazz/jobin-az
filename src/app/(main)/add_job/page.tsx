import ReferralJobSubmissionClient from '@/components/ReferralJobSubmissionClient';
import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://igrtzfvphltnoiwedbtz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTQzMDYsImV4cCI6MjA2Nzc5MDMwNn0.afoeynzfpIZMqMRgpD0fDQ_NdULXEML-LZ-SocnYKp0';

export const metadata: Metadata = {
    title: 'İş Elanı Yerləşdir | Namizəd Tapma Platforması - Jooble.az',
    description: 'Vakansiyanızı ən uyğun namizədlərə çatdırın. Jooble.az işə qəbul prosesinizi sürətləndirən peşəkar vakansiya yerləşdirmə və namizəd tapma platforması təqdim edir.',
    keywords: 'iş elanı yerləşdir, vakansiya yerləşdirmək, iş elanı vermək, namizəd tapma platforması, işəgötürən paneli, HR vakansiya sistemi, işə qəbul platforması, Azərbaycan vakansiyaları',
    alternates: {
        canonical: "https://jooble.az/add_job",
    },
    openGraph: {
        title: 'İş Elanı Yerləşdir | Namizəd Tapma Platforması - Jooble.az',
        description: 'Vakansiyanızı ən uyğun namizədlərə çatdırın. Peşəkar vakansiya yerləşdirmə platforması.',
        url: "https://jooble.az/add_job",
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

export default async function AddJobPage() {
    const categories = await getCategoriesData();

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "İş Elanı Yerləşdir",
        "description": "Vakansiyanızı ən uyğun namizədlərə çatdırın",
        "url": "https://jooble.az/add_job"
    };

    const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Ana Səhifə", "item": "https://jooble.az" },
            { "@type": "ListItem", "position": 2, "name": "İş Elanı Yerləşdir", "item": "https://jooble.az/add_job" }
        ]
    };

    return (
        <>
            <div className="sr-only" aria-hidden="true">
                <h1>İş Elanı Yerləşdir - Namizəd Tapma Platforması</h1>
                <p>Vakansiyanızı ən uyğun namizədlərə çatdırın. İşə qəbul prosesinizi sürətləndirin.</p>
                
                <h2>Niyə Jooble.az?</h2>
                <ul>
                    <li>Geniş iş axtaran bazası</li>
                    <li>Effektiv namizəd tapma</li>
                    <li>Sürətli elan yerləşdirmə</li>
                    <li>Premium elan xüsusiyyətləri</li>
                    <li>Peşəkar dəstək xidməti</li>
                </ul>
                
                <h2>Elan Yerləşdirmə Addımları</h2>
                <ol>
                    <li>Şirkət məlumatlarınızı daxil edin</li>
                    <li>Vakansiya təfərrüatlarını yazın</li>
                    <li>Kateqoriya seçin</li>
                    <li>Elanı göndərin</li>
                </ol>
                
                <h2>Mövcud Kateqoriyalar</h2>
                <ul>
                    {categories.map(cat => (
                        <li key={cat.id}>
                            <a href={`/categories/${cat.slug}`}>{cat.name}</a>
                        </li>
                    ))}
                </ul>
                
                <h2>Əlaqə</h2>
                <p>Suallarınız üçün bizimlə əlaqə saxlayın. Peşəkar komandamız sizə kömək etməyə hazırdır.</p>
            </div>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
            <ReferralJobSubmissionClient />
        </>
    );
}