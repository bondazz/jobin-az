import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { mockCategories } from '@/data/mockJobs';
import ThemeToggle from '@/components/ThemeToggle';
import { 
  Briefcase, 
  Tag, 
  Building, 
  Bookmark, 
  Bell, 
  Search,
  TrendingUp
} from 'lucide-react';

interface JobSidebarProps {
  selectedCategory?: string;
  onCategorySelect: (category: string) => void;
}

const JobSidebar = ({ selectedCategory, onCategorySelect }: JobSidebarProps) => {

  const menuItems = [
    { icon: Briefcase, label: 'Job Listings', count: 1247, active: true },
    { icon: Tag, label: 'Categories', count: 8 },
    { icon: TrendingUp, label: 'Industry', count: 12 },
    { icon: Building, label: 'Companies', count: 156 },
    { icon: Bookmark, label: 'Saved Jobs', count: 23 },
    { icon: Bell, label: 'Job Alerts', count: 5 }
  ];

  return (
    <aside className="w-56 bg-gradient-to-b from-job-sidebar to-job-sidebar/80 border-r border-border/60 flex flex-col h-full backdrop-blur-sm">
      {/* Compact Logo & Branding */}
      <div className="p-3 border-b border-border/40 bg-gradient-to-r from-job-sidebar/90 to-primary/5">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
              <Search className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-job-tag-premium rounded-full animate-pulse-slow"></div>
          </div>
          <div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              JobSearch
            </h2>
            <p className="text-xs text-muted-foreground font-medium">Dream jobs</p>
          </div>
        </div>
      </div>

      {/* Compact Navigation Menu */}
      <nav className="flex-1 p-3">
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <Button
              key={item.label}
              variant={item.active ? "default" : "ghost"}
              className={`w-full justify-between h-9 rounded-lg transition-all duration-300 animate-fade-in text-sm ${
                item.active 
                  ? 'bg-gradient-primary text-white hover:opacity-90 shadow-lg' 
                  : 'hover:bg-accent/60 hover:shadow-sm'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                  item.active ? 'bg-white/20' : 'bg-primary/10'
                }`}>
                  <item.icon className="w-3 h-3" />
                </div>
                <span className="font-medium text-xs">{item.label}</span>
              </div>
              <Badge 
                variant={item.active ? "secondary" : "outline"} 
                className={`text-xs px-1.5 py-0.5 ${
                  item.active 
                    ? 'bg-white/20 text-white border-white/30' 
                    : 'bg-primary/10 text-primary border-primary/30'
                }`}
              >
                {item.count}
              </Badge>
            </Button>
          ))}
        </div>

        <Separator className="my-4 bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Compact Categories */}
        <div>
          <h3 className="font-semibold text-xs text-foreground mb-2 px-1 flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
            Categories
          </h3>
          <div className="space-y-1">
            {mockCategories.slice(0, 5).map((category, index) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.name ? "default" : "ghost"}
                className={`w-full justify-between h-8 rounded-lg transition-all duration-300 animate-fade-in text-xs ${
                  selectedCategory === category.name
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'hover:bg-accent/60 hover:shadow-sm'
                }`}
                onClick={() => onCategorySelect(category.name)}
                style={{ animationDelay: `${(index + 6) * 50}ms` }}
              >
                <span className="font-medium text-xs">{category.name}</span>
                <Badge 
                  variant="outline" 
                  className={`text-xs px-1 py-0 ${
                    selectedCategory === category.name
                      ? 'bg-white/20 text-white border-white/30'
                      : 'bg-primary/10 text-primary border-primary/30'
                  }`}
                >
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </nav>

      {/* Compact Footer */}
      <div className="p-3 border-t border-border/40 bg-gradient-to-r from-job-sidebar/90 to-transparent">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-xs text-foreground">Theme</span>
          <ThemeToggle />
        </div>
        
        <div className="text-xs text-muted-foreground">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-1 h-1 bg-primary rounded-full"></div>
            <span className="font-medium">© 2024 JobSearch</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default JobSidebar;