DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recriando o trigger para chamar apenas handle_new_user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();