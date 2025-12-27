import type { Metadata, Viewport } from "next";
import { Saira } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
// Google Analytics üçün Script komponentini import edirik
import Script from "next/script";

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

// Sizin Google Analytics G-Kodu
const GA_MEASUREMENT_ID = "G-C0N2ELTLL8";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="az" suppressHydrationWarning>
            {/*
                Next.js-də optimallaşdırılmış skript yüklənməsi üçün <Script> istifadə edirik.
                Google Analytics kodu adətən <head> hissəsində yerləşdirilməlidir.
            */}

            {/* Google Analytics Global Site Tag (gtag.js) yükləyən Script */}
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                strategy="afterInteractive" // Səhifə ilkin yükləndikdən sonra yüklənməsi tövsiyə olunur
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
            </head>
            <body className={`${saira.variable} font-sans antialiased`} suppressHydrationWarning>
                {/* Global SEO Content for Initial Load Visibility */}
                <div className="sr-only" aria-hidden="true" id="root-level-seo-content">
                    <h1>İş Elanları və Vakansiyalar 2026</h1>
                    <p>
                        İş elanları və vakansiyalar 2026 üzrə ən son yenilikləri burada tapa bilərsiniz.
                        Platformamız bütün sahələr üzrə gündəlik yenilənən iş imkanlarını, real şirkət vakansiyalarını
                        və filtirlənə bilən peşə yönümlü elanları bir araya gətirir.
                    </p>
                </div>
                <Providers>
                    <PWAInstallPrompt />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
