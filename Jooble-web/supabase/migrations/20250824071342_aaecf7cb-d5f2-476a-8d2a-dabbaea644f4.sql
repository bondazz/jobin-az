-- Fix referral tracking and payment system

-- First, let's update the existing submissions that have referral_code but missing referral_user_id
UPDATE referral_job_submissions 
SET referral_user_id = (
  SELECT user_id 
  FROM referrals 
  WHERE code = referral_job_submissions.referral_code 
  AND is_active = true
)
WHERE referral_code IS NOT NULL 
AND referral_user_id IS NULL;

-- Now let's create the trigger for automatic referral payments
CREATE OR REPLACE FUNCTION public.handle_referral_job_payment()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger
DROP TRIGGER IF EXISTS referral_job_payment_trigger ON referral_job_submissions;
CREATE TRIGGER referral_job_payment_trigger
  AFTER UPDATE ON referral_job_submissions
  FOR EACH ROW
  EXECUTE FUNCTION handle_referral_job_payment();

-- Also create an insert trigger to handle immediate published status
CREATE OR REPLACE FUNCTION public.handle_referral_job_payment_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle immediate published status on insert
  IF NEW.status = 'published' THEN
    -- Check if referral_user_id exists
    IF NEW.referral_user_id IS NOT NULL THEN
      -- Add 5 AZN and increment confirmations count
      UPDATE public.referrals 
      SET earnings_azn = earnings_azn + 5,
          confirmations_count = confirmations_count + 1,
          updated_at = now()
      WHERE user_id = NEW.referral_user_id AND is_active = true;
      
      RAISE NOTICE 'Added 5 AZN and 1 confirmation for user % on insert', NEW.referral_user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the insert trigger
DROP TRIGGER IF EXISTS referral_job_payment_insert_trigger ON referral_job_submissions;
CREATE TRIGGER referral_job_payment_insert_trigger
  AFTER INSERT ON referral_job_submissions
  FOR EACH ROW
  EXECUTE FUNCTION handle_referral_job_payment_on_insert();