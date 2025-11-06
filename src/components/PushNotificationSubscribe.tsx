import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, BellOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PushNotificationSubscribe = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
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
      // Request notification permission
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

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Get VAPID public key from backend
      const { data: keyData, error: keyError } = await supabase.functions.invoke('get-vapid-public-key');
      
      if (keyError || !keyData?.publicKey) {
        throw new Error('VAPID public key alınmadı');
      }

      const vapidPublicKey = keyData.publicKey;
      
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      // Get the subscription object
      const subscriptionJson = subscription.toJSON();
      
      // Save subscription to database
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

      if (error) {
        // Check if it's a duplicate subscription error
        if (error.code === '23505') {
          toast({
            title: "Artıq abunə olunub",
            description: "Bu cihazda artıq bildirişlər aktivdir",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Uğurlu!",
          description: "Bildirişlərə abunə oldunuz",
        });
      }

      setIsSubscribed(true);
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

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Unsubscribe from push manager
        await subscription.unsubscribe();

        // Remove from database
        const subscriptionJson = subscription.toJSON();
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscriptionJson.endpoint!);

        toast({
          title: "Uğurlu!",
          description: "Bildirişlərdən çıxıldı",
        });
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast({
        title: "Xəta",
        description: "Bildirişlərdən çıxmaq mümkün olmadı",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Bildirişlər
        </CardTitle>
        <CardDescription>
          Yeni iş elanları haqqında dərhal bildiriş alın
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSubscribed ? (
          <Button
            onClick={unsubscribe}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            <BellOff className="mr-2 h-4 w-4" />
            Bildirişləri söndür
          </Button>
        ) : (
          <Button
            onClick={subscribe}
            disabled={loading}
            className="w-full"
          >
            <Bell className="mr-2 h-4 w-4" />
            Bildirişləri aktiv et
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PushNotificationSubscribe;