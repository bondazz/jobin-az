-- Create blog_authors table for author schema
CREATE TABLE public.blog_authors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  twitter TEXT,
  linkedin TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blogs table with comprehensive SEO fields
CREATE TABLE public.blogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author_id UUID REFERENCES public.blog_authors(id),
  
  -- SEO Fields
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  h1_title TEXT,
  canonical_url TEXT,
  
  -- Open Graph
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  
  -- Twitter
  twitter_title TEXT,
  twitter_description TEXT,
  
  -- Schema.org
  schema_type TEXT DEFAULT 'Article',
  
  -- Publishing
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  reading_time_minutes INTEGER,
  
  -- Stats
  views INTEGER DEFAULT 0,
  
  -- Settings
  is_active BOOLEAN DEFAULT true,
  allow_comments BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog_links table for tracking internal/external links
CREATE TABLE public.blog_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id UUID NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  anchor_text TEXT,
  link_type TEXT NOT NULL CHECK (link_type IN ('internal', 'external')),
  rel_attributes TEXT[] DEFAULT ARRAY['noopener'], -- noopener, noreferrer, nofollow, dofollow
  is_dofollow BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog_categories table
CREATE TABLE public.blog_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  seo_title TEXT,
  seo_description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog_to_categories junction table
CREATE TABLE public.blog_to_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id UUID NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.blog_categories(id) ON DELETE CASCADE,
  UNIQUE(blog_id, category_id)
);

-- Enable RLS
ALTER TABLE public.blog_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_to_categories ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Blog authors are viewable by everyone" ON public.blog_authors FOR SELECT USING (is_active = true);
CREATE POLICY "Published blogs are viewable by everyone" ON public.blogs FOR SELECT USING (is_active = true AND is_published = true);
CREATE POLICY "Blog links are viewable by everyone" ON public.blog_links FOR SELECT USING (true);
CREATE POLICY "Blog categories are viewable by everyone" ON public.blog_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Blog to categories are viewable by everyone" ON public.blog_to_categories FOR SELECT USING (true);

-- Admin policies (for authenticated admins)
CREATE POLICY "Admins can manage blog authors" ON public.blog_authors FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admins can manage blogs" ON public.blogs FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admins can manage blog links" ON public.blog_links FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admins can manage blog categories" ON public.blog_categories FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admins can manage blog to categories" ON public.blog_to_categories FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Function to calculate reading time
CREATE OR REPLACE FUNCTION public.calculate_reading_time(content TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  word_count INTEGER;
  words_per_minute INTEGER := 200;
BEGIN
  -- Strip HTML tags and count words
  word_count := array_length(regexp_split_to_array(regexp_replace(content, '<[^>]*>', '', 'g'), '\s+'), 1);
  RETURN GREATEST(1, CEIL(word_count::DECIMAL / words_per_minute));
END;
$$;

-- Trigger to auto-calculate reading time
CREATE OR REPLACE FUNCTION public.set_blog_reading_time()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.reading_time_minutes := public.calculate_reading_time(NEW.content);
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_set_blog_reading_time
BEFORE INSERT OR UPDATE OF content ON public.blogs
FOR EACH ROW
EXECUTE FUNCTION public.set_blog_reading_time();

-- Trigger to update updated_at
CREATE TRIGGER update_blog_authors_updated_at
BEFORE UPDATE ON public.blog_authors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blogs_updated_at
BEFORE UPDATE ON public.blogs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_categories_updated_at
BEFORE UPDATE ON public.blog_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to increment blog views
CREATE OR REPLACE FUNCTION public.increment_blog_views(blog_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE blogs SET views = views + 1 WHERE id = blog_id AND is_active = true AND is_published = true;
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_blogs_slug ON public.blogs(slug);
CREATE INDEX idx_blogs_published ON public.blogs(is_published, is_active);
CREATE INDEX idx_blogs_author ON public.blogs(author_id);
CREATE INDEX idx_blog_authors_slug ON public.blog_authors(slug);
CREATE INDEX idx_blog_categories_slug ON public.blog_categories(slug);