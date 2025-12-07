import ServicesClient from '@/components/ServicesClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Xidmətlər və Qiymətlər | Jooble",
    description: "İş elanları yerləşdirmək və reklam xidmətləri haqqında məlumat.",
};

export default function ServicesPage() {
    return <ServicesClient />;
}
