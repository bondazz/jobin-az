import { Metadata } from 'next';
import CompaniesClient from '@/components/CompaniesClient';

export const metadata: Metadata = {
    title: 'Companies | Top Employers in Azerbaijan - Jooble.az',
    description: 'Discover top companies hiring in Azerbaijan. Explore employer profiles and find your ideal workplace.',
    alternates: {
        canonical: 'https://jooble.az/en/companies',
        languages: {
            'az': 'https://jooble.az/companies',
            'en': 'https://jooble.az/en/companies',
            'ru': 'https://jooble.az/ru/companies',
            'x-default': 'https://jooble.az/companies',
        },
    },
};

export default function EnCompaniesPage() {
    return <CompaniesClient />;
}
