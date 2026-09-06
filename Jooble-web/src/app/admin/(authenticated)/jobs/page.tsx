import AdminJobsClient from '@/components/AdminJobsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Vakansiya İdarəetməsi - Admin Panel',
    description: 'Admin panel - Vakansiyaların idarə edilməsi',
};

export default function AdminJobsPage() {
    return <AdminJobsClient />;
}
