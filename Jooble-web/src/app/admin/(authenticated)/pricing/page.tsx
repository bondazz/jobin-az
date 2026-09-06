import AdminPricingClient from '@/components/AdminPricingClient';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Qiymətlər - Admin' };

export default function Page() {
    return <AdminPricingClient />;
}
