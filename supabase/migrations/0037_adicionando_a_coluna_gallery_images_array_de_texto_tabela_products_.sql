ALTER TABLE public.products
ADD COLUMN gallery_images TEXT[] DEFAULT '{}';

-- Atualizando a política de UPDATE para incluir a nova coluna
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products
FOR ALL
TO "authenticated"
USING (auth.email() = 'edsonantonio@webeddy.com.br'::text)
WITH CHECK (auth.email() = 'edsonantonio@webeddy.com.br'::text);