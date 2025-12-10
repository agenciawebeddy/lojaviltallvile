-- Permitir que qualquer pessoa autenticada ou não possa ler os ícones
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'social-icons');

-- Permitir que apenas o administrador possa inserir, atualizar ou deletar ícones
CREATE POLICY "Admin can manage social icons" ON storage.objects
FOR ALL TO authenticated USING (auth.email() = 'edsonantonio@webeddy.com.br'::text) WITH CHECK (auth.email() = 'edsonantonio@webeddy.com.br'::text);