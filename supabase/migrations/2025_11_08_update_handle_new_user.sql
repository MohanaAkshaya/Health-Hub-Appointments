-- Update the handle_new_user function to NOT automatically assign patient role
-- since role is now selected during signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email
  );

  -- Role is now assigned during signup, not automatically
  -- So we don't insert into user_roles here anymore

  RETURN NEW;
END;
$$;
