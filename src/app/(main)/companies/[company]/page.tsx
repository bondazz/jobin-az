import CompaniesClient from '@/components/CompaniesClient';
import { Metadata } from 'next';
import { supabase } from '@/integrations/supabase/client';

type Props = {
    params: { company: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { data } = await supabase
        .from('companies')
        .select('name, description, seo_title, seo_description, logo')
        .eq('slug', params.company)
        .single();

    if (!data) return {};

    return {
        title: data.seo_title || `${data.name} | Jooble`,
        description: data.seo_description || data.description || `${data.name} şirkəti haqqında məlumat və vakansiyalar.`,
        openGraph: {
            images: data.logo ? [data.logo] : [],
        },
        alternates: {
            canonical: `https://jooble.az/companies/${params.company}`,
        },
    };
}

export default function CompanyPage() {
    return <CompaniesClient />;
}
