-- Tabela para armazenar cabeçalhos de páginas estáticas (Sobre, Tecnologia, etc.)
CREATE TABLE public.page_headers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug TEXT NOT NULL UNIQUE, -- Ex: 'sobre', 'tecnologia'
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Obrigatório)
ALTER TABLE public.page_headers ENABLE ROW LEVEL SECURITY;

-- Policy: Administradores podem gerenciar (CRUD)
CREATE POLICY "Admins can manage page headers" ON public.page_headers 
FOR ALL TO authenticated 
USING (auth.email() = 'edsonantonio@webeddy.com.br'::text) 
WITH CHECK (auth.email() = 'edsonantonio@webeddy.com.br'::text);

-- Policy: Público pode ler
CREATE POLICY "Public can read page headers" ON public.page_headers 
FOR SELECT USING (true);

-- Inserir dados iniciais para as páginas existentes
INSERT INTO public.page_headers (page_slug, title, description, image_url)
VALUES 
('sobre', 'Sobre a LojaEddy', 'Conectando você aos melhores produtos com paixão e tecnologia.', 'https://picsum.photos/seed/about/1920/300'),
('tecnologia', 'Tecnologia e Recursos da Loja', 'Conheça a arquitetura moderna e as funcionalidades que tornam a VitalVillé rápida e segura.', 'https://picsum.photos/seed/tech/1920/300')
ON CONFLICT (page_slug) DO NOTHING;