-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

-- Create storage policies for image uploads
CREATE POLICY "Anyone can view images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'images' AND auth.role() = 'authenticated');