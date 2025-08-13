-- Fix security warning by setting search_path for the function
CREATE OR REPLACE FUNCTION public.handle_referral_job_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when status changes to 'published'
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    -- Add payment to referral user (you can adjust the amount as needed)
    UPDATE public.referrals 
    SET earnings_azn = earnings_azn + 50, -- 50 AZN for each published job
        updated_at = now()
    WHERE user_id = NEW.referral_user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';