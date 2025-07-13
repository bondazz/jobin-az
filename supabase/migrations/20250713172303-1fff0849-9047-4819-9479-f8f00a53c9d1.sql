-- Create function to increment job view count
CREATE OR REPLACE FUNCTION increment_job_views(job_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE jobs 
  SET views = views + 1 
  WHERE id = job_id AND is_active = true;
END;
$$;