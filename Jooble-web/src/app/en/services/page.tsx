import { Metadata } from 'next';
import ServicesClient from '@/components/ServicesClient';

export const metadata: Metadata = {
    title: 'Services | Employer Solutions - Jooble.az',
    description: 'Explore our services for employers. Post jobs, promote vacancies, and find the best candidates.',
    alternates: {
        canonical: 'https://jooble.az/en/services',
        languages: {
            'az': 'https://jooble.az/services',
            'en': 'https://jooble.az/en/services',
            'ru': 'https://jooble.az/ru/services',
            'x-default': 'https://jooble.az/services',
        },
    },
};

export default function EnServicesPage() {
    return <ServicesClient />;
}
