import { Metadata } from 'next';
import ReferralJobSubmissionClient from '@/components/ReferralJobSubmissionClient';

export const metadata: Metadata = {
    title: 'Добавить вакансию | Разместить объявление - Jooble.az',
    description: 'Разместите вакансию через нашу реферальную программу. Помогите компаниям найти лучших кандидатов.',
    alternates: {
        canonical: 'https://jooble.az/ru/add_job',
        languages: {
            'az': 'https://jooble.az/add_job',
            'en': 'https://jooble.az/en/add_job',
            'ru': 'https://jooble.az/ru/add_job',
            'x-default': 'https://jooble.az/add_job',
        },
    },
};

export default function RuAddJobPage() {
    return <ReferralJobSubmissionClient />;
}
