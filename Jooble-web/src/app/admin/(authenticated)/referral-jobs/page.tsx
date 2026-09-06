import AdminReferralJobsClient from '@/components/AdminReferralJobsClient';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Referral Vakansiyaları - Admin' };

export default function Page() {
    return <AdminReferralJobsClient />;
}
