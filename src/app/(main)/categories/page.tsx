import CategoriesClient from '@/components/CategoriesClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "İş Elanları Kateqoriyaları | Sahələr üzrə Vakansiyalar - Jooble.az",
    description: "Azərbaycanda müxtəlif sahələr üzrə iş elanları və vakansiyalar. IT, maliyyə, marketinq, satış, tibb və digər kateqoriyalarda aktual iş təklifləri.",
    keywords: "iş elanları, vakansiyalar, kateqoriyalar, iş sahələri, Azərbaycan, iş axtarışı, karyera",
    alternates: {
        canonical: "https://jooble.az/categories",
    },
    openGraph: {
        title: "İş Elanları Kateqoriyaları | Sahələr üzrə Vakansiyalar - Jooble.az",
        description: "Azərbaycanda müxtəlif sahələr üzrə iş elanları və vakansiyalar. IT, maliyyə, marketinq, satış, tibb və digər kateqoriyalarda aktual iş təklifləri.",
        url: "https://jooble.az/categories",
        siteName: "Jooble.az",
        type: "website",
        images: [
            {
                url: "https://jooble.az/icons/icon-512x512.jpg",
                width: 512,
                height: 512,
                alt: "İş Elanları Kateqoriyaları",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "İş Elanları Kateqoriyaları | Sahələr üzrə Vakansiyalar - Jooble.az",
        description: "Azərbaycanda müxtəlif sahələr üzrə iş elanları və vakansiyalar. IT, maliyyə, marketinq, satış, tibb və digər kateqoriyalarda aktual iş təklifləri.",
        images: ["https://jooble.az/icons/icon-512x512.jpg"],
    },
};

export default function CategoriesPage() {
    return <CategoriesClient />;
}
