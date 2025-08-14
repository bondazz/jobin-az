-- Drop all existing triggers and functions with CASCADE
DROP TRIGGER IF EXISTS trigger_referral_job_payment ON referral_job_submissions CASCADE;
DROP TRIGGER IF EXISTS handle_referral_job_payment_trigger ON referral_job_submissions CASCADE;
DROP TRIGGER IF EXISTS referral_job_payment_trigger ON referral_job_submissions CASCADE;
DROP FUNCTION IF EXISTS handle_referral_job_payment() CASCADE;

-- Create the new corrected trigger function
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

-- Create the new trigger
CREATE TRIGGER referral_job_payment_trigger
  AFTER UPDATE ON referral_job_submissions
  FOR EACH ROW
  EXECUTE FUNCTION handle_referral_job_payment();

-- Fix current data: Calculate correct earnings for each referral user
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

-- Fix the job that doesn't have referral_user_id set
UPDATE referral_job_submissions 
SET referral_user_id = (
  SELECT user_id FROM referrals WHERE code = referral_job_submissions.referral_code AND is_active = true
)
WHERE referral_code IS NOT NULL 
AND referral_user_id IS NULL 
AND EXISTS (
  SELECT 1 FROM referrals WHERE code = referral_job_submissions.referral_code AND is_active = true
);