import ReferralClient from '@/components/ReferralClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Referral proqramı – Qazanc əldə edin | Jooble",
    description: "Referral ilə qazanc: linkinizi paylaşın, hər təsdiqlənən elana görə 5 AZN qazanın.",
};

export default function ReferralPage() {
    return <ReferralClient />;
}
