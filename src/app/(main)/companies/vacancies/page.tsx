import CompaniesClient from '@/components/CompaniesClient';
import { Metadata } from 'next';
import { supabase } from '@/integrations/supabase/client';

type Props = {
    params: { company: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { data } = await supabase
        .from('companies')
        .select('name, jobs_seo_title, jobs_seo_description, logo')
        .eq('slug', params.company)
        .single();

    if (!data) return {};

    return {
        title: data.jobs_seo_title || `${data.name} - İş Elanları | Jobin`,
        description: data.jobs_seo_description || `${data.name} şirkətində aktiv vakansiyalar və iş elanları.`,
        openGraph: {
            images: data.logo ? [data.logo] : [],
        },
        alternates: {
            canonical: `https://Jobin.az/companies/${params.company}/vacancies`,
        },
    };
}

export default function CompanyVacanciesPage() {
    return <CompaniesClient />;
}
