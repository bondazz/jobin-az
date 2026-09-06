import { Metadata } from 'next';
import ReferralClient from '@/components/ReferralClient';

export const metadata: Metadata = {
    title: 'Реферальная программа | Получайте награды - Jooble.az',
    description: 'Присоединяйтесь к нашей реферальной программе и получайте награды за привлечение компаний и соискателей.',
    alternates: {
        canonical: 'https://jooble.az/ru/referral',
        languages: {
            'az': 'https://jooble.az/referral',
            'en': 'https://jooble.az/en/referral',
            'ru': 'https://jooble.az/ru/referral',
            'x-default': 'https://jooble.az/referral',
        },
    },
};

export default function RuReferralPage() {
    return <ReferralClient />;
}
