import { Metadata } from 'next';
import PaymentSuccessClient from '@/components/PaymentSuccessClient';

export const metadata: Metadata = {
    title: 'Ödəniş Uğurlu | Jooble.az',
    description: 'Ödənişiniz uğurla tamamlandı.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function PaymentSuccessPage() {
    return <PaymentSuccessClient />;
}
