-- Bütün şirkətləri qaytaran funksiya
CREATE OR REPLACE FUNCTION public.get_all_companies()
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  logo text,
  background_image text,
  description text,
  website text,
  email text,
  phone text,
  address text,
  seo_title text,
  seo_description text,
  seo_keywords text[],
  about_seo_title text,
  about_seo_description text,
  jobs_seo_title text,
  jobs_seo_description text,
  is_verified boolean,
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Axtarışlı şirkətlər funksiyası
CREATE OR REPLACE FUNCTION public.search_companies(search_term text)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  logo text,
  background_image text,
  description text,
  website text,
  email text,
  phone text,
  address text,
  seo_title text,
  seo_description text,
  seo_keywords text[],
  about_seo_title text,
  about_seo_description text,
  jobs_seo_title text,
  jobs_seo_description text,
  is_verified boolean,
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
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