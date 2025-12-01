-- Remove a política antiga que era restrita apenas ao e-mail do admin
DROP POLICY IF EXISTS "Admin can view store settings" ON public.store_settings;

-- Cria uma nova política que permite a leitura por qualquer serviço autenticado (como a nossa função de frete)
CREATE POLICY "Allow authenticated read access to settings"
ON public.store_settings FOR SELECT
TO authenticated
USING (true);