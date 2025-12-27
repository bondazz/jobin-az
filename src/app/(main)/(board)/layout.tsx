import HomeClient from '@/components/HomeClient';

export default function BoardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <HomeClient />
            <div className="sr-only">{children}</div>
        </>
    );
}
