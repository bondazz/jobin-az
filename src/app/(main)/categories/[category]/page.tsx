import CategoriesClient from '@/components/CategoriesClient';
import { Metadata } from 'next';
import { supabase } from '@/integrations/supabase/client';

type Props = {
    params: { category: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { data } = await supabase
        .from('categories')
        .select('name, description, seo_title, seo_description, seo_keywords, slug')
        .eq('slug', params.category)
        .single();

    if (!data) return {};

    const title = data.seo_title || `${data.name} Vakansiyaları | İş Elanları - Jooble.az`;
    const description = data.seo_description || `${data.name} sahəsində ən yeni iş elanları və vakansiyalar. Azərbaycanda ${data.name} üzrə aktual iş təklifləri.`;
    const keywords = data.seo_keywords?.join(', ') || `${data.name}, vakansiya, iş elanları, ${data.name} işləri`;
    const canonicalUrl = `https://jooble.az/categories/${data.slug}`;

    return {
        title,
        description,
        keywords,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            siteName: 'Jooble.az',
            type: 'website',
            images: [
                {
                    url: 'https://jooble.az/icons/icon-512x512.jpg',
                    width: 512,
                    height: 512,
                    alt: `${data.name} - İş Elanları`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['https://jooble.az/icons/icon-512x512.jpg'],
        },
    };
}

export default function CategoryPage() {
    return <CategoriesClient />;
}
