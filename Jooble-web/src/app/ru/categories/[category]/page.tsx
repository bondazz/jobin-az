import CategoriesClient from '@/components/CategoriesClient';
import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://igrtzfvphltnoiwedbtz.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTQzMDYsImV4cCI6MjA2Nzc5MDMwNn0.afoeynzfpIZMqMRgpD0fDQ_NdULXEML-LZ-SocnYKp0'
);

type Props = {
    params: { category: string }
};

async function getCategoryData(slug: string) {
    const { data: category } = await supabase
        .from('categories')
        .select('id, name, description, seo_title, seo_description, seo_keywords, slug')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

    if (!category) return null;

    const { count: jobsCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)
        .eq('is_active', true);

    return { category, jobsCount: jobsCount || 0 };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const data = await getCategoryData(params.category);

    if (!data) return {};

    const { category, jobsCount } = data;
    const title = category.seo_title || `Вакансии ${category.name} | ${jobsCount} позиций - Jooble.az`;
    const description = category.seo_description || `${jobsCount} активных вакансий в категории ${category.name}. Найдите работу своей мечты.`;

    return {
        title,
        description,
        alternates: {
            canonical: `https://jooble.az/ru/categories/${category.slug}`,
            languages: {
                'az': `https://jooble.az/categories/${category.slug}`,
                'en': `https://jooble.az/en/categories/${category.slug}`,
                'ru': `https://jooble.az/ru/categories/${category.slug}`,
                'x-default': `https://jooble.az/categories/${category.slug}`,
            },
        },
        openGraph: {
            title,
            description,
            url: `https://jooble.az/ru/categories/${category.slug}`,
            siteName: 'Jooble.az',
            type: 'website',
        },
    };
}

export default async function RuCategoryPage({ params }: Props) {
    const data = await getCategoryData(params.category);

    if (!data) {
        return <CategoriesClient />;
    }

    const { category, jobsCount } = data;

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://jooble.az/ru' },
            { '@type': 'ListItem', position: 2, name: 'Категории', item: 'https://jooble.az/ru/categories' },
            { '@type': 'ListItem', position: 3, name: category.name, item: `https://jooble.az/ru/categories/${category.slug}` }
        ]
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <div className="sr-only">
                <h1>Вакансии {category.name}</h1>
                <p>{jobsCount} активных вакансий в категории {category.name}</p>
            </div>
            <CategoriesClient />
        </>
    );
}
