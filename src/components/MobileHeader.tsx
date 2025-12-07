"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
        <div className="flex items-center gap-3">
          <Link href="/">
            <img
              src="/lovable-uploads/e888818f-70b8-405b-a5e8-f62f8e842525.png"
              alt="Jooble"
              width="105"
              height="27"
              className="object-contain dark:brightness-0 dark:invert"
              style={{ width: '105px', height: '27px' }}
            />
          </Link>
          <div className="seoTop__content">
            {isJobPage ? (
              <p className="text-xs text-muted-foreground">İş elanları, vakansiyalar</p>
            ) : (
              <h2 className="text-xs text-muted-foreground">İş elanları, vakansiyalar</h2>
            )}
          </div>
        </div>

        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-card hover:bg-primary hover:text-primary-foreground text-foreground border border-border transition-all duration-300 flex items-center justify-center text-xl font-semibold shadow-sm hover:shadow-md"
            style={{ transition: 'var(--transition-smooth)' }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default MobileHeader;