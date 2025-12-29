import AboutClient from '@/components/AboutClient';
import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://igrtzfvphltnoiwedbtz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTQzMDYsImV4cCI6MjA2Nzc5MDMwNn0.afoeynzfpIZMqMRgpD0fDQ_NdULXEML-LZ-SocnYKp0';

export const metadata: Metadata = {
    title: "Haqqımızda | Jooble.az - Azərbaycanın İş Axtarış Platforması",
    description: "Jooble.az haqqında ətraflı məlumat, missiyamız və təklif etdiyimiz xidmətlər. Azərbaycanın aparıcı iş axtarış platforması.",
    keywords: "haqqımızda, Jooble.az, iş axtarış platforması, vakansiya platforması, Azərbaycan, missiya, xidmətlər",
    alternates: {
        canonical: "https://jooble.az/about",
    },
    openGraph: {
        title: "Haqqımızda | Jooble.az - Azərbaycanın İş Axtarış Platforması",
        description: "Jooble.az haqqında ətraflı məlumat, missiyamız və təklif etdiyimiz xidmətlər.",
        url: "https://jooble.az/about",
        siteName: "Jooble.az",
        type: "website",
        images: [{ url: "https://jooble.az/icons/icon-512x512.jpg", width: 512, height: 512 }],
    },
};

async function getAboutData() {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data: aboutContent } = await supabase
        .from('about_content')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
    
    const { data: stats } = await supabase
        .from('jobs')
        .select('id', { count: 'exact' })
        .eq('is_active', true);
    
    const { data: companies } = await supabase
        .from('companies')
        .select('id', { count: 'exact' })
        .eq('is_active', true);
    
    return {
        content: aboutContent || [],
        jobCount: stats?.length || 0,
        companyCount: companies?.length || 0
    };
}

export default async function AboutPage() {
    const { content, jobCount, companyCount } = await getAboutData();

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "Haqqımızda - Jooble.az",
        "description": "Jooble.az haqqında ətraflı məlumat",
        "url": "https://jooble.az/about",
        "mainEntity": {
            "@type": "Organization",
            "name": "Jooble.az",
            "url": "https://jooble.az",
            "description": "Azərbaycanın aparıcı iş axtarış platforması",
            "foundingDate": "2024",
            "areaServed": "Azerbaijan"
        }
    };

    const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Ana Səhifə", "item": "https://jooble.az" },
            { "@type": "ListItem", "position": 2, "name": "Haqqımızda", "item": "https://jooble.az/about" }
        ]
    };

    return (
        <>
            <div className="sr-only" aria-hidden="true">
                <h1>Haqqımızda - Jooble.az</h1>
                <p>Azərbaycanın aparıcı iş axtarış platforması. {jobCount} aktiv vakansiya və {companyCount} şirkət ilə xidmətinizdəyik.</p>
                
                <h2>Missiyamız</h2>
                <p>İş axtaranları ən yaxşı iş imkanları ilə birləşdirmək və işəgötürənlərə uyğun namizədlər tapmaqda kömək etmək.</p>
                
                <h2>Xidmətlərimiz</h2>
                <ul>
                    <li>İş elanları yerləşdirmə</li>
                    <li>Vakansiya axtarışı</li>
                    <li>Şirkət profilləri</li>
                    <li>Kateqoriya üzrə axtarış</li>
                    <li>Region üzrə axtarış</li>
                    <li>Email və push bildirişləri</li>
                </ul>
                
                <h2>Statistika</h2>
                <ul>
                    <li>{jobCount} aktiv vakansiya</li>
                    <li>{companyCount} qeydiyyatlı şirkət</li>
                </ul>
                
                {content.map(section => (
                    <section key={section.id}>
                        <h3>{section.title}</h3>
                        <p>{section.description}</p>
                    </section>
                ))}
                
                <h2>Əlaqə</h2>
                <p>Suallarınız və təklifləriniz üçün bizimlə əlaqə saxlayın.</p>
            </div>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
            <AboutClient />
        </>
    );
}