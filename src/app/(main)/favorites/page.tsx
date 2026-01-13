import SavedJobsClient from '@/components/SavedJobsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Seçilmiş Elanlar | Yadda Saxlanmış Vakansiyalar - Jobin.az",
    description: "Yadda saxladığınız iş elanları və vakansiyalar. Bəyəndiyiniz iş təkliflərini bir yerdə saxlayın və asanlıqla müraciət edin.",
    keywords: "seçilmiş elanlar, yadda saxlanmış vakansiyalar, bəyənilən işlər, favoritlər, iş elanları",
    alternates: {
        canonical: "https://Jobin.az/favorites",
    },
    openGraph: {
        title: "Seçilmiş Elanlar | Yadda Saxlanmış Vakansiyalar - Jobin.az",
        description: "Yadda saxladığınız iş elanları və vakansiyalar. Bəyəndiyiniz iş təkliflərini bir yerdə saxlayın.",
        url: "https://Jobin.az/favorites",
        siteName: "Jobin.az",
        type: "website",
        images: [{ url: "https://Jobin.az/icons/icon-512x512.jpg", width: 512, height: 512 }],
    },
};

export default function FavoritesPage() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Seçilmiş Elanlar",
        "description": "Yadda saxladığınız iş elanları və vakansiyalar",
        "url": "https://Jobin.az/favorites"
    };

    const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Ana Səhifə", "item": "https://Jobin.az" },
            { "@type": "ListItem", "position": 2, "name": "Seçilmiş Elanlar", "item": "https://Jobin.az/favorites" }
        ]
    };

    return (
        <>
            <div className="sr-only" aria-hidden="true">
                <h1>Seçilmiş Elanlar - Yadda Saxlanmış Vakansiyalar</h1>
                <p>Bəyəndiyiniz iş elanlarını bu səhifədə saxlayın və istədiyiniz zaman onlara baxın.</p>
                <h2>Seçilmiş Elanlar Xüsusiyyətləri</h2>
                <ul>
                    <li>Bəyəndiyiniz vakansiyaları yadda saxlayın</li>
                    <li>İstənilən vaxt elanlarınıza baxın</li>
                    <li>Asanlıqla müraciət edin</li>
                    <li>Elanları müqayisə edin</li>
                </ul>
            </div>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
            <SavedJobsClient />
        </>
    );
}