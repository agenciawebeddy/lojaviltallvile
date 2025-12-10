-- Cria um bucket público para as imagens dos produtos
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Permite que qualquer pessoa visualize as imagens
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Permite que o administrador envie novas imagens
CREATE POLICY "Admin can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  auth.email() = 'edsonantonio@webeddy.com.br'
);

-- Permite que o administrador atualize as imagens
CREATE POLICY "Admin can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  auth.email() = 'edsonantonio@webeddy.com.br'
);

-- Permite que o administrador delete as imagens
CREATE POLICY "Admin can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  auth.email() = 'edsonantonio@webeddy.com.br'
);