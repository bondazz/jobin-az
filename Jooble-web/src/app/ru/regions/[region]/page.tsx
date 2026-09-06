import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import RegionsClient from '@/components/RegionsClient';

const supabase = createClient(
    'https://igrtzfvphltnoiwedbtz.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTQzMDYsImV4cCI6MjA2Nzc5MDMwNn0.afoeynzfpIZMqMRgpD0fDQ_NdULXEML-LZ-SocnYKp0'
);

interface RegionPageProps {
    params: { region: string };
}

async function getRegionData(slug: string) {
    const { data: region } = await supabase
        .from('regions')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

    if (!region) return null;

    const { count: jobCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .ilike('location', `%${region.name}%`);

    return { region, jobCount: jobCount || 0 };
}

export async function generateMetadata({ params }: RegionPageProps): Promise<Metadata> {
    const data = await getRegionData(params.region);

    if (!data) {
        return { title: 'Регион не найден - Jooble.az' };
    }

    const { region, jobCount } = data;
    const title = region.seo_title || `Вакансии ${region.name} (${jobCount} позиций) | Jooble.az`;
    const description = region.seo_description || `${jobCount}+ вакансий в регионе ${region.name}. Найдите лучшие возможности.`;

    return {
        title,
        description,
        alternates: {
            canonical: `https://jooble.az/ru/regions/${region.slug}`,
            languages: {
                'az': `https://jooble.az/regions/${region.slug}`,
                'en': `https://jooble.az/en/regions/${region.slug}`,
                'ru': `https://jooble.az/ru/regions/${region.slug}`,
                'x-default': `https://jooble.az/regions/${region.slug}`,
            },
        },
        openGraph: {
            title,
            description,
            url: `https://jooble.az/ru/regions/${region.slug}`,
            siteName: 'Jooble.az',
            type: 'website',
        },
    };
}

export default async function RuRegionPage({ params }: RegionPageProps) {
    const data = await getRegionData(params.region);

    if (!data) {
        return <RegionsClient />;
    }

    const { region, jobCount } = data;

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://jooble.az/ru' },
            { '@type': 'ListItem', position: 2, name: 'Регионы', item: 'https://jooble.az/ru/regions' },
            { '@type': 'ListItem', position: 3, name: region.name, item: `https://jooble.az/ru/regions/${region.slug}` }
        ]
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <div className="sr-only">
                <h1>Вакансии {region.name}</h1>
                <p>{jobCount} активных вакансий в регионе {region.name}</p>
            </div>
            <RegionsClient />
        </>
    );
}
