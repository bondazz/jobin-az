import { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';

export const metadata: Metadata = {
    title: 'Все вакансии | Список вакансий - Jooble.az',
    description: 'Просмотрите все доступные вакансии в Азербайджане. Найдите работу на полный день, частичную занятость и удалённые позиции.',
    alternates: {
        canonical: 'https://jooble.az/ru/vacancies',
        languages: {
            'az': 'https://jooble.az/vacancies',
            'en': 'https://jooble.az/en/vacancies',
            'ru': 'https://jooble.az/ru/vacancies',
            'x-default': 'https://jooble.az/vacancies',
        },
    },
};

export default function RuVacanciesPage() {
    return <HomeClient />;
}
