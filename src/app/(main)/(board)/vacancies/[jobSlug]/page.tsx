import { Metadata } from 'next';
import { supabase } from '@/integrations/supabase/client';

type Props = {
    params: { jobSlug: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { data } = await supabase
        .from('jobs')
        .select('seo_title, seo_description, seo_keywords, companies(logo)')
        .eq('slug', params.jobSlug)
        .single();

    if (!data) return {};

    const companyLogo = (data.companies as any)?.logo;

    return {
        title: data.seo_title || 'Jooble.az - İş Elanları',
        description: data.seo_description || 'Ən son vakansiyalar və iş elanları Jooble.az-da',
        keywords: data.seo_keywords,
        openGraph: {
            type: 'website',
            url: `https://jooble.az/vacancies/${params.jobSlug}`,
            title: data.seo_title || 'Jooble.az - İş Elanları',
            description: data.seo_description || 'Ən son vakansiyalar və iş elanları Jooble.az-da',
            siteName: 'Jooble.az',
            images: [
                {
                    url: companyLogo || 'https://jooble.az/icons/icon-512x512.jpg',
                    width: 800,
                    height: 600,
                    alt: data.seo_title || 'Job Image',
                }
            ],
        },
        alternates: {
            canonical: `https://jooble.az/vacancies/${params.jobSlug}`,
        },
    };
}

export default function JobPage() {
    return null;
}
