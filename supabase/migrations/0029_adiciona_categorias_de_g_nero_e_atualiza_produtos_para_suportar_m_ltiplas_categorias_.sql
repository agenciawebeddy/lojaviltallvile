-- Etapa 1: Adicionar as categorias 'Masculino' e 'Feminino' se ainda não existirem
INSERT INTO public.categories (name, "imageUrl")
VALUES
    ('Masculino', 'https://picsum.photos/seed/masculino/300/300'),
    ('Feminino', 'https://picsum.photos/seed/feminino/300/300')
ON CONFLICT (name) DO NOTHING;

-- Etapa 2: Alterar a tabela de produtos para suportar um array de categorias
-- A cláusula USING converte o valor de texto único existente em um array com um único elemento.
ALTER TABLE public.products
ALTER COLUMN category TYPE TEXT[] USING ARRAY[category];

-- Etapa 3: Atualizar a função que conta produtos por categoria para funcionar com o array
CREATE OR REPLACE FUNCTION public.get_categories_with_product_count()
 RETURNS TABLE(id uuid, name text, "imageUrl" text, created_at timestamp with time zone, product_count bigint)
 LANGUAGE plpgsql
AS $function$
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
        public.products p ON c.name = ANY(p.category) -- Alterado para verificar dentro do array
    GROUP BY
        c.id
    ORDER BY
        c.name ASC;
END;
$function$;

-- Etapa 4: Atualizar a função de upsert de produtos para aceitar um array de categorias
CREATE OR REPLACE FUNCTION public.upsert_product_with_variants(p_product_data jsonb, p_variants_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_product_id UUID;
    v_variant JSONB;
    v_result JSONB;
    v_variant_ids_to_keep UUID[];
    v_categories TEXT[]; -- Variável para armazenar o array de categorias
BEGIN
    -- Converte o array JSON de categorias do input para um array TEXT do PostgreSQL
    SELECT array_agg(value)
    INTO v_categories
    FROM jsonb_array_elements_text(p_product_data -> 'category');

    -- Upsert do produto principal
    IF p_product_data ? 'id' AND p_product_data ->> 'id' IS NOT NULL THEN
        v_product_id := (p_product_data ->> 'id')::UUID;
        UPDATE public.products
        SET
            name = p_product_data ->> 'name',
            category = v_categories, -- Alterado para usar o array de categorias
            price = (p_product_data ->> 'price')::NUMERIC,
            "imageUrl" = p_product_data ->> 'imageUrl',
            description = p_product_data ->> 'description',
            weight = (p_product_data ->> 'weight')::NUMERIC,
            height = (p_product_data ->> 'height')::NUMERIC,
            width = (p_product_data ->> 'width')::NUMERIC,
            length = (p_product_data ->> 'length')::NUMERIC
        WHERE id = v_product_id;
    ELSE
        INSERT INTO public.products (name, category, price, "imageUrl", description, weight, height, width, length)
        VALUES (
            p_product_data ->> 'name',
            v_categories, -- Alterado para usar o array de categorias
            (p_product_data ->> 'price')::NUMERIC,
            p_product_data ->> 'imageUrl',
            p_product_data ->> 'description',
            (p_product_data ->> 'weight')::NUMERIC,
            (p_product_data ->> 'height')::NUMERIC,
            (p_product_data ->> 'width')::NUMERIC,
            (p_product_data ->> 'length')::NUMERIC
        ) RETURNING id INTO v_product_id;
    END IF;

    -- Lógica de variantes (permanece a mesma)
    SELECT array_agg((elem ->> 'id')::UUID)
    INTO v_variant_ids_to_keep
    FROM jsonb_array_elements(p_variants_data) AS elem
    WHERE elem ->> 'id' IS NOT NULL;

    DELETE FROM public.product_variants
    WHERE product_id = v_product_id
      AND id <> ALL(COALESCE(v_variant_ids_to_keep, '{}'));

    FOR v_variant IN SELECT * FROM jsonb_array_elements(p_variants_data)
    LOOP
        IF v_variant ? 'id' AND v_variant ->> 'id' IS NOT NULL THEN
            UPDATE public.product_variants
            SET
                color = v_variant ->> 'color',
                size = v_variant ->> 'size',
                price = COALESCE((v_variant ->> 'price')::NUMERIC, (p_product_data ->> 'price')::NUMERIC),
                stock = (v_variant ->> 'stock')::INTEGER,
                image_url = v_variant ->> 'image_url'
            WHERE id = (v_variant ->> 'id')::UUID;
        ELSE
            INSERT INTO public.product_variants (product_id, color, size, price, stock, image_url)
            VALUES (
                v_product_id,
                v_variant ->> 'color',
                v_variant ->> 'size',
                COALESCE((v_variant ->> 'price')::NUMERIC, (p_product_data ->> 'price')::NUMERIC),
                (v_variant ->> 'stock')::INTEGER,
                v_variant ->> 'image_url'
            );
        END IF;
    END LOOP;

    -- Retorna o resultado
    SELECT jsonb_build_object(
        'product', (SELECT to_jsonb(p) FROM public.products p WHERE p.id = v_product_id),
        'variants', (SELECT jsonb_agg(to_jsonb(pv)) FROM public.product_variants pv WHERE pv.product_id = v_product_id)
    ) INTO v_result;

    RETURN v_result;
END;
$function$;