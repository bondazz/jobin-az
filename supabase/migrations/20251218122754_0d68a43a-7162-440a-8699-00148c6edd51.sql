-- Add h1_title column to categories table for display title (H1)
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS h1_title TEXT;