-- First, drop the existing trigger if it exists
DROP TRIGGER IF EXISTS referral_job_payment_trigger ON referral_job_submissions;

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS handle_referral_job_payment();

-- Create the corrected trigger function
CREATE OR REPLACE FUNCTION public.handle_referral_job_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only process when status changes to 'published'
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    -- Check if referral_user_id exists in the job submission
    IF NEW.referral_user_id IS NOT NULL THEN
      -- Add payment to referral user (5 AZN for each published job)
      UPDATE public.referrals 
      SET earnings_azn = earnings_azn + 5, -- 5 AZN for each published job
          updated_at = now()
      WHERE user_id = NEW.referral_user_id AND is_active = true;
      
      -- Log the payment for debugging
      RAISE NOTICE 'Referral payment of 5 AZN added to user %', NEW.referral_user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create the trigger
CREATE TRIGGER referral_job_payment_trigger
  AFTER UPDATE ON referral_job_submissions
  FOR EACH ROW
  EXECUTE FUNCTION handle_referral_job_payment();

-- Update existing published jobs that have referral_user_id but no payment
UPDATE public.referrals 
SET earnings_azn = earnings_azn + (
  SELECT COUNT(*) * 5 
  FROM referral_job_submissions 
  WHERE referral_user_id = referrals.user_id 
  AND status = 'published'
  AND referral_user_id IS NOT NULL
) - earnings_azn + earnings_azn,
updated_at = now()
WHERE user_id IN (
  SELECT DISTINCT referral_user_id 
  FROM referral_job_submissions 
  WHERE referral_user_id IS NOT NULL 
  AND status = 'published'
);

-- More precise update to fix current data
UPDATE public.referrals 
SET earnings_azn = (
  SELECT COUNT(*) * 5 
  FROM referral_job_submissions 
  WHERE referral_user_id = referrals.user_id 
  AND status = 'published'
  AND referral_user_id IS NOT NULL
),
updated_at = now()
WHERE user_id IN (
  SELECT DISTINCT referral_user_id 
  FROM referral_job_submissions 
  WHERE referral_user_id IS NOT NULL 
  AND status = 'published'
);