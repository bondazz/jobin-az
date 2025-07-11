-- Clean up any existing problematic admin data
DELETE FROM public.profiles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'info@jooble.az'
);

DELETE FROM auth.users WHERE email = 'info@jooble.az';