import AdminNotificationsClient from '@/components/AdminNotificationsClient';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Bildirişlər - Admin' };

export default function Page() {
    return <AdminNotificationsClient />;
}
