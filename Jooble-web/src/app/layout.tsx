import type { Metadata, Viewport } from "next";
import { Saira } from "next/font/google";
// @ts-ignore - CSS import
import "./globals.css";
import { Providers } from "@/components/Providers";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import Script from "next/script";
import { headers } from 'next/headers';
import { Locale, i18nConfig } from '@/lib/i18n/config';

const saira = Saira({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    variable: "--font-saira",
});

export const viewport: Viewport = {
    themeColor: "#1a1a1a",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export const metadata: Metadata = {
    metadataBase: new URL('https://jooble.az'),
    title: {
        default: "Jooble - İş elanları və vakansiyalar",
        template: "%s | Jooble"
    },
    description: "İş elanları və vakansiyalar - Jooble.az",
    manifest: "/manifest.json",
    alternates: {
        canonical: '/',
        languages: {
            'az': 'https://jooble.az',
            'en': 'https://jooble.az/en',
            'ru': 'https://jooble.az/ru',
        },
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

// Google Analytics G-Kodu
const GA_MEASUREMENT_ID = "G-C0N2ELTLL8"; 

// Get locale from headers (set by middleware)
function getLocale(): Locale {
    try {
        const headersList = headers();
        const locale = headersList.get('x-locale') as Locale;
        return locale && i18nConfig.locales.includes(locale) ? locale : i18nConfig.defaultLocale;
    } catch {
        return i18nConfig.defaultLocale;
    }
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const locale = getLocale();
    
    // Determine html lang attribute based on locale
    const htmlLang = locale === 'en' ? 'en' : locale === 'ru' ? 'ru' : 'az';

    return (
        <html lang={htmlLang} suppressHydrationWarning>
            {/* Google Analytics Global Site Tag (gtag.js) */}
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                strategy="afterInteractive"
            />
            
            {/* Google Analytics konfiqurasiya skripti */}
            <Script id="google-analytics-init" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${GA_MEASUREMENT_ID}');
                `}
            </Script>

            <head>
                <link rel="icon" href="/favicon.ico" sizes="32x32" />
                <link rel="icon" href="/favicon.ico" type="image/png" sizes="any" />
                {/* DNS prefetch for external resources */}
                <link rel="dns-prefetch" href="//igrtzfvphltnoiwedbtz.supabase.co" />

                {/* Preconnect to critical origins */}
                <link rel="preconnect" href="https://igrtzfvphltnoiwedbtz.supabase.co" />

                {/* Resource hints for better loading */}
                <meta httpEquiv="x-dns-prefetch-control" content="on" />
                
                {/* hreflang tags for SEO */}
                <link rel="alternate" hrefLang="az" href="https://jooble.az" />
                <link rel="alternate" hrefLang="en" href="https://jooble.az/en" />
                <link rel="alternate" hrefLang="ru" href="https://jooble.az/ru" />
                <link rel="alternate" hrefLang="x-default" href="https://jooble.az" />
            </head>
            <body className={`${saira.variable} font-sans antialiased`} suppressHydrationWarning>
                <Providers locale={locale}>
                    <PWAInstallPrompt />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
