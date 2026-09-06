-- Fix infinite recursion in RLS policies by creating security definer functions
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can do everything on jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can do everything on categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can do everything on companies" ON public.companies;
DROP POLICY IF EXISTS "Admins can do everything on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can do everything on site_settings" ON public.site_settings;

-- Create new policies using security definer function
CREATE POLICY "Admins can do everything on jobs" ON public.jobs 
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can do everything on categories" ON public.categories 
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can do everything on companies" ON public.companies 
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can do everything on profiles" ON public.profiles 
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can do everything on site_settings" ON public.site_settings 
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Create trigger to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.email),
    'user'
  );
  RETURN new;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data
-- First insert categories
INSERT INTO public.categories (name, slug, description, icon, seo_title, seo_description, is_active) VALUES
('Proqramlaşdırma', 'programming', 'Proqram təminatı və veb inkişaf işləri', 'code', 'Proqramlaşdırma İşləri', 'Azərbaycanda ən yaxşı proqramlaşdırma vakansiyaları', true),
('Dizayn', 'design', 'Qrafik dizayn və UI/UX işləri', 'palette', 'Dizayn İşləri', 'Yaradıcı dizayn vakansiyaları', true),
('Marketinq', 'marketing', 'Rəqəmsal marketinq və satış işləri', 'megaphone', 'Marketinq İşləri', 'Marketinq və satış vakansiyaları', true),
('Maliyyə', 'finance', 'Maliyyə və mühasibat işləri', 'dollar-sign', 'Maliyyə İşləri', 'Maliyyə sahəsində iş imkanları', true),
('İnsan Resursları', 'hr', 'HR və kadr işləri', 'users', 'İnsan Resursları İşləri', 'HR və kadr idarəetməsi vakansiyaları', true);

-- Insert companies
INSERT INTO public.companies (name, slug, description, website, email, is_verified, is_active) VALUES
('TechCorp Azerbaijan', 'techcorp-az', 'Azərbaycanda aparıcı texnologiya şirkəti', 'https://techcorp.az', 'hr@techcorp.az', true, true),
('Digital Solutions', 'digital-solutions', 'Rəqəmsal həllər və xidmətlər şirkəti', 'https://digitalsolutions.az', 'careers@digitalsolutions.az', true, true),
('Creative Agency', 'creative-agency', 'Yaradıcı reklam agentliyi', 'https://creative.az', 'jobs@creative.az', false, true),
('Finance Plus', 'finance-plus', 'Maliyyə xidmətləri şirkəti', 'https://financeplus.az', 'hr@financeplus.az', true, true),
('StartupHub', 'startuphub', 'Startaplar üçün inkubator', 'https://startuphub.az', 'talent@startuphub.az', false, true);

-- Insert some sample jobs (referencing the inserted categories and companies)
INSERT INTO public.jobs (
  title, 
  company_id, 
  location, 
  type, 
  salary, 
  description, 
  requirements, 
  benefits, 
  tags, 
  category_id, 
  application_url, 
  slug, 
  seo_title, 
  seo_description, 
  is_active
) 
SELECT 
  'Senior React Developer',
  c.id,
  'Bakı, Azərbaycan',
  'full-time',
  '2000-3000 AZN',
  'React.js ilə frontend tətbiqləri yaratmaq üçün təcrübəli developer axtarırıq.',
  ARRAY['React.js', 'TypeScript', 'Node.js', '3+ il təcrübə'],
  ARRAY['Əla maaş', 'Sağlamlıq sığortası', 'Fleksibel iş saatları'],
  ARRAY['premium', 'new'],
  cat.id,
  'https://techcorp.az/careers/react-developer',
  'senior-react-developer-techcorp',
  'Senior React Developer - TechCorp',
  'TechCorp-da Senior React Developer vəzifəsi üçün müraciət edin',
  true
FROM public.companies c, public.categories cat
WHERE c.slug = 'techcorp-az' AND cat.slug = 'programming'
LIMIT 1;

INSERT INTO public.jobs (
  title, 
  company_id, 
  location, 
  type, 
  salary, 
  description, 
  requirements, 
  benefits, 
  tags, 
  category_id, 
  application_url, 
  slug, 
  seo_title, 
  seo_description, 
  is_active
) 
SELECT 
  'UI/UX Designer',
  c.id,
  'Bakı, Azərbaycan',
  'full-time',
  '1500-2200 AZN',
  'Yaradıcı UI/UX dizayner komandamıza qoşulmaq istəyirsiniz?',
  ARRAY['Figma', 'Adobe XD', 'Prototyping', '2+ il təcrübə'],
  ARRAY['Yaradıcı mühit', 'Treninqlər', 'Komanda tədbirləri'],
  ARRAY['new', 'remote'],
  cat.id,
  'https://creative.az/careers/ui-ux-designer',
  'ui-ux-designer-creative-agency',
  'UI/UX Designer - Creative Agency',
  'Creative Agency-də UI/UX Designer işi',
  true
FROM public.companies c, public.categories cat
WHERE c.slug = 'creative-agency' AND cat.slug = 'design'
LIMIT 1;

-- Insert site settings
INSERT INTO public.site_settings (key, value, description) VALUES
('site_title', '"İş Portalı"', 'Saytın əsas başlığı'),
('site_description', '"Azərbaycanda ən yaxşı iş imkanlarını kəşf edin"', 'Saytın təsviri'),
('contact_email', '"info@jobportal.az"', 'Əlaqə email adresi'),
('contact_phone', '"+994 12 345 67 89"', 'Əlaqə telefon nömrəsi'),
('seo_meta_title', '"İş Portalı - Azərbaycanda ən yaxşı vakansiyalar"', 'Əsas SEO başlıq'),
('seo_meta_description', '"Azərbaycanda minlərlə iş elanı. İdeal işinizi tapın və karyeranızı inkişaf etdirin."', 'Əsas SEO təsvir')
ON CONFLICT (key) DO NOTHING;