import MainSidebar from '@/components/MainSidebar';
import BottomNavigation from '@/components/BottomNavigation';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen flex bg-gradient-to-br from-background via-primary/3 to-background overflow-hidden">
            {/* Sidebar - Always visible */}
            <MainSidebar />

            {/* Main content area */}
            <div className="flex-1 overflow-hidden">
                {children}
            </div>
            <BottomNavigation />
        </div>
    );
}
