import { Metadata } from 'next';
import PaymentErrorClient from '@/components/PaymentErrorClient';

export const metadata: Metadata = {
    title: 'Ödəniş Uğursuz | Jooble.az',
    description: 'Ödəniş zamanı xəta baş verdi.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function PaymentErrorPage() {
    return <PaymentErrorClient />;
}
