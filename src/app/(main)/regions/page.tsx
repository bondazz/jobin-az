import RegionsClient from '@/components/RegionsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Regionlar üzrə İş Elanları | Azərbaycan Vakansiyaları - Jooble.az",
    description: "Azərbaycanın müxtəlif regionlarında iş elanları və vakansiyalar. Bakı, Sumqayıt, Gəncə və digər şəhərlərdə aktual iş təklifləri.",
    keywords: "regionlar, iş elanları, vakansiyalar, Bakı, Sumqayıt, Gəncə, Azərbaycan, iş axtarışı",
    alternates: {
        canonical: "https://jooble.az/regions",
    },
    openGraph: {
        title: "Regionlar üzrə İş Elanları | Azərbaycan Vakansiyaları - Jooble.az",
        description: "Azərbaycanın müxtəlif regionlarında iş elanları və vakansiyalar. Bakı, Sumqayıt, Gəncə və digər şəhərlərdə aktual iş təklifləri.",
        url: "https://jooble.az/regions",
        siteName: "Jooble.az",
        type: "website",
        images: [
            {
                url: "https://jooble.az/icons/icon-512x512.jpg",
                width: 512,
                height: 512,
                alt: "Regionlar üzrə İş Elanları",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Regionlar üzrə İş Elanları | Azərbaycan Vakansiyaları - Jooble.az",
        description: "Azərbaycanın müxtəlif regionlarında iş elanları və vakansiyalar. Bakı, Sumqayıt, Gəncə və digər şəhərlərdə aktual iş təklifləri.",
        images: ["https://jooble.az/icons/icon-512x512.jpg"],
    },
};

export default function RegionsPage() {
    return <RegionsClient />;
}
