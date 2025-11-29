-- Create the products table
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  price NUMERIC(10, 2) NOT NULL,
  "imageUrl" TEXT,
  rating NUMERIC(2, 1) DEFAULT 5.0,
  description TEXT,
  weight NUMERIC(10, 2), -- in kg
  height NUMERIC(10, 2), -- in cm
  width NUMERIC(10, 2),  -- in cm
  length NUMERIC(10, 2), -- in cm
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to all products
CREATE POLICY "Public can read products" ON public.products
FOR SELECT USING (true);

-- Policy: Allow authenticated users (admins) to insert, update, and delete products
CREATE POLICY "Authenticated users can manage products" ON public.products
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);