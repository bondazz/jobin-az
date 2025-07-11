-- Create admin user directly in database
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Insert admin user into auth.users (bypassing email confirmation)
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
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
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'info@jooble.az',
        crypt('Samir_1155', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"full_name": "Admin User"}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    ) RETURNING id INTO admin_user_id;

    -- Insert admin profile
    INSERT INTO public.profiles (user_id, full_name, role, is_active)
    VALUES (admin_user_id, 'Admin User', 'admin', true);

EXCEPTION WHEN unique_violation THEN
    -- User already exists, just update profile to admin
    UPDATE public.profiles 
    SET role = 'admin' 
    WHERE user_id = (
        SELECT id FROM auth.users WHERE email = 'info@jooble.az'
    );
END $$;