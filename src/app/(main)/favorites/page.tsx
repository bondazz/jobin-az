import SavedJobsClient from '@/components/SavedJobsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Seçilmiş Elanlar | Jooble",
    description: "Yadda saxladığınız iş elanları.",
};

export default function FavoritesPage() {
    return <SavedJobsClient />;
}
