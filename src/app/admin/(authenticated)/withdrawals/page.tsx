import AdminWithdrawalsClient from '@/components/AdminWithdrawalsClient';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Çıxışlar - Admin' };

export default function Page() {
    return <AdminWithdrawalsClient />;
}
