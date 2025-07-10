
import { useState } from 'react';
import { 
  Briefcase, 
  Tag, 
  Building, 
  Bookmark, 
  Bell,
  Menu,
  Home,
  TrendingUp,
  Info,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

interface BottomNavigationProps {
  selectedCategory?: string;
  onCategorySelect: (category: string) => void;
}

const BottomNavigation = ({ selectedCategory, onCategorySelect }: BottomNavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const mainNavItems = [
    { icon: Briefcase, label: 'İşlər', count: 1247, path: '/jobs' },
    { icon: Tag, label: 'Kateqoriyalar', count: 8, path: '/categories' },
    { icon: Building, label: 'Şirkətlər', count: 156, path: '/companies' },
    { icon: Bookmark, label: 'Saxlanmış', count: 23, path: '/saved' }
  ];

  const allMenuItems = [
    { icon: Home, label: 'Ana Səhifə', path: '/', count: null },
    { icon: Briefcase, label: 'İş Elanları', path: '/jobs', count: null },
    { icon: Tag, label: 'Kateqoriyalar', path: '/categories', count: null },
    { icon: TrendingUp, label: 'Sənaye', path: '/industry', count: null },
    { icon: Building, label: 'Şirkətlər', path: '/companies', count: null },
    { icon: Bookmark, label: 'Saxlanılan İşlər', path: '/saved', count: 23 },
    { icon: Bell, label: 'İş Bildirişləri', path: '/alerts', count: null },
    { icon: DollarSign, label: 'Qiymətlər', path: '/pricing', count: null },
    { icon: Info, label: 'Haqqında', path: '/about', count: null }
  ];

  const categories = [
    { name: 'Technology', count: 234 },
    { name: 'Marketing', count: 156 },
    { name: 'Finance', count: 189 },
    { name: 'Healthcare', count: 98 },
    { name: 'Education', count: 87 },
    { name: 'Design', count: 145 }
  ];

  const handleCategorySelect = (category: string) => {
    onCategorySelect(category);
    setIsMenuOpen(false);
  };

  const isActivePath = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border">
        <div className="flex items-center justify-around px-2 py-2">
          {mainNavItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-lg transition-colors ${
                isActivePath(item.path) ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {item.path === '/saved' && item.count > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 h-4 min-w-4 text-[10px] px-1 bg-primary text-white"
                  >
                    {item.count > 99 ? '99+' : item.count}
                  </Badge>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
          
          {/* Menu Drawer Trigger */}
          <Drawer open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex flex-col items-center gap-1 h-auto py-2 px-3 text-muted-foreground hover:text-foreground"
              >
                <Menu className="w-5 h-5" />
                <span className="text-[10px] font-medium">Menyu</span>
              </Button>
            </DrawerTrigger>
            
            <DrawerContent className="max-h-[70vh] bg-gradient-to-b from-background to-primary/5 z-40">
              <DrawerHeader className="text-center border-b border-border/40 bg-gradient-to-r from-background to-primary/10 pb-3">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <img 
                    src="/lovable-uploads/e888818f-70b8-405b-a5e8-f62f8e842525.png" 
                    alt="Jooble" 
                    className="w-10 h-10 object-contain dark:invert transition-all duration-300" 
                  />
                </div>
                <p className="text-sm text-muted-foreground">İş axtarışınızı asanlaşdırın</p>
              </DrawerHeader>
              
              <div className="p-4 space-y-6 overflow-y-auto">
                {/* All Navigation Items */}
                <div>
                  <h3 className="font-bold text-base text-foreground mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Əsas Bölümlər
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {allMenuItems.map((item, index) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 animate-fade-in shadow-sm ${
                          isActivePath(item.path)
                            ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30' 
                            : 'bg-card hover:bg-accent/60 border border-border/40'
                        }`}
                        style={{ animationDelay: `${index * 30}ms` }}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isActivePath(item.path) ? 'bg-primary/20' : 'bg-primary/10'
                          }`}>
                            <item.icon className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-sm">{item.label}</span>
                        </div>
                        {item.count && (
                          <Badge 
                            variant={isActivePath(item.path) ? "default" : "outline"} 
                            className={`text-xs px-2 py-0.5 ${
                              isActivePath(item.path) 
                                ? 'bg-primary text-white' 
                                : 'bg-primary/10 text-primary border-primary/30'
                            }`}
                          >
                            {item.count}
                          </Badge>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="font-bold text-base text-foreground mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Populyar Kateqoriyalar
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category, index) => (
                      <Button
                        key={category.name}
                        variant={selectedCategory === category.name ? "default" : "outline"}
                        className={`h-auto p-3 flex flex-col items-center gap-1 transition-all duration-300 animate-fade-in ${
                          selectedCategory === category.name
                            ? 'bg-primary text-white border-primary'
                            : 'bg-card hover:bg-accent border-border/40'
                        }`}
                        onClick={() => handleCategorySelect(category.name)}
                        style={{ animationDelay: `${(index + allMenuItems.length) * 30}ms` }}
                      >
                        <span className="font-medium text-xs">{category.name}</span>
                        <Badge 
                          variant="secondary" 
                          className={`text-[10px] px-1.5 py-0.5 ${
                            selectedCategory === category.name
                              ? 'bg-white/20 text-white'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {category.count}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Theme Toggle & Footer */}
                <div className="pt-4 border-t border-border/40">
                  <div className="flex items-center justify-between mb-4 p-3 bg-card rounded-lg border border-border/40">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-xs">🌙</span>
                      </div>
                      <span className="font-medium text-sm text-foreground">Mövzu</span>
                    </div>
                    <ThemeToggle />
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                      <img 
                        src="/lovable-uploads/e888818f-70b8-405b-a5e8-f62f8e842525.png" 
                        alt="Jooble" 
                        className="w-4 h-4 object-contain dark:invert" 
                      />
                      <span className="font-medium">© 2024 Jooble</span>
                    </div>
                    <div className="flex justify-center gap-4 text-xs">
                      <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Kömək</a>
                      <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Məxfilik</a>
                      <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Şərtlər</a>
                    </div>
                  </div>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </>
  );
};

export default BottomNavigation;
