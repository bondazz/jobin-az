import BlogClient from '@/components/BlogClient';

export default function BlogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <BlogClient />
            {children}
        </>
    );
}
