
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ThemeToggle from '@/components/ThemeToggle';
import { Briefcase, Tag, Building, Bookmark, Bell, Search, TrendingUp, Info, DollarSign, Users, Home } from 'lucide-react';

const MainSidebar = () => {
  const location = useLocation();
  const menuItems = [{
    icon: Home,
    label: 'Ana Səhifə',
    path: '/',
    count: null
  }, {
    icon: Briefcase,
    label: 'İş Elanları',
    path: '/jobs',
    count: 1247
  }, {
    icon: Tag,
    label: 'Kateqoriyalar',
    path: '/categories',
    count: 8
  }, {
    icon: TrendingUp,
    label: 'Sənaye',
    path: '/industry',
    count: 12
  }, {
    icon: Building,
    label: 'Şirkətlər',
    path: '/companies',
    count: 156
  }, {
    icon: Bookmark,
    label: 'Saxlanılan İşlər',
    path: '/saved',
    count: 23
  }, {
    icon: Bell,
    label: 'İş Bildirişləri',
    path: '/alerts',
    count: 5
  }, {
    icon: DollarSign,
    label: 'Qiymətlər',
    path: '/pricing',
    count: null
  }, {
    icon: Info,
    label: 'Haqqında',
    path: '/about',
    count: null
  }];
  const isActivePath = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };
  return <aside className="hidden xl:flex w-64 bg-gradient-to-b from-job-sidebar to-job-sidebar/80 border-r border-border/60 flex-col h-full backdrop-blur-sm">
      {/* Logo & Branding */}
      <div className="p-4 border-b border-border/40 bg-gradient-to-r from-job-sidebar/90 to-primary/5">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="relative">
            <img 
              src="/lovable-uploads/e888818f-70b8-405b-a5e8-f62f8e842525.png" 
              alt="Jooble" 
              className="w-[143px] h-[40px] object-contain dark:invert transition-all duration-300" 
            />
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3">
        <div className="space-y-1">
          {menuItems.map((item, index) => <Button key={item.path} asChild variant={isActivePath(item.path) ? "default" : "ghost"} className={`w-full justify-between h-10 rounded-lg transition-all duration-300 animate-fade-in text-sm ${isActivePath(item.path) ? 'bg-gradient-primary text-white hover:opacity-90 shadow-lg' : 'hover:bg-accent/60 hover:shadow-sm'}`} style={{
          animationDelay: `${index * 50}ms`
        }}>
              <Link to={item.path} className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center ${isActivePath(item.path) ? 'bg-white/20' : 'bg-primary/10'}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {item.count && <Badge variant={isActivePath(item.path) ? "secondary" : "outline"} className={`text-xs px-2 py-0.5 ${isActivePath(item.path) ? 'bg-white/20 text-white border-white/30' : 'bg-primary/10 text-primary border-primary/30'}`}>
                    {item.count}
                  </Badge>}
              </Link>
            </Button>)}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border/40 bg-gradient-to-r from-job-sidebar/90 to-transparent">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-sm text-foreground">Mövzu</span>
          <ThemeToggle />
        </div>
        
        <div className="text-xs text-muted-foreground">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-1 h-1 bg-primary rounded-full"></div>
            <span className="font-medium">© 2024 Jooble</span>
          </div>
        </div>
      </div>
    </aside>;
};

export default MainSidebar;
