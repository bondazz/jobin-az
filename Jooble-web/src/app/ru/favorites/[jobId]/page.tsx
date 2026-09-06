import SavedJobsClient from '@/components/SavedJobsClient';
import { Metadata } from 'next';

type Props = {
    params: { jobId: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    return {
        title: 'Сохранённые вакансии | Jooble.az',
        description: 'Ваши сохранённые вакансии. Отслеживайте интересующие вас позиции.',
        alternates: {
            canonical: `https://jooble.az/ru/favorites/${params.jobId}`,
            languages: {
                'az': `https://jooble.az/favorites/${params.jobId}`,
                'en': `https://jooble.az/en/favorites/${params.jobId}`,
                'ru': `https://jooble.az/ru/favorites/${params.jobId}`,
                'x-default': `https://jooble.az/favorites/${params.jobId}`,
            },
        },
    };
}

export default function RuFavoriteJobPage() {
    return <SavedJobsClient />;
}
