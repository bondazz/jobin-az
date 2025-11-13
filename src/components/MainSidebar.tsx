import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import AdBanner from '@/components/AdBanner';
import { Briefcase, Tag, Building, Bookmark, Bell, TrendingUp, Info, DollarSign, Calendar, BarChart3, FileText, Share2, Rss, Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react';
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
    icon: Rss,
    label: 'Abunə ol',
    path: '/subscribe',
    count: null
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
            <a href="https://www.liveinternet.ru/click" target="_blank" rel="noopener noreferrer">
              <img id="licnt846B" width="24" height="24" style={{
              border: 0
            }} title="LiveInternet" src="https://counter.yadro.ru/logo?50.6" alt="" />
            </a>
            <script dangerouslySetInnerHTML={{
            __html: `(function(d,s){d.getElementById("licnt846B").src="https://counter.yadro.ru/hit?t50.6;r"+escape(d.referrer)+((typeof(s)=="undefined")?"":";s"+s.width+"*"+s.height+"*"+(s.colorDepth?s.colorDepth:s.pixelDepth))+";u"+escape(d.URL)+";h"+escape(d.title.substring(0,150))+";"+Math.random()})(document,screen)`
          }} />
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
        {/* Social Media Links */}
        <nav className="flex items-center justify-center gap-2 mb-3 pb-3 border-b border-border/40" aria-label="Sosial media bağlantıları">
          <a 
            href="https://wa.me/994501234567" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary flex items-center justify-center transition-all duration-300 hover:scale-110"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
          <a 
            href="https://instagram.com/jooble.az" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary flex items-center justify-center transition-all duration-300 hover:scale-110"
          >
            <Instagram className="w-4 h-4" />
          </a>
          <a 
            href="https://threads.net/@jooble.az" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Threads"
            className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary flex items-center justify-center transition-all duration-300 hover:scale-110"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.186 3.65c-.533.008-1.068.036-1.597.082-1.731.152-3.291.673-4.543 1.926C4.793 6.911 4.271 8.471 4.119 10.202c-.045.53-.073 1.065-.082 1.598-.008.533-.008 1.067 0 1.6.009.533.037 1.068.082 1.597.152 1.731.674 3.291 1.927 4.543 1.252 1.253 2.812 1.775 4.543 1.927.53.045 1.064.073 1.597.082.533.008 1.067.008 1.6 0 .533-.009 1.068-.037 1.597-.082 1.731-.152 3.291-.674 4.543-1.927 1.253-1.252 1.775-2.812 1.927-4.543.045-.53.073-1.064.082-1.597.008-.533.008-1.067 0-1.6-.009-.533-.037-1.068-.082-1.598-.152-1.731-.674-3.291-1.927-4.543-1.252-1.253-2.812-1.774-4.543-1.926-.529-.046-1.064-.074-1.597-.082-.533-.009-1.067-.009-1.6 0zm-.386 1.5c.462-.007.933-.007 1.4 0 .467.007.938.032 1.4.07 1.447.127 2.549.531 3.413 1.396.864.864 1.269 1.966 1.396 3.413.038.462.063.933.07 1.4.007.467.007.938 0 1.4-.007.462-.032.938-.07 1.4-.127 1.447-.532 2.549-1.396 3.413-.864.864-1.966 1.269-3.413 1.396-.462.038-.933.063-1.4.07-.467.007-.938.007-1.4 0-.462-.007-.938-.032-1.4-.07-1.447-.127-2.549-.532-3.413-1.396-.864-.864-1.269-1.966-1.396-3.413-.038-.462-.063-.938-.07-1.4-.007-.462-.007-.933 0-1.4.007-.467.032-.938.07-1.4.127-1.447.532-2.549 1.396-3.413.864-.864 1.966-1.269 3.413-1.396.462-.038.933-.063 1.4-.07z"/>
              <path d="M15.883 8.917c-.776-.464-1.694-.667-2.683-.667-2.3 0-3.95 1.383-4.1 3.467h1.533c.1-1.217.95-2.05 2.567-2.05.733 0 1.35.167 1.783.467.417.283.667.7.667 1.183 0 .517-.25.917-.7 1.15-.3.15-.717.25-1.283.317l-.917.1c-1.3.15-2.183.5-2.783 1.05-.683.633-1.033 1.5-1.033 2.517 0 1.05.383 1.883 1.1 2.5.717.6 1.667.9 2.817.9 1.283 0 2.333-.383 3.067-1.117.283-.283.5-.6.667-.95.033.65.15 1.15.35 1.5h1.7c-.283-.433-.45-1.117-.45-2.05V11.4c0-1.1-.417-1.983-1.2-2.483zm-.717 5.05c0 .783-.283 1.433-.817 1.917-.55.5-1.283.75-2.2.75-.667 0-1.183-.15-1.55-.45-.367-.3-.55-.7-.55-1.2 0-.55.183-.983.55-1.267.367-.3.933-.5 1.667-.6l1.333-.15c.567-.067 1.017-.183 1.35-.35.15-.067.217-.15.217-.25v1.6z"/>
            </svg>
          </a>
          <a 
            href="https://linkedin.com/company/jooble-az" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary flex items-center justify-center transition-all duration-300 hover:scale-110"
          >
            <Linkedin className="w-4 h-4" />
          </a>
          <a 
            href="https://facebook.com/jooble.az" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary flex items-center justify-center transition-all duration-300 hover:scale-110"
          >
            <Facebook className="w-4 h-4" />
          </a>
        </nav>

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
        <script dangerouslySetInnerHTML={{
        __html: `(function(d,s){d.getElementById("licnt846B").src="https://counter.yadro.ru/hit?t50.6;r"+escape(d.referrer)+((typeof(s)=="undefined")?"":";s"+s.width+"*"+s.height+"*"+(s.colorDepth?s.colorDepth:s.pixelDepth))+";u"+escape(d.URL)+";h"+escape(d.title.substring(0,150))+";"+Math.random()})(document,screen)`
      }} />
      </div>
    </aside>;
};
export default MainSidebar;