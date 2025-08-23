-- Update the handle_new_user trigger to extract LinkedIn profile data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public' 
AS $$
BEGIN
  -- Extract data from LinkedIn or regular signup
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
      CONCAT(
        COALESCE(new.raw_user_meta_data ->> 'first_name', ''),
        ' ',
        COALESCE(new.raw_user_meta_data ->> 'last_name', '')
      ),
      new.email
    ),
    COALESCE(new.raw_user_meta_data ->> 'first_name', split_part(new.raw_user_meta_data ->> 'full_name', ' ', 1)),
    COALESCE(new.raw_user_meta_data ->> 'last_name', split_part(new.raw_user_meta_data ->> 'full_name', ' ', 2)),
    COALESCE(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture'),
    'user'
  );
  
  -- Auto-generate referral code for new users
  INSERT INTO public.referrals (user_id, code)
  VALUES (
    new.id,
    CONCAT(
      SUBSTR(REPLACE(new.id::text, '-', ''), 1, 6),
      SUBSTR(MD5(RANDOM()::text), 1, 4)
    )
  );
  
  RETURN new;
END;
$$;