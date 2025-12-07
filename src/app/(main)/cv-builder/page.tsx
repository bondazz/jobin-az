import CVBuilderClient from '@/components/CVBuilderClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "CV Builder - Peşəkar CV Hazırlayın",
    description: "Pulsuz onlayn CV düzəldən vasitəsilə peşəkar CV/Resume hazırlayın. Qeydiyyat tələb olunmur.",
    keywords: "cv builder, resume builder, pulsuz cv, peşəkar resume"
};

export default function CVBuilderPage() {
    return <CVBuilderClient />;
}
