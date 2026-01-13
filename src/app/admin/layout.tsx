import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin Panel | Jobin Azərbaycan',
    description: 'Jobin Azərbaycan Admin Paneli',
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
