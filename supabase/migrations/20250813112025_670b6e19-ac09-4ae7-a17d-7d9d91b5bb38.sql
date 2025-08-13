-- Allow nullable referral fields for non-referral submissions
ALTER TABLE referral_job_submissions 
ALTER COLUMN referral_code DROP NOT NULL,
ALTER COLUMN referral_user_id DROP NOT NULL;