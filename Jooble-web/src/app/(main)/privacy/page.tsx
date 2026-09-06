import { Metadata } from 'next';
import PrivacyPolicyClient from '@/components/PrivacyPolicyClient';

export const metadata: Metadata = {
    title: 'Məxfilik Siyasəti | Jooble.az',
    description: 'Jooble.az platformasının məxfilik siyasəti. Şəxsi məlumatlarınızın necə toplandığı, istifadə edildiyi və qorunduğu haqqında ətraflı məlumat.',
    alternates: {
        canonical: 'https://jooble.az/privacy',
        languages: {
            'az': 'https://jooble.az/privacy',
            'en': 'https://jooble.az/en/privacy',
            'ru': 'https://jooble.az/ru/privacy',
            'x-default': 'https://jooble.az/privacy',
        },
    },
};

export default function PrivacyPage() {
    return <PrivacyPolicyClient />;
}
