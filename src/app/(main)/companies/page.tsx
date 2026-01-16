import CompaniesClient from '@/components/CompaniesClient';
import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { headers } from "next/headers";
import SeoShield from "@/components/SeoShield";

const supabaseUrl = 'https://igrtzfvphltnoiwedbtz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTQzMDYsImV4cCI6MjA2Nzc5MDMwNn0.afoeynzfpIZMqMRgpD0fDQ_NdULXEML-LZ-SocnYKp0';
const supabase = createClient(supabaseUrl, supabaseKey);

export const metadata: Metadata = {
    title: "Şirkətlər və İş Elanları 2026 - Vakansiyalar və İşə Qəbul Platforması",
    description: "Azərbaycanda fəaliyyət göstərən minlərlə şirkətin aktual iş elanları və vakansiyaları. Şirkət profilləri, maaşlar və işə qəbul şərtləri.",
    alternates: {
        canonical: 'https://jobin.az/companies',
    },
    openGraph: {
        title: "Şirkətlər və İş Elanları 2026 - Jobin.az",
        description: "Azərbaycanda fəaliyyət göstərən minlərlə şirkətin aktual iş elanları və vakansiyaları.",
        url: "https://jobin.az/companies",
        siteName: "Jobin.az",
        images: [{ url: "https://jobin.az/icons/icon-512x512.jpg" }]
    }
};

async function getCompanies() {
    const { data } = await supabase
        .from('companies')
        .select('id, name, slug, logo, description, is_verified')
        .eq('is_active', true)
        .order('name')
        .limit(100);
    return data || [];
}

export default async function CompaniesPage() {
    const companies = await getCompanies();

    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": "https://jobin.az#org",
        "name": "Jobin Azərbaycan",
        "url": "https://jobin.az",
        "logo": "https://jobin.az/icons/icon-512x512.jpg",
        "sameAs": [
            "https://www.facebook.com/jobin.az",
            "https://www.instagram.com/jobin.az",
            "https://www.linkedin.com/company/jobin-az"
        ]
    };

    const datasetSchema = {
        "@context": "https://schema.org",
        "@type": "Dataset",
        "@id": "https://jobin.az/companies#dataset",
        "name": "Azərbaycan Korporativ Verilənlər Bazası 2026",
        "description": "Azərbaycanda qeydiyyatdan keçmiş şirkətlər və onların məşğulluq statistikası.",
        "publisher": { "@id": "https://jobin.az#org" },
        "creator": { "@id": "https://jobin.az#org" },
        "license": "https://creativecommons.org/licenses/by/4.0/",
        "isAccessibleForFree": true
    };

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "İşəgötürən Şirkətlər",
        "description": "Azərbaycanda aktual vakansiya elan edən şirkətlərin siyahısı",
        "url": "https://jobin.az/companies",
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": companies.length,
            "itemListElement": companies.slice(0, 30).map((company, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "Organization",
                    "name": company.name,
                    "url": `https://jobin.az/companies/${company.slug}`,
                    "logo": company.logo || undefined
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
                "item": "https://jobin.az"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Şirkətlər",
                "item": "https://jobin.az/companies"
            }
        ]
    };

    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
            />

            {/* Hidden SEO content for bots */}
            <div className="sr-only">
                <h1>
                    <SeoShield text="Azərbaycanda İş Verən Şirkətlər" as="span" />
                </h1>
                <p>Hazırda platformamızda {companies.length} aktiv şirkət profili mövcuddur.</p>
                <ul>
                    {companies.map(company => (
                        <li key={company.id}>
                            <a href={`/companies/${company.slug}`}>
                                {company.name} {company.is_verified ? '(Təsdiqlənmiş)' : ''}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            <CompaniesClient />
        </>
    );
}
