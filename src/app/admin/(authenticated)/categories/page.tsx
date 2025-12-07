import AdminCategoriesClient from '@/components/AdminCategoriesClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Kateqoriyalar - Admin Panel',
};

export default function AdminCategoriesPage() {
    return <AdminCategoriesClient />;
}
