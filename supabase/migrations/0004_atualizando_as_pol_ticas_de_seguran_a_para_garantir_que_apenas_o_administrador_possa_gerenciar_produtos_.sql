-- Remove a política antiga que permitia qualquer usuário logado gerenciar produtos
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;

-- Cria uma nova política de segurança que permite apenas ao e-mail do administrador gerenciar produtos
CREATE POLICY "Admins can manage products" ON public.products
FOR ALL TO authenticated
USING (auth.email() = 'edsonantonio@webeddy.com.br')
WITH CHECK (auth.email() = 'edsonantonio@webeddy.com.br');