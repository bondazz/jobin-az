-- First, let's check and fix any duplicate triggers or functions

-- Drop any remaining triggers that might be causing duplicates
DROP TRIGGER IF EXISTS referral_job_payment_trigger ON public.referral_job_submissions;
DROP TRIGGER IF EXISTS referral_job_payment_insert_trigger ON public.referral_job_submissions;
DROP TRIGGER IF EXISTS referral_job_payment_update_trigger ON public.referral_job_submissions;

-- Drop any old functions that might still exist
DROP FUNCTION IF EXISTS public.handle_referral_job_payment_on_insert();
DROP FUNCTION IF EXISTS public.handle_referral_job_payment_on_update();

-- Create the clean, single function
CREATE OR REPLACE FUNCTION public.handle_referral_job_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle status change to 'published' (both INSERT and UPDATE)
  IF NEW.status = 'published' AND (OLD IS NULL OR OLD.status != 'published') THEN
    -- Check if referral_user_id exists
    IF NEW.referral_user_id IS NOT NULL THEN
      -- Add exactly 5 AZN and increment confirmations count by 1
      UPDATE public.referrals 
      SET earnings_azn = earnings_azn + 5,
          confirmations_count = confirmations_count + 1,
          updated_at = now()
      WHERE user_id = NEW.referral_user_id AND is_active = true;
      
      RAISE NOTICE 'Added exactly 5 AZN and 1 confirmation for user %', NEW.referral_user_id;
    END IF;
  END IF;
  
  -- Handle status change from 'published' to any other status (only UPDATE)
  IF OLD IS NOT NULL AND OLD.status = 'published' AND NEW.status != 'published' THEN
    -- Check if referral_user_id exists
    IF NEW.referral_user_id IS NOT NULL THEN
      -- Subtract exactly 5 AZN and decrement confirmations count by 1 (but don't go below 0)
      UPDATE public.referrals 
      SET earnings_azn = GREATEST(earnings_azn - 5, 0),
          confirmations_count = GREATEST(confirmations_count - 1, 0),
          updated_at = now()
      WHERE user_id = NEW.referral_user_id AND is_active = true;
      
      RAISE NOTICE 'Removed exactly 5 AZN and 1 confirmation for user %', NEW.referral_user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create only ONE trigger for both INSERT and UPDATE
CREATE TRIGGER referral_job_payment_trigger
AFTER INSERT OR UPDATE ON public.referral_job_submissions
FOR EACH ROW
EXECUTE FUNCTION public.handle_referral_job_payment();