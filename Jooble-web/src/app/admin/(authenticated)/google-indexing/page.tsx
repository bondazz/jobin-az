import AdminGoogleIndexingClient from '@/components/AdminGoogleIndexingClient';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Google İndeksləmə - Admin' };

export default function Page() {
    return <AdminGoogleIndexingClient />;
}
