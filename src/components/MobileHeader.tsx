import React from 'react';
import { useNavigate } from 'react-router-dom';

interface MobileHeaderProps {
  showCloseButton?: boolean;
  onClose?: () => void;
}

const MobileHeader = ({ showCloseButton = false, onClose }: MobileHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="xl:hidden fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border p-3 flex items-center justify-between z-30">
      <button onClick={() => navigate('/')}>
        <img 
          src="/lovable-uploads/e888818f-70b8-405b-a5e8-f62f8e842525.png" 
          alt="Jooble" 
          className="w-10 h-10 object-contain dark:brightness-0 dark:invert" 
        />
      </button>
      
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-muted/50 hover:bg-destructive/20 hover:text-destructive text-muted-foreground transition-all duration-300 flex items-center justify-center text-lg font-bold"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default MobileHeader;