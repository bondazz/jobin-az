import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Briefcase, 
  Building2, 
  Tag, 
  Settings, 
  LogOut,
  Menu,
  X,
  DollarSign,
  Megaphone
} from 'lucide-react';
import { useState } from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
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
      name: 'Tənzimləmələr',
      path: '/admin/settings',
      icon: Settings,
    },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
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
            className="h-12 w-auto object-contain"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = isActivePath(item.path);
            const Icon = item.icon;
            
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start h-12 text-left transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-lg hover:bg-primary/90' 
                    : 'hover:bg-muted/50 hover:scale-[1.02]'
                }`}
                onClick={() => navigate(item.path)}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Button>
            );
          })}
        </nav>

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
                className="h-10 w-auto object-contain"
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
            <nav className="flex-1 px-4 py-6 space-y-2">
              {menuItems.map((item) => {
                const isActive = isActivePath(item.path);
                const Icon = item.icon;
                
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start h-12 text-left transition-all duration-200 ${
                      isActive 
                        ? 'bg-primary text-primary-foreground shadow-lg' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      navigate(item.path);
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Button>
                );
              })}
            </nav>

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

export default AdminLayout;