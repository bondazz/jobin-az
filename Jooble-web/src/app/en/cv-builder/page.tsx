import { Metadata } from 'next';
import CVBuilderClient from '@/components/CVBuilderClient';

export const metadata: Metadata = {
    title: 'CV Builder | Create Your Resume - Jooble.az',
    description: 'Create a professional CV with our free CV builder. Stand out to employers with a polished resume.',
    alternates: {
        canonical: 'https://jooble.az/en/cv-builder',
        languages: {
            'az': 'https://jooble.az/cv-builder',
            'en': 'https://jooble.az/en/cv-builder',
            'ru': 'https://jooble.az/ru/cv-builder',
            'x-default': 'https://jooble.az/cv-builder',
        },
    },
};

export default function EnCVBuilderPage() {
    return <CVBuilderClient />;
}
