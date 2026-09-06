-- Fix security issue: Set search_path for populate_referral_user_id function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;