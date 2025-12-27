import { Metadata } from 'next';

export const metadata: Metadata = {
    title: {
        absolute: "İş Elanları və Vakansiyalar 2026 | Ən Son İş İmkanları – Jooble"
    },
    description: "2026 iş elanları və vakansiyalar - minlərlə yenilənən iş imkanlarını bir yerdə tapın. Socar vakansiyalar, bakı iş elanları və sahə üzrə ən dəqiq filtrli iş axtarışı.",
    keywords: "iş elanları 2026 Azərbaycan, vakansiyalar 2026, Bakıda iş elanları, ən son iş imkanları, yeni vakansiyalar, CV ilə iş müraciəti, təcrübəçi və tələbə işləri, uzaqdan iş elanları, yüksək maaşlı vakansiyalar, is elanlari",
    alternates: {
        canonical: 'https://jooble.az',
    },
};

export default function HomePage() {
    return (
        <article id="jooble-seo-main-content-2026" role="main" className="sr-only">
            {/* SEO Content for Bots - Visible in Source Code */}
            <h1>İş Elanları və Vakansiyalar 2026</h1>
            <p>
                İş elanları və vakansiyalar 2026 üzrə ən son yenilikləri burada tapa bilərsiniz.
                Platformamız bütün sahələr üzrə gündəlik yenilənən iş imkanlarını, real şirkət vakansiyalarını
                və filtirlənə bilən peşə yönümlü elanları bir araya gətirir. Əgər yeni iş axtarırsınızsa,
                düzgün yerdəsiniz - buradan həm yerli, həm də beynəlxalq iş elanlarına rahatlıqla baxa,
                CV göndərə və dərhal müraciət edə bilərsiniz.
            </p>

            <section>
                <h2>Ən Son İş Elanları 2026</h2>
                <ul>
                    <li>Bu həftənin ən çox baxılan vakansiyaları</li>
                    <li>Şəhərlər üzrə iş elanları</li>
                    <li>Sahələr üzrə vakansiyalar</li>
                    <li>Tələbə və təcrübəçi iş elanları</li>
                    <li>Ən çox maaş təklif edən vakansiyalar</li>
                    <li>Evdən işləmək (remote) iş imkanları</li>
                </ul>
            </section>

            <p>
                2026-cı il üçün hazırlanan iş elanları və vakansiyalar siyahımız real vaxtda yenilənir.
                Hər bir elan şirkət tərəfindən təsdiqlənir və istifadəçilərə dəqiq maaş aralığı, tələblər,
                vəzifə təsviri və müraciət linki təqdim olunur. İstər ofisdaxili, istər remote iş axtarasınız?
                Burada bütün vakansiyaları rahatlıqla tapa biləcəksiniz.
            </p>
        </article>
    );
}
