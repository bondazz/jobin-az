
-- Allow reading submission right after insert (needed for payment flow)
CREATE POLICY "Anyone can view submission by id for payment"
ON public.referral_job_submissions FOR SELECT
USING (status = 'awaiting_payment');
