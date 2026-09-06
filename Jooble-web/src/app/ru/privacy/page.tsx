import { Metadata } from 'next';
import PrivacyPolicyClient from '@/components/PrivacyPolicyClient';

export const metadata: Metadata = {
    title: 'Политика конфиденциальности | Jooble.az',
    description: 'Политика конфиденциальности платформы Jooble.az. Узнайте, как собираются, используются и защищаются ваши персональные данные.',
    alternates: {
        canonical: 'https://jooble.az/ru/privacy',
        languages: {
            'az': 'https://jooble.az/privacy',
            'en': 'https://jooble.az/en/privacy',
            'ru': 'https://jooble.az/ru/privacy',
            'x-default': 'https://jooble.az/privacy',
        },
    },
};

export default function RuPrivacyPage() {
    return <PrivacyPolicyClient />;
}
