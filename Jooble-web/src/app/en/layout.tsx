import MainSidebar from '@/components/MainSidebar';
import BottomNavigation from '@/components/BottomNavigation';
import { Metadata } from 'next';

interface EnLayoutProps {
    children: React.ReactNode;
}

export const metadata: Metadata = {
    alternates: {
        canonical: 'https://jooble.az/en',
        languages: {
            'az': 'https://jooble.az',
            'en': 'https://jooble.az/en',
            'ru': 'https://jooble.az/ru',
            'x-default': 'https://jooble.az',
        },
    },
};

export default function EnLayout({ children }: EnLayoutProps) {
    return (
        <div className="h-screen flex bg-gradient-to-br from-background via-primary/3 to-background overflow-hidden">
            <MainSidebar />
            <div className="flex-1 overflow-hidden">
                {children}
            </div>
            <BottomNavigation />
        </div>
    );
}
