import { Metadata } from 'next';
import CategoriesClient from '@/components/CategoriesClient';

export const metadata: Metadata = {
    title: 'Job Categories | Browse by Industry - Jooble.az',
    description: 'Explore job categories in Azerbaijan. Find vacancies in IT, Finance, Healthcare, Marketing, and more.',
    alternates: {
        canonical: 'https://jooble.az/en/categories',
        languages: {
            'az': 'https://jooble.az/categories',
            'en': 'https://jooble.az/en/categories',
            'ru': 'https://jooble.az/ru/categories',
            'x-default': 'https://jooble.az/categories',
        },
    },
};

export default function EnCategoriesPage() {
    return <CategoriesClient />;
}
