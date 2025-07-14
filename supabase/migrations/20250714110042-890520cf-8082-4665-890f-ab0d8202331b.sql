-- Create advertisements table
CREATE TABLE public.advertisements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  position TEXT NOT NULL, -- 'header', 'sidebar', 'footer', 'content'
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  click_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Advertisements are viewable by everyone" 
ON public.advertisements 
FOR SELECT 
USING (is_active = true AND (start_date IS NULL OR start_date <= now()) AND (end_date IS NULL OR end_date >= now()));

CREATE POLICY "Admins can do everything on advertisements" 
ON public.advertisements 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_advertisements_updated_at
BEFORE UPDATE ON public.advertisements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to increment ad clicks
CREATE OR REPLACE FUNCTION public.increment_ad_clicks(ad_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  UPDATE advertisements 
  SET click_count = click_count + 1 
  WHERE id = ad_id AND is_active = true;
END;
$function$;