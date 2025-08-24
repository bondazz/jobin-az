-- Create trigger for referral job payment system
CREATE OR REPLACE TRIGGER referral_job_payment_trigger
  BEFORE UPDATE ON public.referral_job_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_job_payment();

-- Also make sure the trigger works when status changes from any state to 'published' or from 'published' to any other state
-- The function already handles this logic correctly