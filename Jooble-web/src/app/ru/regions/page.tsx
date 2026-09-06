import { Metadata } from 'next';
import RegionsClient from '@/components/RegionsClient';

export const metadata: Metadata = {
    title: 'Вакансии по регионам | Найди работу рядом - Jooble.az',
    description: 'Найдите работу в разных регионах Азербайджана. Вакансии в Баку, Гяндже, Сумгаите и других городах.',
    alternates: {
        canonical: 'https://jooble.az/ru/regions',
        languages: {
            'az': 'https://jooble.az/regions',
            'en': 'https://jooble.az/en/regions',
            'ru': 'https://jooble.az/ru/regions',
            'x-default': 'https://jooble.az/regions',
        },
    },
};

export default function RuRegionsPage() {
    return <RegionsClient />;
}
