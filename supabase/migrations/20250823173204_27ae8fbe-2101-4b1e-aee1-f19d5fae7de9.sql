-- Fix LinkedIn registration duplicate issue by adding user_id constraint to profiles table too
-- and updating the trigger to be more robust

-- Add unique constraint to profiles table on user_id (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_unique'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

-- Update the handle_new_user trigger to be more robust against race conditions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public 
AS $$
BEGIN
  -- Use INSERT ... ON CONFLICT DO NOTHING for profiles
  INSERT INTO public.profiles (
    user_id, 
    full_name, 
    first_name, 
    last_name, 
    avatar_url, 
    role
  )
  VALUES (
    new.id, 
    COALESCE(
      new.raw_user_meta_data ->> 'full_name', 
      new.raw_user_meta_data ->> 'name',
      CONCAT(
        COALESCE(new.raw_user_meta_data ->> 'first_name', ''),
        ' ',
        COALESCE(new.raw_user_meta_data ->> 'last_name', '')
      ),
      new.email
    ),
    COALESCE(
      new.raw_user_meta_data ->> 'first_name', 
      new.raw_user_meta_data ->> 'given_name',
      split_part(COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), ' ', 1)
    ),
    COALESCE(
      new.raw_user_meta_data ->> 'last_name', 
      new.raw_user_meta_data ->> 'family_name',
      split_part(COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), ' ', 2)
    ),
    COALESCE(
      new.raw_user_meta_data ->> 'avatar_url', 
      new.raw_user_meta_data ->> 'picture'
    ),
    'user'
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Use INSERT ... ON CONFLICT DO NOTHING for referrals with unique code generation
  INSERT INTO public.referrals (user_id, code)
  VALUES (
    new.id,
    CONCAT(
      SUBSTR(REPLACE(new.id::text, '-', ''), 1, 6),
      SUBSTR(MD5(RANDOM()::text), 1, 4)
    )
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$$;