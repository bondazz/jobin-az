-- Modify jobs table to simplify structure and add application options
-- Remove requirements and benefits arrays, keep only description
-- Add application_type and application_email fields

ALTER TABLE public.jobs 
DROP COLUMN requirements,
DROP COLUMN benefits,
ADD COLUMN application_type text DEFAULT 'website' CHECK (application_type IN ('website', 'email')),
ADD COLUMN application_email text;