-- Adicionar a coluna para o saldo de cashback na tabela de perfis
ALTER TABLE public.profiles
ADD COLUMN saldo_cashback NUMERIC(10, 2) DEFAULT 0.00 NOT NULL;