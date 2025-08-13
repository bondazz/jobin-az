-- Allow users to cancel their own pending withdrawals
CREATE POLICY IF NOT EXISTS "Users can cancel their own pending withdrawals"
ON public.withdrawals
FOR UPDATE
USING (user_id = auth.uid() AND status = 'pending')
WITH CHECK (user_id = auth.uid() AND status = 'cancelled');