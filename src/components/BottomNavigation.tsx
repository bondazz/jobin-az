
import { useState } from 'react';
import { 
  Briefcase, 
  Tag, 
  Building, 
  Bookmark, 
  Bell,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  const mainNavItems = [
    { icon: Briefcase, label: 'İşlər', count: 1247, active: true },
    { icon: Tag, label: 'Kateqoriyalar', count: 8 },
    { icon: Building, label: 'Şirkətlər', count: 156 },
    { icon: Bookmark, label: 'Saxlanmış', count: 23 },
    { icon: Bell, label: 'Bildirişlər', count: 5 }
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

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border">
        <div className="flex items-center justify-around px-2 py-2">
          {mainNavItems.slice(0, 4).map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
                item.active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {item.count > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 h-4 min-w-4 text-[10px] px-1 bg-primary text-white"
                  >
                    {item.count > 99 ? '99+' : item.count}
                  </Badge>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Button>
          ))}
          
          {/* Menu Drawer Trigger */}
          <Drawer open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex flex-col items-center gap-1 h-auto py-2 px-3 text-muted-foreground"
              >
                <Menu className="w-5 h-5" />
                <span className="text-[10px] font-medium">Menyu</span>
              </Button>
            </DrawerTrigger>
            
            <DrawerContent className="max-h-[80vh]">
              <DrawerHeader className="text-center border-b border-border">
                <DrawerTitle className="text-xl font-bold text-primary">
                  Menyu
                </DrawerTitle>
              </DrawerHeader>
              
              <div className="p-4 space-y-6 overflow-y-auto">
                {/* All Navigation Items */}
                <div>
                  <h3 className="font-semibold text-sm text-foreground mb-3">
                    Əsas Bölümlər
                  </h3>
                  <div className="space-y-2">
                    {mainNavItems.map((item) => (
                      <Button
                        key={item.label}
                        variant={item.active ? "default" : "ghost"}
                        className={`w-full justify-between h-12 ${
                          item.active 
                            ? 'bg-gradient-primary text-white hover:opacity-90' 
                            : 'hover:bg-accent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {item.count}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="font-semibold text-sm text-foreground mb-3">
                    Populyar Kateqoriyalar
                  </h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <Button
                        key={category.name}
                        variant={selectedCategory === category.name ? "default" : "ghost"}
                        className={`w-full justify-between h-10 ${
                          selectedCategory === category.name
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                        }`}
                        onClick={() => handleCategorySelect(category.name)}
                      >
                        <span className="text-sm">{category.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {category.count}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Footer Info */}
                <div className="pt-4 border-t border-border text-center">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>© 2024 JobSearch</p>
                    <div className="flex justify-center gap-2">
                      <a href="#" className="hover:text-primary transition-colors">Kömək</a>
                      <span>•</span>
                      <a href="#" className="hover:text-primary transition-colors">Məxfilik</a>
                      <span>•</span>
                      <a href="#" className="hover:text-primary transition-colors">Şərtlər</a>
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
