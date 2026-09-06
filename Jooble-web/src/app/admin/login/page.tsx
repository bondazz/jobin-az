import AdminLoginClient from '@/components/AdminLoginClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin Giriş | Jooble Azərbaycan',
    description: 'Jooble Azərbaycan Admin Giriş',
};

export default function AdminLoginPage() {
    return <AdminLoginClient />;
}
