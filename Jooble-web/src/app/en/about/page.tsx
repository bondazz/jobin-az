import { Metadata } from 'next';
import AboutClient from '@/components/AboutClient';

export const metadata: Metadata = {
    title: 'About Us | Jooble.az',
    description: 'Learn about Jooble.az - the leading job search platform in Azerbaijan. Our mission, values, and team.',
    alternates: {
        canonical: 'https://jooble.az/en/about',
        languages: {
            'az': 'https://jooble.az/about',
            'en': 'https://jooble.az/en/about',
            'ru': 'https://jooble.az/ru/about',
            'x-default': 'https://jooble.az/about',
        },
    },
};

export default function EnAboutPage() {
    return <AboutClient />;
}
