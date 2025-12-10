-- 1. Create the categories table
CREATE TABLE public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    "imageUrl" TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
-- Allow public read access
CREATE POLICY "Public can read categories" ON public.categories
FOR SELECT USING (true);

-- Allow admin to manage categories
CREATE POLICY "Admin can manage categories" ON public.categories
FOR ALL USING (auth.email() = 'edsonantonio@webeddy.com.br')
WITH CHECK (auth.email() = 'edsonantonio@webeddy.com.br');