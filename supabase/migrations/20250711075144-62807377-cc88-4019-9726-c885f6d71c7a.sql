-- Clean up any existing data for this email
DELETE FROM public.profiles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'info@jooble.az'
);

DELETE FROM auth.users WHERE email = 'info@jooble.az';

-- Now create admin user with proper Supabase auth format
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
      '$2a$10$6.mhOSKPsL9KiL7cP6Qo2egVT1/KqKJ4F1M.dE8qEKlzPt8PLF2gC', -- This is 'Samir_1155' hashed with bcrypt
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

    -- Create profile for admin user
    INSERT INTO public.profiles (user_id, full_name, role, is_active)
    VALUES (admin_user_id, 'Admin User', 'admin', true);
END $$;