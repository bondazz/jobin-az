import { Metadata } from 'next';
import SubscribeClient from '@/components/SubscribeClient';

export const metadata: Metadata = {
    title: 'Subscribe | Get Job Alerts - Jooble.az',
    description: 'Subscribe to receive job alerts and notifications. Never miss a new vacancy in your field.',
    alternates: {
        canonical: 'https://jooble.az/en/subscribe',
        languages: {
            'az': 'https://jooble.az/subscribe',
            'en': 'https://jooble.az/en/subscribe',
            'ru': 'https://jooble.az/ru/subscribe',
            'x-default': 'https://jooble.az/subscribe',
        },
    },
};

export default function EnSubscribePage() {
    return <SubscribeClient />;
}
