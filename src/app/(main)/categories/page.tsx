import CategoriesClient from '@/components/CategoriesClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Kateqoriyalar | İş Elanları Azərbaycan - Jooble",
    description: "Müxtəlif kateqoriyalar üzrə iş elanları və vakansiyalar.",
};

export default function CategoriesPage() {
    return <CategoriesClient />;
}
