import AdminAdvertisementsClient from '@/components/AdminAdvertisementsClient';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Reklamlar - Admin' };

export default function Page() {
    return <AdminAdvertisementsClient />;
}
