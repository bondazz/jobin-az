import CompaniesClient from '@/components/CompaniesClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Şirkətlər və İş Elanları 2026 - Vakansiyalar və İşə Qəbul Platforması",
    description: "2026 şirkət vakansiyaları və iş elanları: minlərlə şirkətin yenilənən iş imkanları, baki is elanlari, maaş məlumatları və işə qəbul prosesləri.",
    alternates: {
        canonical: 'https://jooble.az/companies',
    },
};

export default function CompaniesPage() {
    return <CompaniesClient />;
}
