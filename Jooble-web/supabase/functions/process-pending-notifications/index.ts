import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get pending notifications
    const { data: pending, error: pendingError } = await supabaseClient
      .from('pending_notifications')
      .select('*')
      .eq('processed', false)
      .order('created_at', { ascending: true })
      .limit(10);

    if (pendingError) throw pendingError;

    if (!pending || pending.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending notifications' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let processedCount = 0;
    let failedCount = 0;

    // Load VAPID keys
    const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY');
    const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY');
    const VAPID_EMAIL = 'mailto:support@jooble.az';

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      throw new Error('VAPID keys not configured');
    }

    // Import web-push and configure VAPID
    const webpush = await import('npm:web-push@3.6.7');
    webpush.setVapidDetails(
      VAPID_EMAIL,
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );

    for (const notification of pending) {
      try {
        // Get subscriptions for this category only
        const { data: subscriptions } = await supabaseClient
          .from('push_subscriptions')
          .select('*')
          .contains('subscribed_categories', [notification.category_id]);

        if (subscriptions && subscriptions.length > 0) {
          for (const subscription of subscriptions) {
            try {
              const pushSubscription = {
                endpoint: subscription.endpoint,
                keys: {
                  p256dh: subscription.p256dh,
                  auth: subscription.auth
                }
              };

              const payload = JSON.stringify({
                title: notification.payload.title,
                body: notification.payload.body,
                icon: '/icons/icon-192x192.jpg',
                badge: '/icons/icon-192x192.jpg',
                url: '/'
              });

              await webpush.sendNotification(pushSubscription, payload);
              processedCount++;
            } catch (err: any) {
              failedCount++;
              console.error('Error sending to subscription', subscription.id, err);
              // Remove invalid subscription
              if (err?.statusCode === 410) {
                await supabaseClient
                  .from('push_subscriptions')
                  .delete()
                  .eq('id', subscription.id);
                console.log(`Removed invalid subscription: ${subscription.id}`);
              }
            }
          }
        }

        // Mark as processed
        await supabaseClient
          .from('pending_notifications')
          .update({ processed: true, processed_at: new Date().toISOString() })
          .eq('id', notification.id);

      } catch (error) {
        console.error('Error processing notification:', error);
        failedCount++;
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Notifications processed',
        processed: processedCount,
        failed: failedCount
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in process-pending-notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
