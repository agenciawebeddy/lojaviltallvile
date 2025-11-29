-- Primeiro, remove o trigger existente para evitar duplicatas ou problemas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recria o trigger para garantir que ele esteja apontando para a função correta
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();