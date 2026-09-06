import CVBuilderClient from '@/components/CVBuilderClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "CV Builder - Peşəkar CV Hazırlayın",
    description: "Pulsuz onlayn CV düzəldən vasitəsilə peşəkar CV/Resume hazırlayın. Qeydiyyat tələb olunmur.",
    keywords: "cv builder, resume builder, pulsuz cv, peşəkar resume",
    alternates: {
        canonical: 'https://jooble.az/cv-builder',
        languages: {
            'az': 'https://jooble.az/cv-builder',
            'en': 'https://jooble.az/en/cv-builder',
            'ru': 'https://jooble.az/ru/cv-builder',
            'x-default': 'https://jooble.az/cv-builder',
        },
    },
};

export default function CVBuilderPage() {
    return <CVBuilderClient />;
}
