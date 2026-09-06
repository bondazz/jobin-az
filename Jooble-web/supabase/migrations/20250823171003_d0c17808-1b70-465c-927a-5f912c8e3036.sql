-- Add unique constraint to prevent duplicate referrals per user
ALTER TABLE public.referrals ADD CONSTRAINT referrals_user_id_unique UNIQUE (user_id);

-- Update the handle_new_user trigger to use ON CONFLICT DO NOTHING to prevent duplicates
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public 
AS $$
BEGIN
  -- Extract LinkedIn profile data or fallback to user input
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
  
  -- Auto-generate referral code for new users (only if doesn't exist)
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