import { Metadata } from 'next';
import PrivacyPolicyClient from '@/components/PrivacyPolicyClient';

export const metadata: Metadata = {
    title: 'Privacy Policy | Jooble.az',
    description: 'Privacy policy of Jooble.az platform. Learn how your personal data is collected, used and protected.',
    alternates: {
        canonical: 'https://jooble.az/en/privacy',
        languages: {
            'az': 'https://jooble.az/privacy',
            'en': 'https://jooble.az/en/privacy',
            'ru': 'https://jooble.az/ru/privacy',
            'x-default': 'https://jooble.az/privacy',
        },
    },
};

export default function EnPrivacyPage() {
    return <PrivacyPolicyClient />;
}
