ALTER TABLE public.store_settings
ADD COLUMN free_shipping_message TEXT DEFAULT 'FRETE GRÁTIS PARA TODOS OS PEDIDOS ACIMA DE {threshold}';

-- Atualiza o valor padrão para o registro existente (id=1)
UPDATE public.store_settings
SET free_shipping_message = 'FRETE GRÁTIS PARA TODOS OS PEDIDOS ACIMA DE {threshold}'
WHERE id = 1;