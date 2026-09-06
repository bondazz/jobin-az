import { Metadata } from 'next';
import SubscribeClient from '@/components/SubscribeClient';

export const metadata: Metadata = {
    title: 'Подписка | Получайте уведомления о вакансиях - Jooble.az',
    description: 'Подпишитесь на уведомления о новых вакансиях. Не пропустите подходящую работу в вашей сфере.',
    alternates: {
        canonical: 'https://jooble.az/ru/subscribe',
        languages: {
            'az': 'https://jooble.az/subscribe',
            'en': 'https://jooble.az/en/subscribe',
            'ru': 'https://jooble.az/ru/subscribe',
            'x-default': 'https://jooble.az/subscribe',
        },
    },
};

export default function RuSubscribePage() {
    return <SubscribeClient />;
}
