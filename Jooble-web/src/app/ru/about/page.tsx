import { Metadata } from 'next';
import AboutClient from '@/components/AboutClient';

export const metadata: Metadata = {
    title: 'О нас | Jooble.az',
    description: 'Узнайте о Jooble.az - ведущей платформе поиска работы в Азербайджане. Наша миссия, ценности и команда.',
    alternates: {
        canonical: 'https://jooble.az/ru/about',
        languages: {
            'az': 'https://jooble.az/about',
            'en': 'https://jooble.az/en/about',
            'ru': 'https://jooble.az/ru/about',
            'x-default': 'https://jooble.az/about',
        },
    },
};

export default function RuAboutPage() {
    return <AboutClient />;
}
