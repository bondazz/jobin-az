-- Temporarily disable the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Clean up existing data
DELETE FROM public.profiles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'info@jooble.az'
);
DELETE FROM auth.users WHERE email = 'info@jooble.az';

-- Create admin user
DO $$
DECLARE
    admin_user_id uuid := gen_random_uuid();
BEGIN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      admin_user_id,
      'authenticated',
      'authenticated',
      'info@jooble.az',
      '$2a$10$6.mhOSKPsL9KiL7cP6Qo2egVT1/KqKJ4F1M.dE8qEKlzPt8PLF2gC',
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Admin User"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    -- Create admin profile
    INSERT INTO public.profiles (user_id, full_name, role, is_active)
    VALUES (admin_user_id, 'Admin User', 'admin', true);
END $$;

-- Re-enable the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();