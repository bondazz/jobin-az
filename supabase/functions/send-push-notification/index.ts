import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if user is admin
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error('Unauthorized - Admin only');
    }

    // Parse request body
    const { title, body, url = '/' }: NotificationPayload = await req.json();

    if (!title || !body) {
      throw new Error('Title and body are required');
    }

    console.log('Sending push notification:', { title, body, url });

    // Get all push subscriptions
    const { data: subscriptions, error: subError } = await supabaseClient
      .from('push_subscriptions')
      .select('*');

    if (subError) {
      throw subError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No subscriptions found', sent: 0, failed: 0 }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // VAPID details from environment variables
    const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY');
    const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY');
    const VAPID_EMAIL = 'mailto:support@jooble.az';

    if (!VAPID_PRIVATE_KEY || !VAPID_PUBLIC_KEY) {
      throw new Error('VAPID keys not configured');
    }

    console.log('VAPID keys loaded successfully');

    // Prepare notification payload
    const notificationPayload = JSON.stringify({
      title,
      body,
      icon: '/icons/icon-192x192.jpg',
      badge: '/icons/icon-192x192.jpg',
      url
    });

    let sentCount = 0;
    let failedCount = 0;
    const failedSubscriptions: string[] = [];

    // Send notifications using web-push
    for (const subscription of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        };

        // Use web-push library to send notification
        // For Deno, we'll use fetch directly to send to the push service
        const response = await sendPushNotification(
          pushSubscription,
          notificationPayload,
          VAPID_PUBLIC_KEY,
          VAPID_PRIVATE_KEY,
          VAPID_EMAIL
        );

        if (response.ok) {
          sentCount++;
          console.log(`Notification sent to: ${subscription.endpoint.substring(0, 50)}...`);
        } else {
          failedCount++;
          failedSubscriptions.push(subscription.id);
          console.error(`Failed to send to: ${subscription.endpoint.substring(0, 50)}...`, response.status);
          
          // If subscription is invalid (410 Gone), remove it
          if (response.status === 410) {
            await supabaseClient
              .from('push_subscriptions')
              .delete()
              .eq('id', subscription.id);
            console.log(`Removed invalid subscription: ${subscription.id}`);
          }
        }
      } catch (error) {
        failedCount++;
        failedSubscriptions.push(subscription.id);
        console.error(`Error sending to subscription ${subscription.id}:`, error);
      }
    }

    // Log notification
    await supabaseClient
      .from('notification_logs')
      .insert({
        title,
        body,
        sent_by: user.id,
        sent_count: sentCount,
        failed_count: failedCount
      });

    return new Response(
      JSON.stringify({
        message: 'Notifications sent',
        sent: sentCount,
        failed: failedCount,
        total: subscriptions.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in send-push-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: error.message === 'Unauthorized' || error.message === 'Unauthorized - Admin only' ? 403 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Helper function to send push notification using Web Push Protocol
async function sendPushNotification(
  subscription: any,
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidEmail: string
): Promise<Response> {
  // This is a simplified version. In production, you'd use a proper web-push library
  // For now, we'll use a workaround with the web-push npm package
  
  const webpush = await import('npm:web-push@3.6.7');
  
  webpush.setVapidDetails(
    vapidEmail,
    vapidPublicKey,
    vapidPrivateKey
  );

  try {
    await webpush.sendNotification(subscription, payload);
    return new Response(null, { status: 200 });
  } catch (error: any) {
    console.error('Web push error:', error);
    return new Response(null, { status: error.statusCode || 500 });
  }
}