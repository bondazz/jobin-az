"use client";

import { useState, useEffect } from 'react';
import { Briefcase, Tag, Building, Bookmark, Bell, Menu, Home, TrendingUp, Info, DollarSign, FileText, Share2, Rss, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { useSavedJobs } from '@/hooks/useSavedJobs';
import { supabase } from '@/integrations/supabase/client';
import { useReferralCode } from '@/hooks/useReferralCode';

const BottomNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [jobsCount, setJobsCount] = useState(0);
  const [companiesCount, setCompaniesCount] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const pathname = usePathname();
  const { savedJobsCount } = useSavedJobs();
  const { getUrlWithReferral } = useReferralCode();

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const [jobsResult, companiesResult, categoriesResult] = await Promise.all([
        supabase.from('jobs').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('companies').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('categories').select('id', { count: 'exact' }).eq('is_active', true)
      ]);
      setJobsCount(jobsResult.count || 0);
      setCompaniesCount(companiesResult.count || 0);
      setCategoriesCount(categoriesResult.count || 0);
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  const mainNavItems = [{
    icon: Briefcase,
    label: 'Vakansiyalar',
    count: jobsCount,
    path: '/vacancies'
  }, {
    icon: Tag,
    label: 'Kateqoriyalar',
    count: categoriesCount,
    path: '/categories'
  }, {
    icon: Building,
    label: 'Şirkətlər',
    count: companiesCount,
    path: '/companies'
  }, {
    icon: Bookmark,
    label: 'Saxlanmış',
    count: savedJobsCount,
    path: '/favorites'
  }];

  const allMenuItems = [{
    icon: Home,
    label: 'Ana Səhifə',
    path: '/',
    count: null
  }, {
    icon: Briefcase,
    label: 'İş Elanları',
    path: '/vacancies',
    count: null
  }, {
    icon: Tag,
    label: 'Kateqoriyalar',
    path: '/categories',
    count: null
  }, {
    icon: Building,
    label: 'Şirkətlər',
    path: '/companies',
    count: null
  }, {
    icon: Bookmark,
    label: 'Saxlanılan İşlər',
    path: '/favorites',
    count: savedJobsCount
  }, {
    icon: Rss,
    label: 'Abunə ol',
    path: '/subscribe',
    count: null
  }, {
    icon: BookOpen,
    label: 'Bloq',
    path: '/blog',
    count: null
  }, {
    icon: Share2,
    label: 'Referral',
    path: '/referral',
    count: null
  }, {
    icon: FileText,
    label: 'Elan yerləşdir',
    path: '/add_job',
    count: null
  }, {
    icon: Bell,
    label: 'İş Bildirişləri',
    path: '/bildirisler',
    count: null
  }, {
    icon: DollarSign,
    label: 'Qiymətlər',
    path: '/services',
    count: null
  }, {
    icon: Info,
    label: 'Haqqında',
    path: '/about',
    count: null
  }];

  const isActivePath = (path: string) => {
    if (path === '/') return pathname === '/';
    if (path === '/vacancies') return pathname === '/' || pathname === '/vacancies';
    return pathname?.startsWith(path);
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around px-2 py-2">
        {mainNavItems.map(item => (
          <Link
            key={item.label}
            href={getUrlWithReferral(item.path)}
            className={`flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-lg transition-colors ${isActivePath(item.path) ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <div className="relative">
              <item.icon className="w-5 h-5" />
              {item.path === '/favorites' && (
                <Badge variant="secondary" className="absolute -top-2 -right-2 h-4 min-w-4 text-[10px] px-1 bg-primary text-white">
                  {savedJobsCount > 99 ? '99+' : savedJobsCount}
                </Badge>
              )}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}

        {/* Menu Drawer Trigger */}
        <Drawer open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2 px-3 text-muted-foreground hover:text-foreground">
              <Menu className="w-5 h-5" />
              <span className="text-[10px] font-medium">Menyu</span>
            </Button>
          </DrawerTrigger>

          <DrawerContent className="h-auto max-h-[60vh] bg-background border border-border rounded-t-2xl shadow-2xl">
            <DrawerHeader className="pb-2 pt-3">
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto mb-2"></div>
              <DrawerTitle className="text-center text-sm font-semibold text-foreground">
                Naviqasiya
              </DrawerTitle>
            </DrawerHeader>

            <div className="px-4 pb-4 space-y-4 overflow-y-auto">
              {/* Main Navigation Items */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2 px-1">
                  Əsas Bölümlər
                </h4>
                <div className="space-y-1">
                  {allMenuItems.filter(item => ['/services', '/about', '/referral', '/add_job', '/subscribe'].includes(item.path) || item.path === '/').map((item) => (
                    <Link
                      key={item.path}
                      href={getUrlWithReferral(item.path)}
                      className={`flex items-center justify-between p-2.5 rounded-lg transition-all duration-200 ${isActivePath(item.path)
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'bg-card hover:bg-accent/80 border border-transparent'
                        }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isActivePath(item.path) ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                          }`}>
                          <item.icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium text-xs">{item.label}</span>
                        {item.path === '/add_job' && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                          </span>
                        )}
                      </div>
                      {item.count && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0.5 h-4 bg-primary/10 text-primary border-primary/30"
                        >
                          {item.count}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2 px-1">
                  Tənzimləmələr
                </h4>
                <div className="space-y-1">
                  <div className="flex items-center justify-between p-2.5 bg-card rounded-lg border border-transparent">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center">
                        <span className="text-[10px]">🌐</span>
                      </div>
                      <span className="font-medium text-xs">Dil</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 h-4">AZ</Badge>
                  </div>

              <div className="flex items-center justify-between p-2.5 bg-card rounded-lg border border-transparent">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center">
                        <span className="text-[10px]">🌙</span>
                      </div>
                      <span className="font-medium text-xs">Mövzu</span>
                    </div>
                    <ThemeToggle />
                  </div>
                </div>
              </div>

              {/* Sitemap Link for SEO */}
              <div className="pt-2 border-t border-border/40">
                <a
                  href="https://storage.Jobin.az/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-medium hover:bg-primary/20 transition-all duration-200 border border-primary/20"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Sitemap
                </a>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};

export default BottomNavigation;