import AdminReferralsClient from '@/components/AdminReferralsClient';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Referrallar - Admin' };

export default function Page() {
    return <AdminReferralsClient />;
}
