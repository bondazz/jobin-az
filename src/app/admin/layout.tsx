import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin Panel | Jooble Azərbaycan',
    description: 'Jooble Azərbaycan Admin Paneli',
    robots: {
        index: false,
        follow: false,
    },
};

export default function AdminRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
