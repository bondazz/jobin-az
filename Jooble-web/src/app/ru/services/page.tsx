import { Metadata } from 'next';
import ServicesClient from '@/components/ServicesClient';

export const metadata: Metadata = {
    title: 'Услуги | Решения для работодателей - Jooble.az',
    description: 'Изучите наши услуги для работодателей. Публикуйте вакансии, продвигайте их и находите лучших кандидатов.',
    alternates: {
        canonical: 'https://jooble.az/ru/services',
        languages: {
            'az': 'https://jooble.az/services',
            'en': 'https://jooble.az/en/services',
            'ru': 'https://jooble.az/ru/services',
            'x-default': 'https://jooble.az/services',
        },
    },
};

export default function RuServicesPage() {
    return <ServicesClient />;
}
