import { useState, useEffect } from 'react';
import { Briefcase, Tag, Building, Bookmark, Bell, Menu, Home, TrendingUp, Info, DollarSign, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { useSavedJobs } from '@/hooks/useSavedJobs';
import { supabase } from '@/integrations/supabase/client';
interface BottomNavigationProps {
  selectedCategory?: string;
  onCategorySelect: (category: string) => void;
}
const BottomNavigation = ({
  selectedCategory,
  onCategorySelect
}: BottomNavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [jobsCount, setJobsCount] = useState(0);
  const [companiesCount, setCompaniesCount] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const location = useLocation();
  const {
    savedJobsCount
  } = useSavedJobs();
  useEffect(() => {
    fetchCounts();
  }, []);
  const fetchCounts = async () => {
    try {
      const [jobsResult, companiesResult, categoriesResult] = await Promise.all([supabase.from('jobs').select('id', {
        count: 'exact'
      }).eq('is_active', true), supabase.from('companies').select('id', {
        count: 'exact'
      }).eq('is_active', true), supabase.from('categories').select('id', {
        count: 'exact'
      }).eq('is_active', true)]);
      setJobsCount(jobsResult.count || 0);
      setCompaniesCount(companiesResult.count || 0);
      setCategoriesCount(categoriesResult.count || 0);
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };
  const mainNavItems = [{
    icon: Briefcase,
    label: 'İşlər',
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
  const categories = [{
    name: 'Technology',
    count: 234
  }, {
    name: 'Marketing',
    count: 156
  }, {
    name: 'Finance',
    count: 189
  }, {
    name: 'Healthcare',
    count: 98
  }];
  const handleCategorySelect = (category: string) => {
    onCategorySelect(category);
    setIsMenuOpen(false);
  };
  const isActivePath = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/vacancies') return location.pathname === '/' || location.pathname === '/vacancies';
    return location.pathname.startsWith(path);
  };
  return <>
      {/* Bottom Navigation Bar */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border">
        <div className="flex items-center justify-around px-2 py-2">
          {mainNavItems.map(item => <Link key={item.label} to={item.path} className={`flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-lg transition-colors ${isActivePath(item.path) ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}>
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {item.path === '/favorites' && <Badge variant="secondary" className="absolute -top-2 -right-2 h-4 min-w-4 text-[10px] px-1 bg-primary text-white">
                    {savedJobsCount > 99 ? '99+' : savedJobsCount}
                  </Badge>}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>)}
          
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
                    {allMenuItems.filter(item => ['/services', '/about'].includes(item.path) || item.path === '/').map((item, index) => (
                      <Link 
                        key={item.path} 
                        to={item.path} 
                        className={`flex items-center justify-between p-2.5 rounded-lg transition-all duration-200 ${
                          isActivePath(item.path) 
                            ? 'bg-primary/10 text-primary border border-primary/20' 
                            : 'bg-card hover:bg-accent/80 border border-transparent'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                            isActivePath(item.path) ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                          }`}>
                            <item.icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-medium text-xs">{item.label}</span>
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
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </>;
};
export default BottomNavigation;