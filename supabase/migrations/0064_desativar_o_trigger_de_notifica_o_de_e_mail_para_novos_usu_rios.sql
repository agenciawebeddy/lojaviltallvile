-- Primeiro, verifique o nome exato do trigger que chama notify_admin_on_new_user.
-- Se o trigger for 'on_auth_user_created', ele está chamando handle_new_user, não notify_admin_on_new_user.
-- Se você criou um NOVO trigger para notify_admin_on_new_user, por favor, forneça o nome dele.

-- Assumindo que o trigger que chama notify_admin_on_new_user se chama 'on_new_user_notify_admin' (exemplo)
-- DROP TRIGGER IF EXISTS on_new_user_notify_admin ON auth.users;

-- Se o trigger que você adicionou foi o 'on_auth_user_created' e você o modificou para chamar notify_admin_on_new_user,
-- então precisamos recriar o trigger para chamar handle_new_user novamente.
-- Por favor, confirme qual trigger está chamando notify_admin_on_new_user.

-- Se você não tem certeza, podemos tentar desabilitar o trigger 'on_auth_user_created'
-- e depois reabilitá-lo para chamar handle_new_user.
-- Mas o ideal é saber o nome do trigger que chama notify_admin_on_new_user.