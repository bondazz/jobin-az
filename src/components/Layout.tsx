
import React, { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import MainSidebar from '@/components/MainSidebar';
import AdBanner from '@/components/AdBanner';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

interface LayoutProps {
  children?: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="h-screen flex bg-gradient-to-br from-background via-primary/3 to-background overflow-hidden">
      <Toaster />
      <Sonner />
      
      {/* Sidebar - Always visible */}
      <MainSidebar />
      
      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        {children || <Outlet />}
      </div>
    </div>
  );
};

export default Layout;
