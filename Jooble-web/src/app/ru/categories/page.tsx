import { Metadata } from 'next';
import CategoriesClient from '@/components/CategoriesClient';

export const metadata: Metadata = {
    title: 'Категории вакансий | Поиск по отраслям - Jooble.az',
    description: 'Изучите категории вакансий в Азербайджане. Найдите работу в IT, финансах, здравоохранении, маркетинге и других сферах.',
    alternates: {
        canonical: 'https://jooble.az/ru/categories',
        languages: {
            'az': 'https://jooble.az/categories',
            'en': 'https://jooble.az/en/categories',
            'ru': 'https://jooble.az/ru/categories',
            'x-default': 'https://jooble.az/categories',
        },
    },
};

export default function RuCategoriesPage() {
    return <CategoriesClient />;
}
