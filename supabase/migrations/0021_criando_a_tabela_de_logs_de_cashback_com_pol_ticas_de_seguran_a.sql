-- Criar um tipo para as transações de cashback
CREATE TYPE cashback_log_type AS ENUM ('credit', 'usage');

-- Criar a tabela para registrar os logs de cashback
CREATE TABLE public.cashback_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    type cashback_log_type NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.cashback_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança: Usuários podem ver apenas seus próprios logs.
CREATE POLICY "Users can view their own cashback logs"
ON public.cashback_logs
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Ninguém pode inserir, atualizar ou deletar logs diretamente (será feito por triggers/funções)