import MainSidebar from '@/components/MainSidebar';
import BottomNavigation from '@/components/BottomNavigation';
import { Metadata } from 'next';

interface RuLayoutProps {
    children: React.ReactNode;
}

export const metadata: Metadata = {
    alternates: {
        canonical: 'https://jooble.az/ru',
        languages: {
            'az': 'https://jooble.az',
            'en': 'https://jooble.az/en',
            'ru': 'https://jooble.az/ru',
        },
    },
};

export default function RuLayout({ children }: RuLayoutProps) {
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
