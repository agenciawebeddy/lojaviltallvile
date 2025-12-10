-- Função para lidar com o crédito de cashback
CREATE OR REPLACE FUNCTION public.handle_cashback_credit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    cashback_amount NUMERIC;
BEGIN
    -- Calcula o cashback (5% do total do pedido)
    cashback_amount := NEW.total_amount * 0.05;

    -- Apenas credita se o status mudou para 'Pago' e não era 'Pago' antes
    IF NEW.status = 'Pago' AND OLD.status <> 'Pago' THEN
        -- Adiciona o cashback ao saldo do usuário
        UPDATE public.profiles
        SET saldo_cashback = saldo_cashback + cashback_amount
        WHERE id = NEW.user_id;

        -- Insere um registro no log de cashback
        INSERT INTO public.cashback_logs (user_id, order_id, type, amount, description)
        VALUES (NEW.user_id, NEW.id, 'credit', cashback_amount, 'Cashback referente ao pedido #' || substr(NEW.id::text, 1, 8));
    END IF;

    RETURN NEW;
END;
$$;

-- Gatilho que aciona a função após uma atualização na tabela de pedidos
DROP TRIGGER IF EXISTS on_order_paid ON public.orders;
CREATE TRIGGER on_order_paid
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_cashback_credit();