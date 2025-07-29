-- Fix search_path security vulnerability for all functions
-- This prevents SQL injection attacks through search_path manipulation

-- Update increment_job_views function with secure search_path
CREATE OR REPLACE FUNCTION public.increment_job_views(job_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  UPDATE jobs 
  SET views = views + 1 
  WHERE id = job_id AND is_active = true;
END;
$function$;

-- Update increment_ad_clicks function with secure search_path
CREATE OR REPLACE FUNCTION public.increment_ad_clicks(ad_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  UPDATE advertisements 
  SET click_count = click_count + 1 
  WHERE id = ad_id AND is_active = true;
END;
$function$;

-- Update get_all_companies function with secure search_path
CREATE OR REPLACE FUNCTION public.get_all_companies()
 RETURNS TABLE(id uuid, name text, slug text, logo text, background_image text, description text, website text, email text, phone text, address text, seo_title text, seo_description text, seo_keywords text[], about_seo_title text, about_seo_description text, jobs_seo_title text, jobs_seo_description text, is_verified boolean, is_active boolean, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.slug,
    c.logo,
    c.background_image,
    c.description,
    c.website,
    c.email,
    c.phone,
    c.address,
    c.seo_title,
    c.seo_description,
    c.seo_keywords,
    c.about_seo_title,
    c.about_seo_description,
    c.jobs_seo_title,
    c.jobs_seo_description,
    c.is_verified,
    c.is_active,
    c.created_at,
    c.updated_at
  FROM public.companies c
  WHERE c.is_active = true
  ORDER BY c.name;
END;
$function$;

-- Update search_companies function with secure search_path
CREATE OR REPLACE FUNCTION public.search_companies(search_term text)
 RETURNS TABLE(id uuid, name text, slug text, logo text, background_image text, description text, website text, email text, phone text, address text, seo_title text, seo_description text, seo_keywords text[], about_seo_title text, about_seo_description text, jobs_seo_title text, jobs_seo_description text, is_verified boolean, is_active boolean, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.slug,
    c.logo,
    c.background_image,
    c.description,
    c.website,
    c.email,
    c.phone,
    c.address,
    c.seo_title,
    c.seo_description,
    c.seo_keywords,
    c.about_seo_title,
    c.about_seo_description,
    c.jobs_seo_title,
    c.jobs_seo_description,
    c.is_verified,
    c.is_active,
    c.created_at,
    c.updated_at
  FROM public.companies c
  WHERE c.is_active = true 
    AND c.name ILIKE '%' || search_term || '%'
  ORDER BY c.name;
END;
$function$;

-- Update update_updated_at_column function with secure search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update get_user_role function with secure search_path
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$function$;

-- Update handle_new_user function with secure search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.email),
    'user'
  );
  RETURN new;
END;
$function$;