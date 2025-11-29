CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RAISE NOTICE 'handle_new_user: Iniciando inserção de perfil para user ID: %', NEW.id;
  
  INSERT INTO public.profiles (id, full_name, saldo_cashback)
  VALUES (NEW.id, NEW.user_metadata ->> 'full_name', 0.00);
  
  RAISE NOTICE 'handle_new_user: Perfil inserido com sucesso para user ID: %', NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: Erro ao inserir perfil para user ID %: %', NEW.id, SQLERRM;
    RETURN NEW; 
END;
$$;