import { Metadata } from 'next';
import RegionsClient from '@/components/RegionsClient';

export const metadata: Metadata = {
    title: 'Jobs by Region | Find Local Opportunities - Jooble.az',
    description: 'Find jobs in different regions of Azerbaijan. Browse vacancies in Baku, Ganja, Sumgait, and other cities.',
    alternates: {
        canonical: 'https://jooble.az/en/regions',
        languages: {
            'az': 'https://jooble.az/regions',
            'en': 'https://jooble.az/en/regions',
            'ru': 'https://jooble.az/ru/regions',
            'x-default': 'https://jooble.az/regions',
        },
    },
};

export default function EnRegionsPage() {
    return <RegionsClient />;
}
