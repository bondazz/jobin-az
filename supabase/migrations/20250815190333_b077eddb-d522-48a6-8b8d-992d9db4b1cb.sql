-- First, add a confirmations count column to referrals table if it doesn't exist
ALTER TABLE public.referrals 
ADD COLUMN IF NOT EXISTS confirmations_count integer NOT NULL DEFAULT 0;

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS referral_job_payment_trigger ON referral_job_submissions CASCADE;
DROP FUNCTION IF EXISTS handle_referral_job_payment() CASCADE;

-- Create improved trigger function that handles both earnings and confirmations
CREATE OR REPLACE FUNCTION public.handle_referral_job_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Handle status change from any status to 'published'
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    -- Check if referral_user_id exists
    IF NEW.referral_user_id IS NOT NULL THEN
      -- Add 5 AZN and increment confirmations count
      UPDATE public.referrals 
      SET earnings_azn = earnings_azn + 5,
          confirmations_count = confirmations_count + 1,
          updated_at = now()
      WHERE user_id = NEW.referral_user_id AND is_active = true;
      
      RAISE NOTICE 'Added 5 AZN and 1 confirmation for user %', NEW.referral_user_id;
    END IF;
  END IF;
  
  -- Handle status change from 'published' to any other status
  IF OLD.status = 'published' AND NEW.status != 'published' THEN
    -- Check if referral_user_id exists
    IF NEW.referral_user_id IS NOT NULL THEN
      -- Subtract 5 AZN and decrement confirmations count (but don't go below 0)
      UPDATE public.referrals 
      SET earnings_azn = GREATEST(earnings_azn - 5, 0),
          confirmations_count = GREATEST(confirmations_count - 1, 0),
          updated_at = now()
      WHERE user_id = NEW.referral_user_id AND is_active = true;
      
      RAISE NOTICE 'Removed 5 AZN and 1 confirmation for user %', NEW.referral_user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create the trigger for both INSERT and UPDATE
CREATE TRIGGER referral_job_payment_trigger
  AFTER INSERT OR UPDATE ON referral_job_submissions
  FOR EACH ROW
  EXECUTE FUNCTION handle_referral_job_payment();

-- Recalculate correct earnings and confirmations for all referral users
UPDATE public.referrals 
SET earnings_azn = (
  SELECT COALESCE(COUNT(*) * 5, 0)
  FROM referral_job_submissions 
  WHERE referral_user_id = referrals.user_id 
  AND status = 'published'
  AND referral_user_id IS NOT NULL
),
confirmations_count = (
  SELECT COALESCE(COUNT(*), 0)
  FROM referral_job_submissions 
  WHERE referral_user_id = referrals.user_id 
  AND status = 'published'
  AND referral_user_id IS NOT NULL
),
updated_at = now()
WHERE EXISTS (
  SELECT 1 FROM referral_job_submissions 
  WHERE referral_user_id = referrals.user_id
);

-- Fix missing referral_user_id values
UPDATE referral_job_submissions 
SET referral_user_id = (
  SELECT user_id FROM referrals WHERE code = referral_job_submissions.referral_code AND is_active = true
),
updated_at = now()
WHERE referral_code IS NOT NULL 
AND referral_user_id IS NULL 
AND EXISTS (
  SELECT 1 FROM referrals WHERE code = referral_job_submissions.referral_code AND is_active = true
);