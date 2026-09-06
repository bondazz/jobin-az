-- Create regions table with same structure as categories
CREATE TABLE public.regions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    h1_title TEXT,
    icon TEXT,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Regions are viewable by everyone" 
ON public.regions 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can do everything on regions" 
ON public.regions 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::text);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_regions_updated_at
BEFORE UPDATE ON public.regions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for slug lookups
CREATE INDEX idx_regions_slug ON public.regions(slug);
CREATE INDEX idx_regions_is_active ON public.regions(is_active);