CREATE TABLE public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to insert contact messages"
ON public.contact_messages FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow public users to insert contact messages"
ON public.contact_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin to view all contact messages"
ON public.contact_messages FOR SELECT TO authenticated USING (auth.email() = 'edsonantonio@webeddy.com.br');