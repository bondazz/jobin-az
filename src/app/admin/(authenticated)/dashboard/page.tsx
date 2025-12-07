import AdminDashboardClient from '@/components/AdminDashboardClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin Dashboard | Jooble Azərbaycan',
    description: 'Jooble Azərbaycan Admin Dashboard',
};

export default function AdminDashboardPage() {
    return <AdminDashboardClient />;
}
