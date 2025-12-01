-- 1. Remover o trigger 'on_auth_user_created_notify_admin' da tabela auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_notify_admin ON auth.users;

-- 2. Remover o trigger 'notify_admin_on_new_user' da tabela auth.users (caso ainda exista)
DROP TRIGGER IF EXISTS notify_admin_on_new_user ON auth.users;

-- 3. Remover a função 'notify_admin_on_new_user()'
DROP FUNCTION IF EXISTS public.notify_admin_on_new_user();