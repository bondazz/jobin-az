
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { mockCategories } from '@/data/mockJobs';
import ThemeToggle from '@/components/ThemeToggle';
import { 
  Menu,
  Briefcase, 
  Tag, 
  Building, 
  Bookmark, 
  Bell, 
  Search,
  TrendingUp
} from 'lucide-react';

interface MobileMenuProps {
  selectedCategory?: string;
  onCategorySelect: (category: string) => void;
}

const MobileMenu = ({ selectedCategory, onCategorySelect }: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: Briefcase, label: 'Job Listings', count: 1247, active: true },
    { icon: Tag, label: 'Categories', count: 8 },
    { icon: TrendingUp, label: 'Industry', count: 12 },
    { icon: Building, label: 'Companies', count: 156 },
    { icon: Bookmark, label: 'Saved Jobs', count: 23 },
    { icon: Bell, label: 'Job Alerts', count: 5 }
  ];

  const handleCategorySelect = (category: string) => {
    onCategorySelect(category);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {/* Bu trigger artıq istifadə olunmur, çünki BottomNavigation-da menyu var */}
        <Button variant="ghost" size="sm" className="hidden p-2">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 bg-gradient-to-b from-background to-primary/5">
        <div className="flex flex-col h-full">
          {/* Compact App Header */}
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-md">
                <Search className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">JobSearch</h1>
                <p className="text-xs text-muted-foreground">Find your dream job</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {menuItems.map((item) => (
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
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {item.count}
                  </Badge>
                </Button>
              ))}
            </div>

            <Separator className="my-6" />

            {/* Categories */}
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-3 px-2">
                Popular Categories
              </h3>
              <div className="space-y-1">
                {mockCategories.slice(0, 6).map((category) => (
                  <Button
                    key={category.id}
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
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>© 2024 JobSearch</p>
              <div className="flex gap-2">
                <a href="#" className="hover:text-primary transition-colors">Help</a>
                <span>•</span>
                <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                <span>•</span>
                <a href="#" className="hover:text-primary transition-colors">Terms</a>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
