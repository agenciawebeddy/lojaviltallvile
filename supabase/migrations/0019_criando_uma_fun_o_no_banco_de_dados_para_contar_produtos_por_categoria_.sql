CREATE OR REPLACE FUNCTION get_categories_with_product_count()
RETURNS TABLE(
    id UUID,
    name TEXT,
    "imageUrl" TEXT,
    created_at TIMESTAMPTZ,
    product_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.name,
        c."imageUrl",
        c.created_at,
        COUNT(p.id) AS product_count
    FROM
        public.categories c
    LEFT JOIN
        public.products p ON c.name = p.category
    GROUP BY
        c.id
    ORDER BY
        c.name ASC;
END;
$$;