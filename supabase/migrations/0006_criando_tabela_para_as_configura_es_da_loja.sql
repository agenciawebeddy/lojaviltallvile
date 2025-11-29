-- Cria a tabela para guardar as configurações da loja
CREATE TABLE public.store_settings (
  id INT PRIMARY KEY DEFAULT 1,
  store_name TEXT,
  contact_email TEXT,
  origin_postal_code TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Habilita a segurança de nível de linha
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Permite que o administrador veja as configurações
CREATE POLICY "Admin can view store settings"
ON public.store_settings FOR SELECT
TO authenticated
USING (auth.email() = 'edsonantonio@webeddy.com.br');

-- Permite que o administrador atualize as configurações
CREATE POLICY "Admin can update store settings"
ON public.store_settings FOR UPDATE
TO authenticated
USING (auth.email() = 'edsonantonio@webeddy.com.br');

-- Insere uma linha padrão para que possamos atualizá-la
INSERT INTO public.store_settings (id, store_name, contact_email, origin_postal_code)
VALUES (1, 'LojaEddy', 'contato@lojaeddy.com.br', '01001000')
ON CONFLICT (id) DO NOTHING;