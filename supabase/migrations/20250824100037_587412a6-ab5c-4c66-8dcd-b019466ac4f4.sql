-- Create function to auto-populate referral_user_id from referral_code
CREATE OR REPLACE FUNCTION public.populate_referral_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If referral_code is provided but referral_user_id is null, populate it
  IF NEW.referral_code IS NOT NULL AND NEW.referral_user_id IS NULL THEN
    SELECT user_id INTO NEW.referral_user_id 
    FROM public.referrals 
    WHERE code = NEW.referral_code AND is_active = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to populate referral_user_id before insert/update
DROP TRIGGER IF EXISTS populate_referral_user_id_trigger ON public.referral_job_submissions;
CREATE TRIGGER populate_referral_user_id_trigger
  BEFORE INSERT OR UPDATE ON public.referral_job_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.populate_referral_user_id();

-- Create triggers for referral job payment handling
DROP TRIGGER IF EXISTS referral_job_payment_insert_trigger ON public.referral_job_submissions;
CREATE TRIGGER referral_job_payment_insert_trigger
  AFTER INSERT ON public.referral_job_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_job_payment_on_insert();

DROP TRIGGER IF EXISTS referral_job_payment_update_trigger ON public.referral_job_submissions;
CREATE TRIGGER referral_job_payment_update_trigger
  AFTER UPDATE ON public.referral_job_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_job_payment();

-- Update existing records that have referral_code but missing referral_user_id
UPDATE public.referral_job_submissions 
SET referral_user_id = r.user_id
FROM public.referrals r
WHERE public.referral_job_submissions.referral_code = r.code 
  AND public.referral_job_submissions.referral_user_id IS NULL 
  AND r.is_active = true;