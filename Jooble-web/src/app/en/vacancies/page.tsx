import { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';

export const metadata: Metadata = {
    title: 'All Vacancies | Job Listings - Jooble.az',
    description: 'Browse all available job vacancies in Azerbaijan. Find full-time, part-time, and remote positions across various industries.',
    alternates: {
        canonical: 'https://jooble.az/en/vacancies',
        languages: {
            'az': 'https://jooble.az/vacancies',
            'en': 'https://jooble.az/en/vacancies',
            'ru': 'https://jooble.az/ru/vacancies',
            'x-default': 'https://jooble.az/vacancies',
        },
    },
};

export default function EnVacanciesPage() {
    return <HomeClient />;
}
