import { Metadata } from 'next';
import ReferralClient from '@/components/ReferralClient';

export const metadata: Metadata = {
    title: 'Referral Program | Earn Rewards - Jooble.az',
    description: 'Join our referral program and earn rewards for referring companies and job seekers.',
    alternates: {
        canonical: 'https://jooble.az/en/referral',
        languages: {
            'az': 'https://jooble.az/referral',
            'en': 'https://jooble.az/en/referral',
            'ru': 'https://jooble.az/ru/referral',
            'x-default': 'https://jooble.az/referral',
        },
    },
};

export default function EnReferralPage() {
    return <ReferralClient />;
}
