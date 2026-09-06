import { Metadata } from 'next';
import SavedJobsClient from '@/components/SavedJobsClient';

export const metadata: Metadata = {
    title: 'Сохранённые вакансии | Избранное - Jooble.az',
    description: 'Просмотрите сохранённые вакансии и избранное. Отслеживайте интересные предложения работы.',
    alternates: {
        canonical: 'https://jooble.az/ru/favorites',
        languages: {
            'az': 'https://jooble.az/favorites',
            'en': 'https://jooble.az/en/favorites',
            'ru': 'https://jooble.az/ru/favorites',
            'x-default': 'https://jooble.az/favorites',
        },
    },
};

export default function RuFavoritesPage() {
    return <SavedJobsClient />;
}
