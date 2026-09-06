import AdminCompaniesClient from '@/components/AdminCompaniesClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Şirkətlər - Admin Panel',
};

export default function AdminCompaniesPage() {
    return <AdminCompaniesClient />;
}
