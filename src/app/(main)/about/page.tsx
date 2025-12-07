import AboutClient from '@/components/AboutClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Haqqımızda - Jooble.az",
    description: "Jooble.az haqqında ətraflı məlumat, missiyamız və təklif etdiyimiz xidmətlər.",
};

export default function AboutPage() {
    return <AboutClient />;
}
