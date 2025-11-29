ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS sender_name TEXT,
ADD COLUMN IF NOT EXISTS sender_phone TEXT,
ADD COLUMN IF NOT EXISTS sender_document TEXT,
ADD COLUMN IF NOT EXISTS sender_address TEXT;