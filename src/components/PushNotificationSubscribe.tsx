import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
const PushNotificationSubscribe = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const {
    toast
  } = useToast();

  // Fetch categories
  const {
    data: categories,
    isLoading: categoriesLoading
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('categories').select('*').eq('is_active', true).order('name');
      if (error) throw error;
      return data;
    }
  });
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
      if (subscription) {
        // Get saved categories from database
        const subscriptionJson = subscription.toJSON();
        const {
          data
        } = await supabase.from('push_subscriptions').select('subscribed_categories, id, endpoint, p256dh, auth').eq('endpoint', subscriptionJson.endpoint!).single();
        if (data) {
          setCurrentSubscription(data);
          setSelectedCategories(data.subscribed_categories || []);
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
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
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Get VAPID public key from backend
      const {
        data: keyData,
        error: keyError
      } = await supabase.functions.invoke('get-vapid-public-key');
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
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      const {
        error,
        data: insertedData
      } = await supabase.from('push_subscriptions').insert({
        user_id: user?.id || null,
        endpoint: subscriptionJson.endpoint!,
        p256dh: subscriptionJson.keys!.p256dh!,
        auth: subscriptionJson.keys!.auth!,
        user_agent: navigator.userAgent,
        subscribed_categories: selectedCategories
      }).select().single();
      if (insertedData) {
        setCurrentSubscription(insertedData);
      }
      if (error) {
        // Check if it's a duplicate subscription error
        if (error.code === '23505') {
          toast({
            title: "Artıq abunə olunub",
            description: "Bu cihazda artıq bildirişlər aktivdir"
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Uğurlu!",
          description: "Bildirişlərə abunə oldunuz"
        });
      }
      setIsSubscribed(true);
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast({
        title: "Xəta",
        description: "Bildirişlərə abunə olmaq mümkün olmadı",
        variant: "destructive"
      });
    }
    setLoading(false);
  };
  const updateCategories = async () => {
    if (!currentSubscription) return;
    setLoading(true);
    try {
      const {
        error
      } = await supabase.from('push_subscriptions').update({
        subscribed_categories: selectedCategories
      }).eq('id', currentSubscription.id);
      if (error) throw error;
      toast({
        title: "Uğurlu!",
        description: "Kateqoriya seçimləri yeniləndi"
      });
    } catch (error) {
      console.error('Error updating categories:', error);
      toast({
        title: "Xəta",
        description: "Kateqoriyalar yenilənmədi",
        variant: "destructive"
      });
    }
    setLoading(false);
  };
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]);
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
        await supabase.from('push_subscriptions').delete().eq('endpoint', subscriptionJson.endpoint!);
        toast({
          title: "Uğurlu!",
          description: "Bildirişlərdən çıxıldı"
        });
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast({
        title: "Xəta",
        description: "Bildirişlərdən çıxmaq mümkün olmadı",
        variant: "destructive"
      });
    }
    setLoading(false);
  };
  if (!isSupported) {
    return null;
  }
  return <Card>
      <CardHeader>
        
        
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSubscribed ? <Button onClick={subscribe} disabled={loading} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bell className="mr-2 h-4 w-4" />}
            Bildirişləri aktiv et
          </Button> : <>
            <div className="space-y-3">
              <Label className="text-base font-semibold">Kateqoriyalar seçin:</Label>
              {categoriesLoading ? <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div> : <div className="space-y-2 max-h-64 overflow-y-auto">
                  {categories?.map(category => <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox id={category.id} checked={selectedCategories.includes(category.id)} onCheckedChange={() => toggleCategory(category.id)} />
                      <Label htmlFor={category.id} className="text-sm font-normal cursor-pointer flex-1">
                        {category.name}
                      </Label>
                    </div>)}
                </div>}
            </div>

            <div className="flex gap-2">
              <Button onClick={updateCategories} disabled={loading || !selectedCategories.length} className="flex-1">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Yadda saxla
              </Button>
              <Button onClick={unsubscribe} disabled={loading} variant="outline">
                <BellOff className="h-4 w-4" />
              </Button>
            </div>
          </>}
      </CardContent>
    </Card>;
};
export default PushNotificationSubscribe;