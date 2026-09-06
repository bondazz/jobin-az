-- 1) Create a view that hides sensitive application_email
CREATE OR REPLACE VIEW public.jobs_public AS
SELECT 
  id,
  application_type,
  salary,
  company_id,
  title,
  is_active,
  updated_at,
  type,
  location,
  seo_keywords,
  seo_description,
  -- application_email is intentionally omitted to prevent scraping
  views,
  category_id,
  seo_title,
  created_at,
  slug,
  application_url,
  tags,
  description
FROM public.jobs;

-- Ensure view is queryable (RLS on underlying table still applies)
ALTER VIEW public.jobs_public SET (security_invoker = on);

-- 2) Create a secure function to fetch application email for a single job
CREATE OR REPLACE FUNCTION public.get_job_application_email(job_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  app_email text;
BEGIN
  SELECT j.application_email
  INTO app_email
  FROM public.jobs j
  WHERE j.id = job_uuid
    AND j.is_active = true
    AND j.application_type = 'email';

  RETURN app_email; -- will be null if not found or not email type
END;
$$;

-- Lock down function execution: allow anyone to call (read-only), but it only returns a single email if allowed
REVOKE ALL ON FUNCTION public.get_job_application_email(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_job_application_email(uuid) TO anon, authenticated;
