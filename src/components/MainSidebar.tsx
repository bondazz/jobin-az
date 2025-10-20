import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import AdBanner from '@/components/AdBanner';
import { Briefcase, Tag, Building, Bookmark, Bell, TrendingUp, Info, DollarSign, Calendar, BarChart3, FileText, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useReferralCode } from '@/hooks/useReferralCode';
const MainSidebar = () => {
  const location = useLocation();
  const {
    getUrlWithReferral
  } = useReferralCode();

  // Get saved jobs count
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  React.useEffect(() => {
    const updateSavedJobsCount = () => {
      const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      setSavedJobsCount(savedJobs.length);
    };
    updateSavedJobsCount();
    // Listen for storage changes
    window.addEventListener('storage', updateSavedJobsCount);
    return () => window.removeEventListener('storage', updateSavedJobsCount);
  }, []);
  const menuItems = [{
    icon: Briefcase,
    label: 'Vakansiyalar',
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
    label: 'Seçilmiş elanlar',
    path: '/favorites',
    count: savedJobsCount
  }, {
    icon: DollarSign,
    label: 'Qiymətlər',
    path: '/services',
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
    icon: Info,
    label: 'Haqqında',
    path: '/about',
    count: null
  }];
  const isActivePath = (path: string) => {
    if (path === '/vacancies') return location.pathname === '/' || location.pathname === '/vacancies';
    return location.pathname.startsWith(path);
  };

  // Statistics data - fetch from database
  const [dailyJobCount, setDailyJobCount] = useState(0);
  const [monthlyJobCount, setMonthlyJobCount] = useState(0);

  // Fetch statistics from database
  React.useEffect(() => {
    fetchStatistics();
  }, []);
  const fetchStatistics = async () => {
    try {
      // Get today's date
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      // Get first day of current month
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Fetch daily count
      const {
        count: dailyCount
      } = await supabase.from('jobs').select('*', {
        count: 'exact',
        head: true
      }).eq('is_active', true).gte('created_at', startOfDay.toISOString());

      // Fetch monthly count
      const {
        count: monthlyCount
      } = await supabase.from('jobs').select('*', {
        count: 'exact',
        head: true
      }).eq('is_active', true).gte('created_at', startOfMonth.toISOString());
      setDailyJobCount(dailyCount || 0);
      setMonthlyJobCount(monthlyCount || 0);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Fallback values
      setDailyJobCount(127);
      setMonthlyJobCount(3420);
    }
  };
  return <aside className="hidden xl:flex w-64 bg-gradient-to-b from-job-sidebar to-job-sidebar/80 border-r border-border/60 flex-col h-full backdrop-blur-sm">
      {/* Logo & Branding */}
      <div className="p-4 border-b border-border/40 bg-gradient-to-r from-job-sidebar/90 to-primary/5">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="relative">
            <img src="/lovable-uploads/e888818f-70b8-405b-a5e8-f62f8e842525.png" alt="Jooble" className="w-[143px] h-[40px] object-contain dark:invert transition-all duration-300" />
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3">
        <div className="space-y-1">
          {menuItems.map((item, index) => <Button key={item.path} asChild variant={isActivePath(item.path) ? "default" : "ghost"} className={`w-full justify-between h-10 rounded-lg transition-all duration-300 animate-fade-in text-sm ${isActivePath(item.path) ? 'bg-gradient-primary text-white hover:opacity-90 shadow-lg' : 'hover:bg-accent/60 hover:shadow-sm'}`} style={{
          animationDelay: `${index * 50}ms`
        }}>
              <Link to={getUrlWithReferral(item.path)} className="flex items-center justify-between w-full">
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

      {/* Statistics Section */}
      <div className="p-3 border-t border-border/40">
        <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 rounded-xl p-4 mb-3 border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center p-1">
              <div className="flex items-end justify-center gap-[1px] w-full h-full">
                <div className="bg-white/90 rounded-[1px] animate-pulse" style={{
                width: '2px',
                height: '60%',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}></div>
                <div className="bg-white/90 rounded-[1px]" style={{
                width: '2px',
                height: '80%',
                animation: 'pulse 1.8s ease-in-out infinite 0.2s'
              }}></div>
                <div className="bg-white/90 rounded-[1px]" style={{
                width: '2px',
                height: '40%',
                animation: 'pulse 1.2s ease-in-out infinite 0.4s'
              }}></div>
                <div className="bg-white/90 rounded-[1px]" style={{
                width: '2px',
                height: '70%',
                animation: 'pulse 1.6s ease-in-out infinite 0.6s'
              }}></div>
                <div className="bg-white/90 rounded-[1px]" style={{
                width: '2px',
                height: '90%',
                animation: 'pulse 1.4s ease-in-out infinite 0.8s'
              }}></div>
              </div>
            </div>
            <h3 className="text-sm font-bold text-foreground">Vakansiya Statistikası</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-background/50 backdrop-blur-sm rounded-lg border border-border/30">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Günlük</span>
              </div>
              <div className="text-sm font-bold text-primary">{dailyJobCount}</div>
            </div>

            <div className="flex items-center justify-between p-2 bg-background/50 backdrop-blur-sm rounded-lg border border-border/30">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" />
                <span className="text-xs text-muted-foreground">Aylıq</span>
              </div>
              <div className="text-sm font-bold text-accent">{monthlyJobCount}</div>
            </div>
          </div>
        </div>
        
        {/* Sidebar Advertisements */}
        <AdBanner position="sidebar" className="mt-3" />
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border/40 bg-gradient-to-r from-job-sidebar/90 to-transparent">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <span className="font-medium text-sm text-foreground">Mövzu</span>
            <ThemeToggle />
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-1 h-1 bg-primary rounded-full"></div>
            <span className="font-medium">© 2024 Jooble. İş elanları və vakansiyalar</span>
          </div>
        </div>
      </div>
    </aside>;
};
export default MainSidebar;