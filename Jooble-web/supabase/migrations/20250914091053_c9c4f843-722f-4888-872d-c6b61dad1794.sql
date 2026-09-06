-- Create storage bucket for sitemaps
INSERT INTO storage.buckets (id, name, public) VALUES ('sitemaps', 'sitemaps', true);

-- Create policies for sitemap storage
CREATE POLICY "Sitemaps are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'sitemaps');

CREATE POLICY "Service role can manage sitemaps" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'sitemaps' AND auth.role() = 'service_role');

CREATE POLICY "Authenticated users can upload sitemaps" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'sitemaps' AND auth.role() = 'authenticated');