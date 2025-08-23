-- Add background_image field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS background_image TEXT;