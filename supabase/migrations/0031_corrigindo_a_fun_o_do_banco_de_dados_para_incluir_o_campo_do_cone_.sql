-- Add icon_url column to categories table if it doesn't exist
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS icon_url TEXT;

-- Drop the existing function to allow changing its return signature
DROP FUNCTION IF EXISTS public.get_categories_with_product_count();

-- Recreate the function with the new icon_url column in its return type
CREATE OR REPLACE FUNCTION public.get_categories_with_product_count()
 RETURNS TABLE(id uuid, name text, "imageUrl" text, icon_url text, created_at timestamp with time zone, product_count bigint)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.name,
        c."imageUrl",
        c.icon_url, -- Added icon_url
        c.created_at,
        COUNT(p.id) AS product_count
    FROM
        public.categories c
    LEFT JOIN
        public.products p ON c.name = ANY(p.category)
    GROUP BY
        c.id
    ORDER BY
        c.name ASC;
END;
$function$