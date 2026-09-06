import CompaniesClient from '@/components/CompaniesClient';
import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://igrtzfvphltnoiwedbtz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTQzMDYsImV4cCI6MjA2Nzc5MDMwNn0.afoeynzfpIZMqMRgpD0fDQ_NdULXEML-LZ-SocnYKp0';
const supabase = createClient(supabaseUrl, supabaseKey);

type Props = {
    params: { company: string }
};

function stripHtml(html: string): string {
    return html?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() || '';
}

async function getCompanyData(slug: string) {
    const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

    if (!company) return null;

    const { count: jobCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', company.id)
        .eq('is_active', true);

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
    const description = company.seo_description || stripHtml(company.description || '') || `Информация о компании ${company.name} и вакансии.`;

    return {
        title: company.seo_title || `${company.name} | Jooble`,
        description: description.slice(0, 160),
        keywords: company.seo_keywords?.join(', ') || `${company.name}, вакансии, работа`,
        openGraph: {
            title: company.seo_title || `${company.name} | Jooble`,
            description: description.slice(0, 160),
            images: company.logo ? [company.logo] : [],
            url: `https://jooble.az/ru/companies/${params.company}`,
            type: 'website',
        },
        alternates: {
            canonical: `https://jooble.az/ru/companies/${params.company}`,
            languages: {
                'az': `https://jooble.az/companies/${params.company}`,
                'en': `https://jooble.az/en/companies/${params.company}`,
                'ru': `https://jooble.az/ru/companies/${params.company}`,
                'x-default': `https://jooble.az/companies/${params.company}`,
            },
        },
    };
}

export default async function RuCompanyPage({ params }: Props) {
    const data = await getCompanyData(params.company);

    if (!data) {
        return <CompaniesClient />;
    }

    const { company, jobCount, jobs } = data;
    const plainDescription = stripHtml(company.description || '');

    const organizationJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: company.name,
        description: plainDescription || `Компания ${company.name}`,
        url: `https://jooble.az/ru/companies/${company.slug}`,
        logo: company.logo || undefined,
        address: company.address ? {
            '@type': 'PostalAddress',
            streetAddress: company.address,
            addressCountry: 'AZ'
        } : undefined,
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://jooble.az/ru' },
            { '@type': 'ListItem', position: 2, name: 'Компании', item: 'https://jooble.az/ru/companies' },
            { '@type': 'ListItem', position: 3, name: company.name, item: `https://jooble.az/ru/companies/${company.slug}` }
        ]
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <div className="sr-only">
                <h1>{company.name}</h1>
                <p>Активные вакансии: {jobCount}</p>
                {jobs.length > 0 && (
                    <ul>
                        {jobs.map((job) => (
                            <li key={job.slug}>
                                <a href={`https://jooble.az/ru/vacancies/${job.slug}`}>{job.title}</a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <CompaniesClient />
        </>
    );
}
