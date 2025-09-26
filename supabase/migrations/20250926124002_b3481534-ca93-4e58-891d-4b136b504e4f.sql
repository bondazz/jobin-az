-- Fix security issues by properly handling dependencies

-- Drop the trigger first, then the function
DROP TRIGGER IF EXISTS set_job_expiration_trigger ON public.jobs;
DROP FUNCTION IF EXISTS set_job_expiration() CASCADE;

-- Recreate function with proper security settings
CREATE OR REPLACE FUNCTION set_job_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- If expiration_date is not set, set it to 30 days from creation date
  IF NEW.expiration_date IS NULL THEN
    NEW.expiration_date = NEW.created_at + INTERVAL '30 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

-- Recreate trigger
CREATE TRIGGER set_job_expiration_trigger
BEFORE INSERT ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION set_job_expiration();

-- Fix the other function with proper security settings
DROP FUNCTION IF EXISTS is_job_expired(TIMESTAMP WITH TIME ZONE);
CREATE OR REPLACE FUNCTION is_job_expired(job_expiration_date TIMESTAMP WITH TIME ZONE)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN job_expiration_date IS NOT NULL AND job_expiration_date <= now();
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;