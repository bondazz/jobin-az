-- 1) Restrict column-level access to sensitive contact fields on companies
REVOKE SELECT(email, phone) ON TABLE public.companies FROM anon;
REVOKE SELECT(email, phone) ON TABLE public.companies FROM authenticated;

-- 2) Harden existing SECURITY DEFINER functions to avoid leaking contact info
-- Replace get_all_companies to mask email/phone for non-admins
CREATE OR REPLACE FUNCTION public.get_all_companies()
RETURNS TABLE(
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
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    CASE WHEN public.get_user_role(auth.uid()) = 'admin' THEN c.email ELSE NULL END AS email,
    CASE WHEN public.get_user_role(auth.uid()) = 'admin' THEN c.phone ELSE NULL END AS phone,
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
$$;

-- Replace search_companies to mask email/phone for non-admins
CREATE OR REPLACE FUNCTION public.search_companies(search_term text)
RETURNS TABLE(
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
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    CASE WHEN public.get_user_role(auth.uid()) = 'admin' THEN c.email ELSE NULL END AS email,
    CASE WHEN public.get_user_role(auth.uid()) = 'admin' THEN c.phone ELSE NULL END AS phone,
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
$$;

-- 3) Admin-only RPC to fetch contact info for a single company (used by Admin UI)
CREATE OR REPLACE FUNCTION public.get_company_contact(company_uuid uuid)
RETURNS TABLE(email text, phone text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF public.get_user_role(auth.uid()) = 'admin' THEN
    RETURN QUERY
    SELECT c.email, c.phone
    FROM public.companies c
    WHERE c.id = company_uuid;
  ELSE
    -- Return nothing for non-admins
    RETURN QUERY SELECT NULL::text, NULL::text WHERE false;
  END IF;
END;
$$;