-- Restrict access to personal data in profiles
-- 1) Remove public read access
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- 2) Ensure clean slate for new granular read policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- 3) Create granular SELECT policies (no IF NOT EXISTS, for compatibility)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());