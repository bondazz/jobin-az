-- Add subscribed_categories column to push_subscriptions table
ALTER TABLE public.push_subscriptions
ADD COLUMN IF NOT EXISTS subscribed_categories uuid[] DEFAULT '{}';

-- Add index for faster category filtering
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_categories 
ON public.push_subscriptions USING GIN(subscribed_categories);

-- Create function to send push notification to category subscribers
CREATE OR REPLACE FUNCTION public.notify_category_subscribers(
  job_category_id uuid,
  job_title text,
  company_name text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  notification_payload jsonb;
BEGIN
  -- Build notification payload
  notification_payload := jsonb_build_object(
    'title', '🆕 Yeni iş elanı',
    'body', job_title || ' - ' || company_name,
    'categoryId', job_category_id
  );

  -- Insert into a notifications queue table (we'll create this)
  INSERT INTO public.pending_notifications (category_id, payload)
  VALUES (job_category_id, notification_payload);
END;
$$;

-- Create table for pending notifications (to be processed by edge function)
CREATE TABLE IF NOT EXISTS public.pending_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid REFERENCES public.categories(id),
  payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  processed_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.pending_notifications ENABLE ROW LEVEL SECURITY;

-- Admin can manage pending notifications
CREATE POLICY "Admins can manage pending_notifications"
ON public.pending_notifications
FOR ALL
USING (get_user_role(auth.uid()) = 'admin');

-- Add RLS policy for updating subscribed_categories
DROP POLICY IF EXISTS "Users can update their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can update their own push subscriptions"
ON public.push_subscriptions
FOR UPDATE
USING ((auth.uid() = user_id) OR (user_id IS NULL))
WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));