-- Primeiro, removemos qualquer trigger existente com este nome na tabela auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Em seguida, recriamos o trigger para chamar APENAS a função handle_new_user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();