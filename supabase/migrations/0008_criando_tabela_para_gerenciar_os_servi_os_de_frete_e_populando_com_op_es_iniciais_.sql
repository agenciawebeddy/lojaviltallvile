-- Create the table to store shipping services
CREATE TABLE public.shipping_services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  service_id INTEGER NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for security
ALTER TABLE public.shipping_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only the admin can manage and view these settings
CREATE POLICY "Admin can manage shipping services"
ON public.shipping_services
FOR ALL
USING (auth.email() = 'edsonantonio@webeddy.com.br')
WITH CHECK (auth.email() = 'edsonantonio@webeddy.com.br');

-- Pre-populate with common services from Melhor Envio API
INSERT INTO public.shipping_services (name, service_id, is_active)
VALUES
  ('Correios PAC', 1, true),
  ('Correios SEDEX', 2, true),
  ('Jadlog .Package', 3, true),
  ('Jadlog .Com', 4, false);