-- Create custom_pages table for manual SEO pages
CREATE TABLE public.custom_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  seo_title TEXT NOT NULL,
  seo_description TEXT,
  seo_keywords TEXT[] DEFAULT '{}',
  canonical_url TEXT,
  content TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT DEFAULT 'https://jooble.az/icons/icon-512x512.jpg',
  twitter_title TEXT,
  twitter_description TEXT,
  schema_type TEXT DEFAULT 'WebPage',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Custom pages are viewable by everyone" 
ON public.custom_pages 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can do everything on custom_pages" 
ON public.custom_pages 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_custom_pages_updated_at
BEFORE UPDATE ON public.custom_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();