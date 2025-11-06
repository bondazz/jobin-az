import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PushNotificationBanner = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
      
      // Show banner only if not subscribed and not dismissed
      if (!subscription && !localStorage.getItem('push-banner-dismissed')) {
        setTimeout(() => setShowBanner(true), 5000); // Show after 5 seconds
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribe = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        toast({
          title: "İcazə verilmədi",
          description: "Bildirişlər üçün icazə verməlisiniz",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      const subscriptionJson = subscription.toJSON();
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('push_subscriptions')
        .insert({
          user_id: user?.id || null,
          endpoint: subscriptionJson.endpoint!,
          p256dh: subscriptionJson.keys!.p256dh!,
          auth: subscriptionJson.keys!.auth!,
          user_agent: navigator.userAgent
        });

      if (error && error.code !== '23505') {
        throw error;
      }

      toast({
        title: "Uğurlu!",
        description: "Yeni iş elanları haqqında bildiriş alacaqsınız",
      });

      setIsSubscribed(true);
      setShowBanner(false);
      localStorage.setItem('push-banner-dismissed', 'true');
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast({
        title: "Xəta",
        description: "Bildirişlərə abunə olmaq mümkün olmadı",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('push-banner-dismissed', 'true');
  };

  if (!isSupported || !showBanner || isSubscribed) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-card border border-border rounded-lg shadow-xl p-4 z-40 animate-in slide-in-from-bottom-5">
      <button
        onClick={handleDismiss}
        className="absolute right-2 top-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Bağla"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="rounded-full bg-primary/10 p-2">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold mb-1">Yeni iş elanları haqqında bildiriş alın</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Dərhal xəbərdar olun və heç bir fürsəti qaçırmayın
          </p>
          <Button
            onClick={subscribe}
            disabled={loading}
            size="sm"
            className="w-full"
          >
            {loading ? "Yüklənir..." : "Bildirişləri aktiv et"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PushNotificationBanner;