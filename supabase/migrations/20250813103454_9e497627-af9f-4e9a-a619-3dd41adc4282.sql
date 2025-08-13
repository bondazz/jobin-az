-- Update the payment amount from 50 AZN to 5 AZN
CREATE OR REPLACE FUNCTION public.handle_referral_job_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only process when status changes to 'published'
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    -- Add payment to referral user (changed from 50 to 5 AZN)
    UPDATE public.referrals 
    SET earnings_azn = earnings_azn + 5, -- 5 AZN for each published job
        updated_at = now()
    WHERE user_id = NEW.referral_user_id;
  END IF;
  
  RETURN NEW;
END;
$function$;