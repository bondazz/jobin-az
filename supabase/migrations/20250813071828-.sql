-- Restrict access to personal data in profiles
-- 1) Remove public read access
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- 2) Allow admins to read all profiles
CREATE POLICY IF NOT EXISTS "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.get_user_role(auth.uid()) = 'admin');

-- 3) Allow users to read only their own profile
CREATE POLICY IF NOT EXISTS "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());