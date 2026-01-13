"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle } from 'lucide-react';
import Logo from '@/components/Logo';

interface MobileHeaderProps {
  showCloseButton?: boolean;
  onClose?: () => void;
  isJobPage?: boolean;
}

const MobileHeader = ({ showCloseButton = false, onClose, isJobPage = false }: MobileHeaderProps) => {
  const router = useRouter();

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border p-3 z-30">
      <div className="flex items-center justify-between">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/';
          }}
        >
          <Logo />
        </a>

        <div className="flex items-center gap-2">
          {showCloseButton && onClose ? (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-card hover:bg-primary hover:text-primary-foreground text-foreground border border-border transition-all duration-300 flex items-center justify-center text-xl font-semibold shadow-sm hover:shadow-md"
            >
              ×
            </button>
          ) : (
            <a
              href="/add_job"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/add_job';
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40 transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Elan yerləşdir</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;