import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return; // Already installed, don't show prompt
    }

    // Check if user has already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 10 seconds
      setTimeout(() => {
        setShowPrompt(true);
      }, 10000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA quraşdırıldı');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full p-6 relative animate-in fade-in slide-in-from-bottom-4">
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <img 
              src="/icons/icon-192x192.jpg" 
              alt="Jooble Logo" 
              className="w-16 h-16 rounded-lg"
            />
          </div>

          <h2 className="text-2xl font-bold mb-2">Jooble-u Yüklə</h2>
          <p className="text-muted-foreground mb-6">
            Jooble-u cihazınıza yükləyin və tez giriş əldə edin. 
            Offline işləyir və proqram kimi açılır.
          </p>

          <div className="flex gap-3 w-full">
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="flex-1"
            >
              İndi Yox
            </Button>
            <Button
              onClick={handleInstallClick}
              className="flex-1"
            >
              Yüklə
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
