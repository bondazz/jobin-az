import AdminSettingsClient from '@/components/AdminSettingsClient';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Tənzimləmələr - Admin' };

export default function Page() {
    return <AdminSettingsClient />;
}
