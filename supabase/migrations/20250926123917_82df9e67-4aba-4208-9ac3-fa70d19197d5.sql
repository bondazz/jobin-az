-- Add expiration_date column to jobs table
ALTER TABLE public.jobs 
ADD COLUMN expiration_date TIMESTAMP WITH TIME ZONE;

-- Create a function to automatically set expiration date to 30 days from creation
CREATE OR REPLACE FUNCTION set_job_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- If expiration_date is not set, set it to 30 days from creation date
  IF NEW.expiration_date IS NULL THEN
    NEW.expiration_date = NEW.created_at + INTERVAL '30 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set expiration date on job creation
CREATE TRIGGER set_job_expiration_trigger
BEFORE INSERT ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION set_job_expiration();

-- Update existing jobs to have expiration date (30 days from created_at)
UPDATE public.jobs 
SET expiration_date = created_at + INTERVAL '30 days'
WHERE expiration_date IS NULL;

-- Create a view for active jobs (not expired)
CREATE OR REPLACE VIEW jobs_active AS
SELECT * FROM public.jobs 
WHERE is_active = true AND (expiration_date IS NULL OR expiration_date > now());

-- Update RLS policies to consider expiration date
DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON public.jobs;

CREATE POLICY "Jobs are viewable by everyone" 
ON public.jobs 
FOR SELECT 
USING (is_active = true AND (expiration_date IS NULL OR expiration_date > now()));

-- Create function to check if job is expired
CREATE OR REPLACE FUNCTION is_job_expired(job_expiration_date TIMESTAMP WITH TIME ZONE)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN job_expiration_date IS NOT NULL AND job_expiration_date <= now();
END;
$$ LANGUAGE plpgsql;