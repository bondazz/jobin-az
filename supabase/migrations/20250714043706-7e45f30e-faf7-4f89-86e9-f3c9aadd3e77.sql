-- Create pricing plans table
CREATE TABLE public.pricing_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  period TEXT NOT NULL,
  description TEXT NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  icon TEXT NOT NULL DEFAULT 'Star',
  is_popular BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create about page content table
CREATE TABLE public.about_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_type TEXT NOT NULL, -- 'header', 'stats', 'mission', 'features', 'contact'
  title TEXT,
  description TEXT,
  content JSONB, -- For flexible content storage
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feature comparison table for pricing
CREATE TABLE public.pricing_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  basic_plan BOOLEAN NOT NULL DEFAULT false,
  premium_plan BOOLEAN NOT NULL DEFAULT false,
  enterprise_plan BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_features ENABLE ROW LEVEL SECURITY;

-- Create policies for pricing_plans
CREATE POLICY "Admins can do everything on pricing_plans" 
ON public.pricing_plans 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Pricing plans are viewable by everyone" 
ON public.pricing_plans 
FOR SELECT 
USING (is_active = true);

-- Create policies for about_content
CREATE POLICY "Admins can do everything on about_content" 
ON public.about_content 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "About content is viewable by everyone" 
ON public.about_content 
FOR SELECT 
USING (is_active = true);

-- Create policies for pricing_features
CREATE POLICY "Admins can do everything on pricing_features" 
ON public.pricing_features 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Pricing features are viewable by everyone" 
ON public.pricing_features 
FOR SELECT 
USING (is_active = true);

-- Create triggers for updated_at
CREATE TRIGGER update_pricing_plans_updated_at
BEFORE UPDATE ON public.pricing_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_about_content_updated_at
BEFORE UPDATE ON public.about_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pricing_features_updated_at
BEFORE UPDATE ON public.pricing_features
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default pricing plans
INSERT INTO public.pricing_plans (name, price, period, description, features, icon, is_popular, display_order) VALUES
('Əsas', '0', 'aylıq', 'İş axtaranlar üçün əsas funksiyalar', 
 ARRAY['Limitsiz iş axtarışı', 'Əsas süzgəclər', 'Profil yaratma', 'İş elanlarına müraciət', 'E-poçt bildirişləri'], 
 'Star', false, 1),
('Premium', '29', 'aylıq', 'Daha çox imkan və üstünlük', 
 ARRAY['Bütün əsas funksiyalar', 'Premium iş elanları', 'Prioritet dəstək', 'Genişləndirilmiş süzgəclər', 'CV analizi', 'Şirkətlərlə birbaşa əlaqə', 'Məxfi profil rejimi'], 
 'Zap', true, 2),
('Şirkət', '99', 'aylıq', 'İşəgötürənlər üçün tam həll', 
 ARRAY['Bütün premium funksiyalar', 'Limitsiz iş elanı', 'Namizəd bazası', 'Detallı analitika', 'Şirkət səhifəsi', 'Çoxlu istifadəçi', 'API inteqrasiyası', 'Xüsusi dəstək meneceri'], 
 'Crown', false, 3);

-- Insert default pricing features
INSERT INTO public.pricing_features (category, feature_name, basic_plan, premium_plan, enterprise_plan, display_order) VALUES
('İş Axtarışı', 'Əsas axtarış', true, true, true, 1),
('İş Axtarışı', 'Genişləndirilmiş süzgəclər', false, true, true, 2),
('İş Axtarışı', 'Saxlanılan axtarışlar', false, true, true, 3),
('İş Axtarışı', 'AI tövsiyələri', false, true, true, 4),
('Profil və CV', 'Əsas profil', true, true, true, 1),
('Profil və CV', 'CV yükləmə', true, true, true, 2),
('Profil və CV', 'CV analizi', false, true, true, 3),
('Profil və CV', 'Məxfi profil', false, true, true, 4),
('Dəstək', 'E-poçt dəstəyi', true, true, true, 1),
('Dəstək', 'Prioritet dəstək', false, true, true, 2),
('Dəstək', 'Telefon dəstəyi', false, false, true, 3),
('Dəstək', 'Xüsusi menecer', false, false, true, 4);

-- Insert default about content
INSERT INTO public.about_content (section_type, title, description, content, display_order) VALUES
('header', 'Jooble Haqqında', 'Azərbaycan''ın ən böyük iş axtarış platforması. Minlərlə iş elanı və yüzlərlə şirkət bir yerdə.', 
 '{"subtitle": "Azərbaycan''ın ən böyük iş axtarış platforması"}', 1),
('stats', 'Statistikalar', '', 
 '[{"label": "Aktiv İstifadəçilər", "value": "500K+", "icon": "Users", "color": "text-blue-500"}, 
   {"label": "İş Elanları", "value": "50K+", "icon": "Target", "color": "text-green-500"}, 
   {"label": "Uğurlu Yerləşdirmələr", "value": "25K+", "icon": "Award", "color": "text-purple-500"}, 
   {"label": "Şəhərlər", "value": "100+", "icon": "Globe", "color": "text-orange-500"}]', 2),
('mission', 'Bizim Missiyamız', 'Jooble olaraq, Azərbaycan''da iş axtaranlar və işəgötürənlər arasında körpü qurmaq, keyfiyyətli iş imkanları yaratmaq və karyera inkişafına dəstək olmaq məqsədindəyik. Platformamız vasitəsilə minlərlə insanın arzuladığı işə qovuşmasına kömək edirək.', '{}', 3),
('features', 'Nə Təklif Edirik', '', 
 '[{"title": "Asan Axtarış", "description": "Güclü axtarış mühərriki ilə arzuladığınız işi asanlıqla tapın.", "icon": "🔍"}, 
   {"title": "Premium Elanlar", "description": "Yüksək keyfiyyətli və yoxlanılmış premium iş elanları.", "icon": "⭐"}, 
   {"title": "Şirkət Profili", "description": "Şirkətlər haqqında ətraflı məlumat və reytinqlər.", "icon": "🏢"}, 
   {"title": "24/7 Dəstək", "description": "Hər zaman hazır olan peşəkar dəstək komandası.", "icon": "💬"}]', 4),
('contact', 'Bizimlə Əlaqə', 'Suallarınızı, təkliflərinizi və ya iş təkliflərinizi bizə göndərin. Komandamız sizinlə əlaqə saxlamaqdan məmnun olacaq.', 
 '[{"type": "email", "value": "info@jooble.az", "icon": "📧"}, 
   {"type": "phone", "value": "+994 12 345 67 89", "icon": "📞"}, 
   {"type": "address", "value": "Bakı, Azərbaycan", "icon": "📍"}]', 5);