import type { Metadata, Viewport } from "next";
import { Saira } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

const saira = Saira({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    variable: "--font-saira",
});

export const viewport: Viewport = {
    themeColor: "#1a1a1a",
    width: "device-width",
    initialScale: 1,
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

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="az" suppressHydrationWarning>
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
                <Providers>
                    <PWAInstallPrompt />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
