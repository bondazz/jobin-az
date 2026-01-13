import AdminDashboardClient from '@/components/AdminDashboardClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin Dashboard | Jobin Azərbaycan',
    description: 'Jobin Azərbaycan Admin Dashboard',
};

export default function AdminDashboardPage() {
    return <AdminDashboardClient />;
}
