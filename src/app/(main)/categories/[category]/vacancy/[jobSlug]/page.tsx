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
    };
}

export default function CategoryJobPage() {
    return <CategoriesClient />;
}
