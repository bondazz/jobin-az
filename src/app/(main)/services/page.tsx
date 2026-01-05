import ServicesClient from '@/components/ServicesClient';
import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://igrtzfvphltnoiwedbtz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTQzMDYsImV4cCI6MjA2Nzc5MDMwNn0.afoeynzfpIZMqMRgpD0fDQ_NdULXEML-LZ-SocnYKp0';

export const metadata: Metadata = {
    title: "Xidmətlər və Qiymətlər | İş Elanı Yerləşdirmə - Jooble.az",
    description: "İş elanları yerləşdirmək və reklam xidmətləri haqqında məlumat. Müxtəlif qiymət paketləri və premium xüsusiyyətlər.",
    keywords: "xidmətlər, qiymətlər, iş elanı yerləşdirmə, vakansiya reklam, premium paket, işəgötürən xidmətləri",
    alternates: {
        canonical: "https://jooble.az/services",
    },
    openGraph: {
        title: "Xidmətlər və Qiymətlər | İş Elanı Yerləşdirmə - Jooble.az",
        description: "İş elanları yerləşdirmək və reklam xidmətləri haqqında məlumat.",
        url: "https://jooble.az/services",
        siteName: "Jooble.az",
        type: "website",
        images: [{ url: "https://jooble.az/icons/icon-512x512.jpg", width: 512, height: 512 }],
    },
};

async function getPricingData() {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data: plans } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
    
    const { data: features } = await supabase
        .from('pricing_features')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
    
    return { plans: plans || [], features: features || [] };
}

export default async function ServicesPage() {
    const { plans, features } = await getPricingData();

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Xidmətlər və Qiymətlər",
        "description": "İş elanları yerləşdirmək və reklam xidmətləri",
        "url": "https://jooble.az/services",
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": plans.length,
            "itemListElement": plans.map((plan, index) => {
                // Extract numeric price from string like "50 AZN" or "50"
                const priceString = String(plan.price || '0');
                const numericPrice = parseFloat(priceString.replace(/[^\d.]/g, '')) || 0;
                
                return {
                    "@type": "ListItem",
                    "position": index + 1,
                    "item": {
                        "@type": "Product",
                        "name": plan.name,
                        "description": plan.description || plan.name,
                        "image": "https://jooble.az/icons/icon-512x512.jpg",
                        "offers": {
                            "@type": "Offer",
                            "price": numericPrice,
                            "priceCurrency": "AZN",
                            "availability": "https://schema.org/InStock"
                        }
                    }
                };
            })
        }
    };

    const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Ana Səhifə", "item": "https://jooble.az" },
            { "@type": "ListItem", "position": 2, "name": "Xidmətlər və Qiymətlər", "item": "https://jooble.az/services" }
        ]
    };

    return (
        <>
            <div className="sr-only" aria-hidden="true">
                <h1>Xidmətlər və Qiymətlər - İş Elanı Yerləşdirmə</h1>
                <p>İş elanları yerləşdirmək və reklam xidmətləri haqqında ətraflı məlumat.</p>
                
                <h2>Qiymət Paketləri</h2>
                <ul>
                    {plans.map(plan => (
                        <li key={plan.id}>
                            <h3>{plan.name} - {plan.price} AZN/{plan.period}</h3>
                            <p>{plan.description}</p>
                            <ul>
                                {plan.features?.map((feature: string, idx: number) => (
                                    <li key={idx}>{feature}</li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
                
                <h2>Xidmət Xüsusiyyətləri</h2>
                <ul>
                    {features.map(feature => (
                        <li key={feature.id}>
                            {feature.feature_name} - {feature.category}
                        </li>
                    ))}
                </ul>
                
                <h2>Niyə Bizi Seçməlisiniz?</h2>
                <ul>
                    <li>Geniş istifadəçi bazası</li>
                    <li>Effektiv namizəd tapma</li>
                    <li>Premium elan xüsusiyyətləri</li>
                    <li>Peşəkar dəstək</li>
                </ul>
            </div>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
            <ServicesClient />
        </>
    );
}