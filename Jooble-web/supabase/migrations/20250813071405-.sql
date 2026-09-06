-- Harden wallets RLS: remove broad admin SELECT and keep owner-only access
-- 1) Drop permissive admin ALL policy that allowed SELECT
DROP POLICY IF EXISTS "Admins can do everything on wallets" ON public.wallets;

-- 2) Ensure clean slate for granular admin policies
DROP POLICY IF EXISTS "Admins can insert wallets" ON public.wallets;
DROP POLICY IF EXISTS "Admins can update wallets" ON public.wallets;
DROP POLICY IF EXISTS "Admins can delete wallets" ON public.wallets;

-- 3) Re-create granular admin policies without SELECT
CREATE POLICY "Admins can insert wallets"
ON public.wallets
FOR INSERT
TO authenticated
WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update wallets"
ON public.wallets
FOR UPDATE
TO authenticated
USING (public.get_user_role(auth.uid()) = 'admin')
WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can delete wallets"
ON public.wallets
FOR DELETE
TO authenticated
USING (public.get_user_role(auth.uid()) = 'admin');