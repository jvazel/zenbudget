-- triggers for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, zen_mode_enabled)
  VALUES (new.id, new.email, split_part(new.email, '@', 1), true);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
