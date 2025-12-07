import AdminLayoutClient from '@/components/AdminLayoutClient';

export default function AuthenticatedAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
