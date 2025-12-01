-- Criar a tabela popups
CREATE TABLE public.popups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  button_text TEXT,
  button_link TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela popups
ALTER TABLE public.popups ENABLE ROW LEVEL SECURITY;

-- Política para administradores (edsonantonio@webeddy.com.br) poderem gerenciar (CRUD) popups
CREATE POLICY "Admins can manage popups" ON public.popups
FOR ALL TO authenticated
USING (auth.email() = 'edsonantonio@webeddy.com.br')
WITH CHECK (auth.email() = 'edsonantonio@webeddy.com.br');

-- Política para usuários públicos (não autenticados) e autenticados poderem ler popups ativos
CREATE POLICY "Public and authenticated can read active popups" ON public.popups
FOR SELECT
USING (is_active = TRUE);