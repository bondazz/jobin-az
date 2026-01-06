"use client";

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Home,
    Briefcase,
    Building2,
    Tag,
    MapPin,
    Settings,
    LogOut,
    Menu,
    X,
    DollarSign,
    Megaphone,
    Globe,
    Bell,
    FileText,
    BookOpen
} from 'lucide-react';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayoutClient = ({ children }: AdminLayoutProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    const menuItems = [
        {
            name: 'İdarə Paneli',
            path: '/admin/dashboard',
            icon: Home,
        },
        {
            name: 'Vakansiyalar',
            path: '/admin/jobs',
            icon: Briefcase,
        },
        {
            name: 'Şirkətlər',
            path: '/admin/companies',
            icon: Building2,
        },
        {
            name: 'Kateqoriyalar',
            path: '/admin/categories',
            icon: Tag,
        },
        {
            name: 'Regionlar',
            path: '/admin/regions',
            icon: MapPin,
        },
        {
            name: 'Qiymətlər',
            path: '/admin/pricing',
            icon: DollarSign,
        },
        {
            name: 'Reklamlar',
            path: '/admin/advertisements',
            icon: Megaphone,
        },
        {
            name: 'Push Bildirişlər',
            path: '/admin/notifications',
            icon: Bell,
        },
        {
            name: 'Google İndeksləmə',
            path: '/admin/google-indexing',
            icon: Globe,
        },
        {
            name: 'SEO Səhifələr',
            path: '/admin/custom-pages',
            icon: FileText,
        },
        {
            name: 'Bloqlar',
            path: '/admin/blogs',
            icon: BookOpen,
        },
        {
            name: 'Tənzimləmələr',
            path: '/admin/settings',
            icon: Settings,
        },
    ];

    const isActivePath = (path: string) => {
        return pathname === path;
    };

    return (
        <div className="h-screen flex bg-gradient-to-br from-background via-primary/3 to-background overflow-hidden">
            {/* Sidebar for desktop */}
            <div className="hidden lg:flex lg:flex-col lg:w-72 lg:border-r lg:border-border lg:bg-gradient-to-b lg:from-card lg:to-card/50 lg:shadow-xl">
                {/* Logo Section */}
                <div className="flex items-center justify-center py-6 px-6 border-b border-border/50">
                    <img
                        src="/lovable-uploads/e888818f-70b8-405b-a5e8-f62f8e842525.png"
                        alt="Logo"
                        className="h-12 w-auto object-contain dark:brightness-0 dark:invert"
                        width="170"
                        height="48"
                    />
                </div>

                {/* Navigation */}
                <ScrollArea className="flex-1 px-4 py-3">
                    <nav className="space-y-1">
                        {menuItems.map((item) => {
                            const isActive = isActivePath(item.path);
                            const Icon = item.icon;

                            return (
                                <Button
                                    key={item.path}
                                    variant={isActive ? "default" : "ghost"}
                                    className={`w-full justify-start h-10 text-left transition-all duration-200 ${isActive
                                        ? 'bg-primary text-primary-foreground shadow-lg hover:bg-primary/90'
                                        : 'hover:bg-muted/50 hover:scale-[1.02]'
                                        }`}
                                    onClick={() => router.push(item.path)}
                                >
                                    <Icon className="mr-3 h-4 w-4" />
                                    {item.name}
                                </Button>
                            );
                        })}

                        {/* Referral submenu */}
                        <div className="pt-1">
                            <Button
                                variant={pathname.startsWith('/admin/referral') || pathname.startsWith('/admin/withdrawal') ? 'default' : 'ghost'}
                                className="w-full justify-start h-10 text-left"
                                onClick={() => { /* visual group only */ }}
                            >
                                <span className="mr-3 h-4 w-4">🤝</span>
                                Referral
                            </Button>
                            <div className="pl-6 mt-1 space-y-1">
                                <Button
                                    variant={isActivePath('/admin/referrals') ? 'default' : 'ghost'}
                                    className="w-full justify-start h-9 text-sm"
                                    onClick={() => router.push('/admin/referrals')}
                                >
                                    Referrallar
                                </Button>
                                <Button
                                    variant={isActivePath('/admin/withdrawals') ? 'default' : 'ghost'}
                                    className="w-full justify-start h-9 text-sm"
                                    onClick={() => router.push('/admin/withdrawals')}
                                >
                                    Çıxarışlar
                                </Button>
                                <Button
                                    variant={isActivePath('/admin/referral-jobs') ? 'default' : 'ghost'}
                                    className="w-full justify-start h-9 text-sm"
                                    onClick={() => router.push('/admin/referral-jobs')}
                                >
                                    Elan müraciətləri
                                </Button>
                            </div>
                        </div>
                    </nav>
                </ScrollArea>

                {/* Logout Section */}
                <div className="p-4 border-t border-border/50">
                    <Button
                        variant="outline"
                        className="w-full justify-start h-12 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Çıxış
                    </Button>
                </div>
            </div>

            {/* Mobile sidebar */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
                    <div className="fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-card to-card/50 shadow-xl border-r border-border">
                        {/* Close button */}
                        <div className="flex items-center justify-between p-4 border-b border-border/50">
                            <img
                                src="/lovable-uploads/e888818f-70b8-405b-a5e8-f62f8e842525.png"
                                alt="Logo"
                                className="h-10 w-auto object-contain dark:brightness-0 dark:invert"
                                width="143"
                                height="40"
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Navigation */}
                        <ScrollArea className="flex-1 px-4 py-3">
                            <nav className="space-y-1">
                                {menuItems.map((item) => {
                                    const isActive = isActivePath(item.path);
                                    const Icon = item.icon;

                                    return (
                                        <Button
                                            key={item.path}
                                            variant={isActive ? "default" : "ghost"}
                                            className={`w-full justify-start h-10 text-left transition-all duration-200 ${isActive
                                                ? 'bg-primary text-primary-foreground shadow-lg'
                                                : 'hover:bg-muted/50'
                                                }`}
                                            onClick={() => {
                                                router.push(item.path);
                                                setSidebarOpen(false);
                                            }}
                                        >
                                            <Icon className="mr-3 h-4 w-4" />
                                            {item.name}
                                        </Button>
                                    );
                                })}

                                {/* Referral submenu */}
                                <div className="pt-1">
                                    <Button
                                        variant={pathname.startsWith('/admin/referral') || pathname.startsWith('/admin/withdrawal') ? 'default' : 'ghost'}
                                        className="w-full justify-start h-10 text-left"
                                        onClick={() => { /* visual group only */ }}
                                    >
                                        <span className="mr-3 h-4 w-4">🤝</span>
                                        Referral
                                    </Button>
                                    <div className="pl-6 mt-1 space-y-1">
                                        <Button
                                            variant={isActivePath('/admin/referrals') ? 'default' : 'ghost'}
                                            className="w-full justify-start h-9 text-sm"
                                            onClick={() => { router.push('/admin/referrals'); setSidebarOpen(false); }}
                                        >
                                            Referrallar
                                        </Button>
                                        <Button
                                            variant={isActivePath('/admin/withdrawals') ? 'default' : 'ghost'}
                                            className="w-full justify-start h-9 text-sm"
                                            onClick={() => { router.push('/admin/withdrawals'); setSidebarOpen(false); }}
                                        >
                                            Çıxarışlar
                                        </Button>
                                        <Button
                                            variant={isActivePath('/admin/referral-jobs') ? 'default' : 'ghost'}
                                            className="w-full justify-start h-9 text-sm"
                                            onClick={() => { router.push('/admin/referral-jobs'); setSidebarOpen(false); }}
                                        >
                                            Elan müraciətləri
                                        </Button>
                                    </div>
                                </div>
                            </nav>
                        </ScrollArea>

                        {/* Logout Section */}
                        <div className="p-4 border-t border-border/50">
                            <Button
                                variant="outline"
                                className="w-full justify-start h-12 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-3 h-5 w-5" />
                                Çıxış
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile header */}
                <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card shadow-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-semibold">Admin Panel</h1>
                    <div className="w-9" /> {/* Spacer for centering */}
                </div>

                {/* Page content */}
                <div className="flex-1 overflow-auto bg-gradient-to-br from-background via-primary/3 to-background">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AdminLayoutClient;
