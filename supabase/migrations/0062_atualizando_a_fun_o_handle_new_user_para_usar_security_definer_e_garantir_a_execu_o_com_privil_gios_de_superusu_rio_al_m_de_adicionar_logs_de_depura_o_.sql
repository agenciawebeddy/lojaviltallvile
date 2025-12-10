CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Revertido para SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RAISE NOTICE 'handle_new_user: Iniciando inserção de perfil para user ID: %', NEW.id;
  
  INSERT INTO public.profiles (id, full_name, saldo_cashback)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', 0.00);
  
  RAISE NOTICE 'handle_new_user: Perfil inserido com sucesso para user ID: %', NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Captura qualquer erro e registra um WARNING, mas permite que a transação continue
    RAISE WARNING 'handle_new_user: Erro ao inserir perfil para user ID %: %', NEW.id, SQLERRM;
    -- Se a inserção do perfil falhar, ainda queremos que o usuário seja criado.
    -- Retornar NEW aqui permite que a transação principal (criação do usuário) continue.
    RETURN NEW; 
END;
$$;

-- Conceder permissão de execução para o papel 'anon' e 'authenticated'
-- Isso é importante para que o trigger possa ser executado mesmo por usuários não autenticados (durante o signup)
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;