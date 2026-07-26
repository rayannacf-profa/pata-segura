INSERT INTO public.user_roles (user_id, role)
SELECT u.id, CASE WHEN lower(u.email) = lower('PataSegura1.0@gmail.com') THEN 'admin'::public.app_role ELSE 'visitor'::public.app_role END
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id)
ON CONFLICT DO NOTHING;