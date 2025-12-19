import { Metadata } from 'next';
import { supabase } from '@/integrations/supabase/client';
import RegionDetailClient from '@/components/RegionDetailClient';

interface RegionPageProps {
    params: { region: string };
}

export async function generateMetadata({ params }: RegionPageProps): Promise<Metadata> {
    const { data: region } = await supabase
        .from('regions')
        .select('*')
        .eq('slug', params.region)
        .eq('is_active', true)
        .single();

    if (!region) {
        return {
            title: 'Region tapılmadı - Jooble.az',
        };
    }

    const title = region.seo_title || `${region.name} İş Elanları | Vakansiyalar - Jooble.az`;
    const description = region.seo_description || `${region.name} regionunda aktual iş elanları və vakansiyalar. Ən yaxşı iş imkanlarını kəşf edin.`;

    return {
        title,
        description,
        keywords: region.seo_keywords?.join(', ') || `${region.name}, iş elanları, vakansiyalar, Azərbaycan`,
        alternates: {
            canonical: `https://jooble.az/regions/${region.slug}`,
        },
        openGraph: {
            title,
            description,
            url: `https://jooble.az/regions/${region.slug}`,
            siteName: 'Jooble.az',
            type: 'website',
            images: [
                {
                    url: 'https://jooble.az/icons/icon-512x512.jpg',
                    width: 512,
                    height: 512,
                    alt: region.name,
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

export default function RegionPage({ params }: RegionPageProps) {
    return <RegionDetailClient regionSlug={params.region} />;
}
