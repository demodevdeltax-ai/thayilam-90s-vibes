UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;

INSERT INTO public.profiles (id, full_name, phone)
SELECT u.id,
       COALESCE(u.raw_user_meta_data ->> 'full_name', ''),
       COALESCE(u.raw_user_meta_data ->> 'phone', '')
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

DO $$
DECLARE
  uid uuid;
  admin_exists boolean;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE email = 'tech.deltax@gmail.com' LIMIT 1;
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE role = 'admin') INTO admin_exists;
  IF uid IS NOT NULL AND NOT admin_exists THEN
    DELETE FROM public.user_roles WHERE user_id = uid;
    INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin');
  END IF;
END $$;