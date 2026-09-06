-- Create table for referral job submissions
CREATE TABLE public.referral_job_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_code TEXT NOT NULL,
  referral_user_id UUID NOT NULL,
  
  -- Applicant information
  applicant_name TEXT NOT NULL,
  applicant_surname TEXT NOT NULL,
  applicant_position TEXT NOT NULL,
  applicant_phone TEXT NOT NULL,
  
  -- Job details
  company_name TEXT NOT NULL,
  voen TEXT,
  website TEXT,
  company_description TEXT,
  job_article TEXT NOT NULL, -- Rich text content
  
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, published
  admin_comment TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.referral_job_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can do everything on referral_job_submissions" 
ON public.referral_job_submissions 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin')
WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can view their own referral_job_submissions" 
ON public.referral_job_submissions 
FOR SELECT 
USING (referral_user_id = auth.uid());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_referral_job_submissions_updated_at
BEFORE UPDATE ON public.referral_job_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle referral payments when status changes to published
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic payment
CREATE TRIGGER trigger_referral_job_payment
AFTER UPDATE ON public.referral_job_submissions
FOR EACH ROW
EXECUTE FUNCTION public.handle_referral_job_payment();