import AdminSitemapClient from '@/components/AdminSitemapClient';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sitemap - Admin' };

export default function Page() {
    return <AdminSitemapClient />;
}
