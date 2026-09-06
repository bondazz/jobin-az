"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, ExternalLink } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [inIframe, setInIframe] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    // All browser-specific checks safely inside useEffect
    if (typeof window === 'undefined') return;

    const userAgent = navigator.userAgent;
    const iosCheck = /iphone|ipad|ipod/i.test(userAgent);
    const androidCheck = /android/i.test(userAgent);

    setIsIOS(iosCheck);
    setIsAndroid(androidCheck);
    setIsDesktop(!iosCheck && !androidCheck);
    setInIframe(window.self !== window.top);
    setCurrentUrl(window.location.href);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;

    if (isStandalone || localStorage.getItem('pwa-installed') === 'true') {
      setInstalled(true);
      return;
    }

    if (localStorage.getItem('pwa-install-dismissed')) {
      return;
    }

    // Show prompt after 30 seconds
    const timer = window.setTimeout(() => setShowPrompt(true), 30000);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setShowPrompt(false);
      localStorage.setItem('pwa-installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
      localStorage.setItem('pwa-installed', 'true');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt || installed) return null;

  const canInstall = !!deferredPrompt && !inIframe;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full p-6 relative animate-in fade-in slide-in-from-bottom-4">
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Bağla"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <img
              src="/icons/icon-192x192.jpg"
              alt="Jooble logo - PWA ikon"
              width="64"
              height="64"
              className="w-16 h-16 rounded-lg"
            />
          </div>

          <h2 className="text-2xl font-bold mb-2">Jooble-u Yüklə</h2>
          <p className="text-muted-foreground mb-6">
            Jooble-u cihazınıza quraşdırın və app kimi tam ekran açın. Offline də işləyir.
          </p>

          {canInstall ? (
            <div className="flex gap-3 w-full">
              <Button onClick={handleDismiss} variant="outline" className="flex-1">
                İndi Yox
              </Button>
              <Button onClick={handleInstallClick} className="flex-1">
                Yüklə
              </Button>
            </div>
          ) : (
            <div className="w-full space-y-4">
              {/* Fallback instructions */}
              {isIOS ? (
                <div className="text-left text-sm text-muted-foreground space-y-2">
                  <p className="font-semibold text-foreground">iPhone/iPad üçün:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Safari-də Share düyməsini basın <span className="text-lg">⬆️</span></li>
                    <li>"Add to Home Screen" seçin</li>
                    <li>Ad: Jooble — sonra "Add" basın</li>
                  </ol>
                </div>
              ) : isDesktop ? (
                <div className="text-left text-sm text-muted-foreground space-y-2">
                  <p className="font-semibold text-foreground">Desktop PC üçün:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li><strong>Chrome/Edge:</strong> Ünvan panelindəki ➕ "Install" ikonuna klikləyin</li>
                    <li>Və ya brauzer menyusundan (⋮) "Install Jooble..." seçin</li>
                    <li>"Install" düyməsini basın</li>
                  </ol>
                  <p className="text-xs mt-2 italic">Not: Firefox hal-hazırda PWA quraşdırılmasını dəstəkləmir.</p>
                </div>
              ) : (
                <div className="text-left text-sm text-muted-foreground space-y-2">
                  <p className="font-semibold text-foreground">Android üçün:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Brauzer menyusunu (⋮) açın</li>
                    <li>"Add to Home screen" və ya "Install app" seçin</li>
                    <li>Ad: Jooble — təsdiqləyin</li>
                  </ol>
                </div>
              )}

              {inIframe && currentUrl && (
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full rounded-md border border-border px-4 py-2 text-sm hover:bg-accent"
                >
                  Yeni pəncərədə aç <ExternalLink className="h-4 h-4" />
                </a>
              )}

              <div className="flex gap-3 w-full">
                <Button onClick={handleDismiss} variant="outline" className="flex-1">
                  Bağla
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
