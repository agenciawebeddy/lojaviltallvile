ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS free_shipping_is_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS free_shipping_threshold NUMERIC(10, 2) DEFAULT 250.00;