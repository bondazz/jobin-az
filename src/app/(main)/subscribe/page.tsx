import SubscribeClient from '@/components/SubscribeClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Abunə ol | Jooble",
    description: "Yeni vakansiyalardan xəbərdar olmaq üçün abunə olun.",
};

export default function SubscribePage() {
    return <SubscribeClient />;
}
