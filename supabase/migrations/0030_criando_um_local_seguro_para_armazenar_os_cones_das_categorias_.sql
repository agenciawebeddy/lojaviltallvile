-- Create a new bucket for category icons
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('category-icons', 'category-icons', true, 1048576, ARRAY['image/svg+xml', 'image/png'])
ON CONFLICT (id) DO NOTHING;

-- RLS policies for the new bucket
CREATE POLICY "Category icons are publicly accessible."
ON storage.objects FOR SELECT
USING ( bucket_id = 'category-icons' );

CREATE POLICY "Admin can insert category icons."
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'category-icons' AND auth.email() = 'edsonantonio@webeddy.com.br'::text );

CREATE POLICY "Admin can update category icons."
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'category-icons' AND auth.email() = 'edsonantonio@webeddy.com.br'::text );

CREATE POLICY "Admin can delete category icons."
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'category-icons' AND auth.email() = 'edsonantonio@webeddy.com.br'::text );