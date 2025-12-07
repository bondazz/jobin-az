import SavedJobsClient from '@/components/SavedJobsClient';
import { Metadata } from 'next';
import { supabase } from '@/integrations/supabase/client';

type Props = {
    params: { jobId: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { data } = await supabase
        .from('jobs')
        .select('seo_title, seo_description')
        .eq('id', params.jobId)
        .single();

    if (!data) return {};

    return {
        title: data.seo_title,
        description: data.seo_description,
    };
}

export default function FavoriteJobPage() {
    return <SavedJobsClient />;
}
