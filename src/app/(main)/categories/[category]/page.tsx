import CategoriesClient from '@/components/CategoriesClient';
import { Metadata } from 'next';
import { supabase } from '@/integrations/supabase/client';

type Props = {
    params: { category: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { data } = await supabase
        .from('categories')
        .select('name, description')
        .eq('slug', params.category)
        .single();

    if (!data) return {};

    return {
        title: `${data.name} Vakansiyaları | Jooble`,
        description: data.description || `${data.name} sahəsində iş elanları.`,
    };
}

export default function CategoryPage() {
    return <CategoriesClient />;
}
