-- Tabela para armazenar os slides do Hero
CREATE TABLE public.hero_slides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  button_text TEXT,
  button_link TEXT,
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (OBRIGATÓRIO)
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança: Apenas o administrador pode gerenciar (CRUD)
CREATE POLICY "Admin can manage hero slides" ON public.hero_slides
FOR ALL TO authenticated USING (auth.email() = 'edsonantonio@webeddy.com.br'::text) WITH CHECK (auth.email() = 'edsonantonio@webeddy.com.br'::text);

-- Política de leitura: Todos podem ler os slides ativos
CREATE POLICY "Public read active hero slides" ON public.hero_slides
FOR SELECT USING (is_active = TRUE);