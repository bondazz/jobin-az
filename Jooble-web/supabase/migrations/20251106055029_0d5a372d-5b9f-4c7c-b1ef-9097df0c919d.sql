-- Update payload format and enqueue notifications for category subscribers
CREATE OR REPLACE FUNCTION public.notify_category_subscribers(job_category_id uuid, job_title text, company_name text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  notification_payload jsonb;
BEGIN
  -- Build notification payload as requested: title = job title, body = "Company" səni axtarır..! 🎉
  notification_payload := jsonb_build_object(
    'title', job_title,
    'body', coalesce(company_name, '') || ' səni axtarır..! 🎉',
    'categoryId', job_category_id
  );

  -- Insert into notifications queue
  INSERT INTO public.pending_notifications (category_id, payload)
  VALUES (job_category_id, notification_payload);
END;
$function$;

-- Trigger function to enqueue notification on new active job insert
CREATE OR REPLACE FUNCTION public.tr_fn_notify_category_subscribers()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $trigger$
DECLARE
  comp_name text;
BEGIN
  -- Only for active jobs with a category that are not expired
  IF NEW.is_active = true AND NEW.category_id IS NOT NULL AND (NEW.expiration_date IS NULL OR NEW.expiration_date > now()) THEN
    IF NEW.company_id IS NOT NULL THEN
      SELECT name INTO comp_name FROM public.companies WHERE id = NEW.company_id;
    END IF;

    PERFORM public.notify_category_subscribers(NEW.category_id, NEW.title, COALESCE(comp_name, ''));
  END IF;
  RETURN NEW;
END;
$trigger$;

-- Recreate trigger on jobs table
DROP TRIGGER IF EXISTS tr_notify_category_subscribers ON public.jobs;
CREATE TRIGGER tr_notify_category_subscribers
AFTER INSERT ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.tr_fn_notify_category_subscribers();