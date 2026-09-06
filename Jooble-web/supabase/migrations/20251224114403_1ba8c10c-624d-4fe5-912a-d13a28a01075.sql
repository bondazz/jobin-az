-- Drop existing policies
DROP POLICY IF EXISTS "Custom pages are viewable by everyone" ON public.custom_pages;
DROP POLICY IF EXISTS "Admins can do everything on custom_pages" ON public.custom_pages;

-- Create new policy for public read access (no auth required)
CREATE POLICY "Anyone can view active custom pages" 
ON public.custom_pages 
FOR SELECT 
TO anon, authenticated
USING (is_active = true);

-- Create policy for admin full access
CREATE POLICY "Admins can manage custom pages" 
ON public.custom_pages 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
