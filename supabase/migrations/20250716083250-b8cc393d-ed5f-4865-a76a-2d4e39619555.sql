-- Add tab-specific SEO fields to companies table
ALTER TABLE public.companies 
ADD COLUMN about_seo_title TEXT,
ADD COLUMN about_seo_description TEXT,
ADD COLUMN about_seo_keywords TEXT[],
ADD COLUMN jobs_seo_title TEXT,
ADD COLUMN jobs_seo_description TEXT,
ADD COLUMN jobs_seo_keywords TEXT[];