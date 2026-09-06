
-- Create payments table for Epoint payment tracking
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id uuid REFERENCES public.referral_job_submissions(id),
  order_id text NOT NULL UNIQUE,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'AZN',
  status text NOT NULL DEFAULT 'new',
  transaction text,
  bank_transaction text,
  card_mask text,
  rrn text,
  epoint_code text,
  epoint_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can do everything on payments"
ON public.payments FOR ALL
USING (get_user_role(auth.uid()) = 'admin');

-- Anyone can view their payment by order_id (needed for redirect pages)
CREATE POLICY "Anyone can view payments"
ON public.payments FOR SELECT
USING (true);

-- Edge functions insert/update via service role, so no insert/update policy needed for anon

-- Add payment columns to referral_job_submissions
ALTER TABLE public.referral_job_submissions
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid',
ADD COLUMN IF NOT EXISTS payment_order_id text,
ADD COLUMN IF NOT EXISTS payment_amount numeric,
ADD COLUMN IF NOT EXISTS payment_transaction text,
ADD COLUMN IF NOT EXISTS payment_date timestamp with time zone;
