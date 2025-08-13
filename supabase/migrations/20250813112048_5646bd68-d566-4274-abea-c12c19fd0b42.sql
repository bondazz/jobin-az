-- Add RLS policy to allow anonymous job submissions
DROP POLICY IF EXISTS "Anyone can insert referral_job_submissions" ON referral_job_submissions;

CREATE POLICY "Anyone can insert referral_job_submissions" 
ON referral_job_submissions 
FOR INSERT 
WITH CHECK (true);