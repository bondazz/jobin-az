import { Metadata } from 'next';
import SavedJobsClient from '@/components/SavedJobsClient';

export const metadata: Metadata = {
    title: 'Saved Jobs | Your Favorites - Jooble.az',
    description: 'View your saved jobs and favorite vacancies. Keep track of interesting opportunities.',
    alternates: {
        canonical: 'https://jooble.az/en/favorites',
        languages: {
            'az': 'https://jooble.az/favorites',
            'en': 'https://jooble.az/en/favorites',
            'ru': 'https://jooble.az/ru/favorites',
            'x-default': 'https://jooble.az/favorites',
        },
    },
};

export default function EnFavoritesPage() {
    return <SavedJobsClient />;
}
