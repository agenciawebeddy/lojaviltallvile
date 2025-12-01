-- Recriando a função handle_new_user para garantir que ela esteja correta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RAISE NOTICE 'handle_new_user: Iniciando inserção de perfil para user ID: %', NEW.id;
  
  INSERT INTO public.profiles (id, full_name, saldo_cashback)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', 0.00);
  
  RAISE NOTICE 'handle_new_user: Perfil inserido com sucesso para user ID: %', NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: Erro ao inserir perfil para user ID %: %', NEW.id, SQLERRM;
    RETURN NEW; 
END;
$$;

-- Verificando e recriando o trigger on_auth_user_created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();