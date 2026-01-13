import AdminLoginClient from '@/components/AdminLoginClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin Giriş | Jobin Azərbaycan',
    description: 'Jobin Azərbaycan Admin Giriş',
};

export default function AdminLoginPage() {
    return <AdminLoginClient />;
}
