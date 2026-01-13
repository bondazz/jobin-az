import CompaniesClient from '@/components/CompaniesClient';
import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://igrtzfvphltnoiwedbtz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTQzMDYsImV4cCI6MjA2Nzc5MDMwNn0.afoeynzfpIZMqMRgpD0fDQ_NdULXEML-LZ-SocnYKp0';
const supabase = createClient(supabaseUrl, supabaseKey);

type Props = {
    params: { company: string }
};

import { headers } from "next/headers";
import SeoShield from "@/components/SeoShield";
import { SEO_MASTER_KEYWORDS, SEO_HYDRATION_GUIDE } from "@/constants/seo-terms";

// Helper function to strip HTML tags
function stripHtml(html: string): string {
    return html?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() || '';
}

function getGooglebotCompanyHydration(companyName: string): string {
    return `
        <section class="google-hydration-content sr-only">
            <h2>${companyName} Şirkət Profili və İnsan Resursları Siyasəti</h2>
            <p>${companyName} Azərbaycanda 2026-cı ilin ən stabil işəgötürənləri siyahısındadır.</p>
            <p>${SEO_HYDRATION_GUIDE}</p>
            <p>Şirkətin daxili korporativ mədəniyyəti və vakansiya tələbləri qlobal standartlara tam cavab verir.</p>
            <ul>
                <li>${companyName} maaş və bonus sistemi</li>
                <li>Şirkətdə karyera inkişafı imkanları</li>
                <li>${companyName} vakansiyalarına müraciət qaydaları</li>
            </ul>
            <div class="master-keywords">
                ${SEO_MASTER_KEYWORDS.join(', ')}
            </div>
        </section>
    `;
}

async function getCompanyData(slug: string) {
    const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

    if (!company) return null;

    // Get job count for this company
    const { count: jobCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', company.id)
        .eq('is_active', true);

    // Get some job titles for SEO
    const { data: jobs } = await supabase
        .from('jobs')
        .select('title, slug, salary, location, type')
        .eq('company_id', company.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

    return { company, jobCount: jobCount || 0, jobs: jobs || [] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const data = await getCompanyData(params.company);

    if (!data) return {};

    const { company } = data;
    const description = company.seo_description || stripHtml(company.description || '') || `${company.name} şirkəti haqqında məlumat və vakansiyalar.`;

    return {
        title: company.seo_title || `${company.name} | Jooble`,
        description: description.slice(0, 160),
        keywords: company.seo_keywords?.join(', ') || `${company.name}, vakansiya, iş elanları`,
        openGraph: {
            title: company.seo_title || `${company.name} | Jooble`,
            description: description.slice(0, 160),
            images: company.logo ? [company.logo] : [],
            url: `https://jooble.az/companies/${params.company}`,
            type: 'website',
        },
        alternates: {
            canonical: `https://jooble.az/companies/${params.company}`,
        },
    };
}

export default async function CompanyPage({ params }: Props) {
    const userAgent = headers().get('user-agent') || '';
    const isGooglebot = /googlebot/i.test(userAgent);
    const data = await getCompanyData(params.company);

    if (!data) {
        return <CompaniesClient />;
    }

    const { company, jobCount, jobs } = data;
    const plainDescription = stripHtml(company.description || '');

    // JSON-LD structured data for Organization
    const organizationJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: company.name,
        description: plainDescription || `${company.name} şirkəti`,
        url: `https://jooble.az/companies/${company.slug}`,
        logo: company.logo || undefined,
        address: company.address ? {
            '@type': 'PostalAddress',
            streetAddress: company.address,
            addressCountry: 'AZ'
        } : undefined,
        contactPoint: (company.email || company.phone) ? {
            '@type': 'ContactPoint',
            email: company.email || undefined,
            telephone: company.phone || undefined,
        } : undefined,
        sameAs: company.website ? [
            company.website,
            "https://www.wikidata.org/wiki/Q227", // Azerbaijan Entity
            "https://az.wikipedia.org/wiki/Az%C9%99rbaycan_şirkətlərinin_siyahısı"
        ] : undefined,
    };

    const datasetJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        '@id': `https://jooble.az/companies/${company.slug}#dataset`,
        "name": `${company.name} Korporativ Data 2026`,
        "description": `${company.name} şirkətinin işçi sayı və vakansiya statistikası.`,
        "publisher": { "@type": "Organization", "name": "Jooble.az" }
    };

    // Breadcrumb JSON-LD
    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Ana Səhifə',
                item: 'https://jooble.az'
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Şirkətlər',
                item: 'https://jooble.az/companies'
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: company.name,
                item: `https://jooble.az/companies/${company.slug}`
            }
        ]
    };

    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
            />

            {/* Server-rendered SEO content - visible to bots */}
            <div className="sr-only">
                <article itemScope itemType="https://schema.org/Organization">
                    <header>
                        <h1 itemProp="name">
                            <SeoShield text={company.name} as="span" />
                        </h1>
                        {company.is_verified && <span>✓ Təsdiqlənmiş Şirkət</span>}
                    </header>

                    <section>
                        <h2>Şirkət Haqqında</h2>
                        <div itemProp="description">
                            {plainDescription || `${company.name} Azərbaycanın aparıcı şirkətlərindən biridir.`}
                        </div>
                    </section>

                    {company.address && (
                        <section itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                            <h3>Ünvan</h3>
                            <span itemProp="streetAddress">{company.address}</span>
                        </section>
                    )}

                    <section>
                        <h3>Əlaqə Məlumatları</h3>
                        {company.website && (
                            <div>
                                <span>Veb-sayt: </span>
                                <a href={company.website} itemProp="url">{company.website}</a>
                            </div>
                        )}
                        {company.email && (
                            <div>
                                <span>E-poçt: </span>
                                <a href={`mailto:${company.email}`} itemProp="email">{company.email}</a>
                            </div>
                        )}
                        {company.phone && (
                            <div>
                                <span>Telefon: </span>
                                <a href={`tel:${company.phone}`} itemProp="telephone">{company.phone}</a>
                            </div>
                        )}
                    </section>

                    <section>
                        <h2>{company.name} - İş Elanları ({jobCount} vakansiya)</h2>
                        {jobs.length > 0 ? (
                            <ul>
                                {jobs.map((job) => (
                                    <li key={job.slug}>
                                        <a href={`https://jooble.az/vacancies/${job.slug}`}>
                                            <strong>{job.title}</strong>
                                            {job.salary && <span> - Maaş: {job.salary}</span>}
                                            {job.location && <span> - Yer: {job.location}</span>}
                                            {job.type && <span> - Növ: {job.type}</span>}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>{company.name} şirkətində hazırda aktiv vakansiya yoxdur.</p>
                        )}
                    </section>

                    <footer>
                        <p>{company.name} haqqında ətraflı məlumat və iş elanları üçün Jooble.az platformasına daxil olun.</p>
                    </footer>
                </article>
            </div>

            {isGooglebot && (
                <div dangerouslySetInnerHTML={{ __html: getGooglebotCompanyHydration(company.name) }} />
            )}
            <CompaniesClient />
        </>
    );
}
