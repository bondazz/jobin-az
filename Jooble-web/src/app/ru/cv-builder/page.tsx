import { Metadata } from 'next';
import CVBuilderClient from '@/components/CVBuilderClient';

export const metadata: Metadata = {
    title: 'Конструктор резюме | Создай своё CV - Jooble.az',
    description: 'Создайте профессиональное резюме с помощью нашего бесплатного конструктора. Выделитесь среди кандидатов.',
    alternates: {
        canonical: 'https://jooble.az/ru/cv-builder',
        languages: {
            'az': 'https://jooble.az/cv-builder',
            'en': 'https://jooble.az/en/cv-builder',
            'ru': 'https://jooble.az/ru/cv-builder',
            'x-default': 'https://jooble.az/cv-builder',
        },
    },
};

export default function RuCVBuilderPage() {
    return <CVBuilderClient />;
}
