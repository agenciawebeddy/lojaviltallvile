CREATE OR REPLACE FUNCTION public.upsert_product_with_variants(p_product_data jsonb, p_variants_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_product_id UUID;
    v_variant JSONB;
    v_result JSONB;
    v_variant_ids_to_keep UUID[];
    v_categories TEXT[];
    v_gallery_images TEXT[]; -- Nova variável para a galeria
BEGIN
    -- Converte o array JSON de categorias do input para um array TEXT do PostgreSQL
    SELECT array_agg(value)
    INTO v_categories
    FROM jsonb_array_elements_text(p_product_data -> 'category');

    -- Converte o array JSON de gallery_images do input para um array TEXT do PostgreSQL
    SELECT array_agg(value)
    INTO v_gallery_images
    FROM jsonb_array_elements_text(p_product_data -> 'gallery_images');

    -- Upsert do produto principal
    IF p_product_data ? 'id' AND p_product_data ->> 'id' IS NOT NULL THEN
        v_product_id := (p_product_data ->> 'id')::UUID;
        UPDATE public.products
        SET
            name = p_product_data ->> 'name',
            category = v_categories,
            price = (p_product_data ->> 'price')::NUMERIC,
            "imageUrl" = p_product_data ->> 'imageUrl',
            description = p_product_data ->> 'description',
            weight = (p_product_data ->> 'weight')::NUMERIC,
            height = (p_product_data ->> 'height')::NUMERIC,
            width = (p_product_data ->> 'width')::NUMERIC,
            length = (p_product_data ->> 'length')::NUMERIC,
            gallery_images = v_gallery_images -- Salvando a galeria
        WHERE id = v_product_id;
    ELSE
        INSERT INTO public.products (name, category, price, "imageUrl", description, weight, height, width, length, gallery_images)
        VALUES (
            p_product_data ->> 'name',
            v_categories,
            (p_product_data ->> 'price')::NUMERIC,
            p_product_data ->> 'imageUrl',
            p_product_data ->> 'description',
            (p_product_data ->> 'weight')::NUMERIC,
            (p_product_data ->> 'height')::NUMERIC,
            (p_product_data ->> 'width')::NUMERIC,
            (p_product_data ->> 'length')::NUMERIC,
            v_gallery_images -- Salvando a galeria
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