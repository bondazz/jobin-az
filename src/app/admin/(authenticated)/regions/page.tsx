import AdminRegionsClient from '@/components/AdminRegionsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Regionlar - Admin Panel',
};

export default function AdminRegionsPage() {
    return <AdminRegionsClient />;
}
