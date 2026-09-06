import { Metadata } from 'next';
import CompaniesClient from '@/components/CompaniesClient';

export const metadata: Metadata = {
    title: 'Компании | Лучшие работодатели Азербайджана - Jooble.az',
    description: 'Откройте для себя ведущие компании Азербайджана. Изучите профили работодателей и найдите идеальное место работы.',
    alternates: {
        canonical: 'https://jooble.az/ru/companies',
        languages: {
            'az': 'https://jooble.az/companies',
            'en': 'https://jooble.az/en/companies',
            'ru': 'https://jooble.az/ru/companies',
            'x-default': 'https://jooble.az/companies',
        },
    },
};

export default function RuCompaniesPage() {
    return <CompaniesClient />;
}
