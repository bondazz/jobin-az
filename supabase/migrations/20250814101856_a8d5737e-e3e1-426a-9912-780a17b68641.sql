-- First, let's check and fix the trigger for referral payments
DROP TRIGGER IF EXISTS handle_referral_job_payment_trigger ON referral_job_submissions;

-- Create the correct trigger function for referral payments on job publications
CREATE OR REPLACE FUNCTION public.handle_referral_job_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only process when status changes to 'published'
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    -- Check if referral_user_id exists in the job submission
    IF NEW.referral_user_id IS NOT NULL THEN
      -- Add payment to referral user (5 AZN for each published job)
      UPDATE public.referrals 
      SET earnings_azn = earnings_azn + 5, -- 5 AZN for each published job
          updated_at = now()
      WHERE user_id = NEW.referral_user_id;
      
      -- Log the payment for debugging
      RAISE NOTICE 'Referral payment of 5 AZN added to user %', NEW.referral_user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create the trigger
CREATE TRIGGER handle_referral_job_payment_trigger
  AFTER UPDATE ON public.referral_job_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_job_payment();

-- Now let's check and update any existing published jobs that didn't get credited
-- First, let's get the user_id for referral codes that have published jobs
UPDATE public.referral_job_submissions 
SET referral_user_id = r.user_id
FROM public.referrals r
WHERE referral_job_submissions.referral_code = r.code 
AND referral_job_submissions.referral_user_id IS NULL
AND referral_job_submissions.referral_code IS NOT NULL;

-- Now credit existing published jobs that haven't been credited yet
WITH published_jobs AS (
  SELECT DISTINCT referral_user_id, COUNT(*) as job_count
  FROM public.referral_job_submissions 
  WHERE status = 'published' 
  AND referral_user_id IS NOT NULL
  GROUP BY referral_user_id
)
UPDATE public.referrals 
SET earnings_azn = earnings_azn + (pj.job_count * 5)
FROM published_jobs pj
WHERE referrals.user_id = pj.referral_user_id;