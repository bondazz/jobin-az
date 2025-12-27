import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Vakansiyalar | İş Elanları Azərbaycan - Jooble",
    description: "Azərbaycanda aktiv vakansiyalar və iş elanları. Müxtəlif sahələrdə iş imkanları, maaş məlumatları və şirkət təfərrüatları.",
    keywords: "vakansiyalar, iş elanları, Azərbaycan işləri, aktiv elanlar, iş axtarışı",
    alternates: {
        canonical: '/vacancies',
    },
};

import SEOBreadcrumb from '@/components/SEOBreadcrumb';

export default function VacanciesPage() {
    return (
        <article className="sr-only">
            <SEOBreadcrumb
                items={[
                    { label: "Vakansiyalar" }
                ]}
                visuallyHidden={true}
            />
            <h1>Vakansiyalar və İş Elanları Azərbaycan</h1>
            <p>
                Azərbaycanda son vakansiyalar və iş elanları. Hər gün yeni və aktiv vakansiya elanları əlavə olunur.
                İş axtaranların ən son iş imkanlarına müraciət edə bilər. Uyğun iş tapmaq üçün CV nizi yükləyin və
                iş elanları və vakansiyalara müraciət edin. Müxtəlif sahələrdə iş imkanları ilə.
            </p>
            <h2>Ən Son İş Elanları 2026</h2>
            <p>
                Platformamızda 2026-cı il üçün ən aktual vakansiyalar toplanmışdır.
                Siz burada müxtəlif sahələr üzrə iş elanlarını tapa və birbaşa müraciət edə bilərsiniz.
            </p>
        </article>
    );
}
