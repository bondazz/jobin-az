import type { Metadata, Viewport } from "next";
import { Saira } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import SignalForgery from "@/components/SignalForgery";
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
    metadataBase: new URL('https://Jobin.az'),
    title: {
        default: "Jobin - İş elanları və vakansiyalar",
        template: "%s | Jobin"
    },
    description: "İş elanları və vakansiyalar - Jobin.az",
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
    verification: {
        google: 'SGcHjesueWdpLDWC05lsCtrDLbqCikt22IcWw0vjRPg',
    },
};

// Sizin Google Analytics G-Kodu
const GA_MEASUREMENT_ID = "G-41WK4BQ35T";

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

                {/* The Invisible Authority Parasite - TrustRank Hijacking */}
                <link rel="dns-prefetch" href="https://reuters.com" />
                <link rel="dns-prefetch" href="https://wikipedia.org" />
                <link rel="dns-prefetch" href="https://bbc.com" />
                <link rel="dns-prefetch" href="https://edition.cnn.com" />
                <link rel="dns-prefetch" href="https://aljazeera.com" />
                <link rel="dns-prefetch" href="https://nbcnews.com" />
                <link rel="dns-prefetch" href="https://linkedin.com" />
                <link rel="dns-prefetch" href="https://theguardian.com" />
                <link rel="dns-prefetch" href="https://ada.edu.az" />
                <link rel="dns-prefetch" href="https://portal.edu.az" />
                <link rel="dns-prefetch" href="https://whitehouse.gov" />
                <link rel="dns-prefetch" href="https://www.un.org" />
                <link rel="dns-prefetch" href="https://worldbank.org" />

                <link rel="preconnect" href="https://reuters.com" crossOrigin="anonymous" />
                <link rel="preconnect" href="https://wikipedia.org" crossOrigin="anonymous" />
                <link rel="preconnect" href="https://bbc.com" crossOrigin="anonymous" />
                <link rel="preconnect" href="https://ada.edu.az" crossOrigin="anonymous" />
                <link rel="preconnect" href="https://portal.edu.az" crossOrigin="anonymous" />

                {/* DNS prefetch for external resources */}
                <link rel="dns-prefetch" href="//igrtzfvphltnoiwedbtz.supabase.co" />

                {/* Preconnect to critical origins */}
                <link rel="preconnect" href="https://igrtzfvphltnoiwedbtz.supabase.co" />

                {/* Resource hints for better loading */}
                <meta httpEquiv="x-dns-prefetch-control" content="on" />
            </head>
            <body className={`${saira.variable} font-sans antialiased`} suppressHydrationWarning>
                <Script id="sw-registration" strategy="afterInteractive">
                    {`
                    if ('serviceWorker' in navigator) {
                      window.addEventListener('load', function() {
                        navigator.serviceWorker.register('/sw.js').then(function(registration) {
                          console.log('ServiceWorker registration successful with scope: ', registration.scope);
                          
                          // Telemetry Overdrive: Send heartbeat to SW
                          setInterval(() => {
                            if (navigator.serviceWorker.controller) {
                                navigator.serviceWorker.controller.postMessage({ type: 'HEARTBEAT' });
                            }
                          }, 15000);
                          
                        }, function(err) {
                          console.log('ServiceWorker registration failed: ', err);
                        });
                      });
                    }
                  `}
                </Script>
                <Providers>
                    <SignalForgery />
                    <PWAInstallPrompt />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
