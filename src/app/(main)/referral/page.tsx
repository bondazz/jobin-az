import ReferralClient from '@/components/ReferralClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Referral Proqramı – Qazanc Əldə Edin | Jooble.az",
    description: "Referral ilə qazanc: linkinizi paylaşın, hər təsdiqlənən elana görə 5 AZN qazanın. Dostlarınızı dəvət edin və pul qazanın.",
    keywords: "referral proqramı, qazanc, pul qazanmaq, dostları dəvət, 5 AZN, partner proqramı, affiliate",
    alternates: {
        canonical: "https://jooble.az/referral",
    },
    openGraph: {
        title: "Referral Proqramı – Qazanc Əldə Edin | Jooble.az",
        description: "Referral ilə qazanc: linkinizi paylaşın, hər təsdiqlənən elana görə 5 AZN qazanın.",
        url: "https://jooble.az/referral",
        siteName: "Jooble.az",
        type: "website",
        images: [{ url: "https://jooble.az/icons/icon-512x512.jpg", width: 512, height: 512 }],
    },
};

export default function ReferralPage() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Referral Proqramı",
        "description": "Linkinizi paylaşın və hər təsdiqlənən elana görə 5 AZN qazanın",
        "url": "https://jooble.az/referral"
    };

    const faqData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Referral proqramı nədir?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Referral proqramı sizə xüsusi linkinizi paylaşaraq qazanc əldə etmək imkanı verir. Linkiniz vasitəsilə yerləşdirilən hər iş elanı üçün 5 AZN qazanırsınız."
                }
            },
            {
                "@type": "Question",
                "name": "Necə qoşula bilərəm?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Hesabınıza daxil olun və referral bölməsindən xüsusi linkinizi əldə edin. Linki dostlarınız və tanışlarınızla paylaşın."
                }
            },
            {
                "@type": "Question",
                "name": "Qazancımı necə çıxara bilərəm?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Minimum 20 AZN qazanc əldə etdikdən sonra M10 və ya bank kartı vasitəsilə çıxarış edə bilərsiniz."
                }
            }
        ]
    };

    const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Ana Səhifə", "item": "https://jooble.az" },
            { "@type": "ListItem", "position": 2, "name": "Referral Proqramı", "item": "https://jooble.az/referral" }
        ]
    };

    return (
        <>
            <div className="sr-only" aria-hidden="true">
                <h1>Referral Proqramı – Qazanc Əldə Edin</h1>
                <p>Linkinizi paylaşın və hər təsdiqlənən elana görə 5 AZN qazanın.</p>
                
                <h2>Necə İşləyir?</h2>
                <ol>
                    <li>Hesabınıza daxil olun və xüsusi referral linkinizi əldə edin</li>
                    <li>Linki şirkətlər və işəgötürənlərlə paylaşın</li>
                    <li>Linkiniz vasitəsilə iş elanı yerləşdirilsin</li>
                    <li>Elan təsdiqlənən kimi 5 AZN qazanın</li>
                </ol>
                
                <h2>Qazanc Şərtləri</h2>
                <ul>
                    <li>Hər təsdiqlənən elan üçün 5 AZN</li>
                    <li>Minimum çıxarış məbləği: 20 AZN</li>
                    <li>M10 və ya bank kartına köçürmə</li>
                    <li>Limitsiz qazanc imkanı</li>
                </ul>
                
                <h2>Tez-tez Verilən Suallar</h2>
                <dl>
                    <dt>Referral proqramı nədir?</dt>
                    <dd>Referral proqramı sizə xüsusi linkinizi paylaşaraq qazanc əldə etmək imkanı verir.</dd>
                    
                    <dt>Necə qoşula bilərəm?</dt>
                    <dd>Hesabınıza daxil olun və referral bölməsindən xüsusi linkinizi əldə edin.</dd>
                    
                    <dt>Qazancımı necə çıxara bilərəm?</dt>
                    <dd>Minimum 20 AZN qazanc əldə etdikdən sonra M10 və ya bank kartı vasitəsilə çıxarış edə bilərsiniz.</dd>
                </dl>
            </div>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
            <ReferralClient />
        </>
    );
}