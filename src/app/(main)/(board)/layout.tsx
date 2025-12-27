import HomeClient from '@/components/HomeClient';

export default function BoardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
            <HomeClient />
        </>
    );
}
