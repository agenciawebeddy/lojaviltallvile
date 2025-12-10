-- Tabela para armazenar links de redes sociais
CREATE TABLE public.social_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  icon_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Obrigatório)
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança
-- 1. Leitura pública (todos podem ver os links)
CREATE POLICY "Public read access to social links" ON public.social_links 
FOR SELECT USING (true);

-- 2. Apenas o administrador pode gerenciar (inserir, atualizar, deletar)
CREATE POLICY "Admin can manage social links" ON public.social_links 
FOR ALL TO authenticated USING (auth.email() = 'edsonantonio@webeddy.com.br'::text) WITH CHECK (auth.email() = 'edsonantonio@webeddy.com.br'::text);