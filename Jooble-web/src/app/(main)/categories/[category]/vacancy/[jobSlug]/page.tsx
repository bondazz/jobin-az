import CategoriesClient from '@/components/CategoriesClient';
import { Metadata } from 'next';
import { supabase } from '@/integrations/supabase/client';

type Props = {
    params: { jobSlug: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { data } = await supabase
        .from('jobs')
        .select('seo_title, seo_description, seo_keywords')
        .eq('slug', params.jobSlug)
        .single();

    if (!data) return {};

    return {
        title: data.seo_title,
        description: data.seo_description,
        keywords: data.seo_keywords,
        alternates: {
            canonical: `https://jooble.az/vacancies/${params.jobSlug}`,
            languages: {
                'az': `https://jooble.az/vacancies/${params.jobSlug}`,
                'en': `https://jooble.az/en/vacancies/${params.jobSlug}`,
                'ru': `https://jooble.az/ru/vacancies/${params.jobSlug}`,
                'x-default': `https://jooble.az/vacancies/${params.jobSlug}`,
            },
        },
    };
}

export default function CategoryJobPage() {
    return <CategoriesClient />;
}
