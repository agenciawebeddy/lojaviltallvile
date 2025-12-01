-- Adicionar colunas para gerenciar o cashback na tabela de configurações
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS cashback_is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS cashback_percentage NUMERIC(5, 2) DEFAULT 5.00;

-- Atualizar a função de crédito de cashback para usar os valores da tabela de configurações
CREATE OR REPLACE FUNCTION public.handle_cashback_credit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    cashback_amount NUMERIC;
    settings_cashback_percentage NUMERIC;
    settings_cashback_is_active BOOLEAN;
BEGIN
    -- Buscar as configurações de cashback da loja
    SELECT cashback_percentage, cashback_is_active
    INTO settings_cashback_percentage, settings_cashback_is_active
    FROM public.store_settings
    WHERE id = 1;

    -- Apenas executa se o cashback estiver ativo nas configurações
    IF settings_cashback_is_active THEN
        -- Calcula o cashback com base na porcentagem definida
        cashback_amount := NEW.total_amount * (settings_cashback_percentage / 100.0);

        -- Apenas credita se o status mudou para 'Pago' e não era 'Pago' antes
        IF NEW.status = 'Pago' AND OLD.status <> 'Pago' THEN
            -- Adiciona o cashback ao saldo do usuário
            UPDATE public.profiles
            SET saldo_cashback = saldo_cashback + cashback_amount
            WHERE id = NEW.user_id;

            -- Insere um registro no log de cashback
            INSERT INTO public.cashback_logs (user_id, order_id, type, amount, description)
            VALUES (NEW.user_id, NEW.id, 'credit', cashback_amount, 'Cashback de ' || settings_cashback_percentage || '% referente ao pedido #' || substr(NEW.id::text, 1, 8));
        END IF;
    END IF;

    RETURN NEW;
END;
$function$;