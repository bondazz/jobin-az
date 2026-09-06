-- Revert the increment_job_views function to increment by 1 instead of 3
CREATE OR REPLACE FUNCTION public.increment_job_views(job_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE jobs 
  SET views = views + 1 
  WHERE id = job_id AND is_active = true;
END;
$function$;