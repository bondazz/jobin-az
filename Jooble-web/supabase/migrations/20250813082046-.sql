-- Add first_name and last_name to profiles table
ALTER TABLE public.profiles 
ADD COLUMN first_name text,
ADD COLUMN last_name text;

-- Update withdrawals table to add balance restoration capability when cancelled by admin
-- We'll handle this in the application logic

-- Add admin_comment visibility policies if not already exists
-- The admin_comment should be visible to the user who made the withdrawal