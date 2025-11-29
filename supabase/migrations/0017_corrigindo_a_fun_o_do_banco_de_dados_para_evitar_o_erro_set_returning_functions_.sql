CREATE OR REPLACE FUNCTION public.upsert_product_with_variants(p_product_data jsonb, p_variants_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_product_id UUID;
    v_variant JSONB;
    v_result JSONB;
    v_variant_ids_to_keep UUID[]; -- Array to hold variant IDs
BEGIN
    -- Upsert the main product
    IF p_product_data ? 'id' AND p_product_data ->> 'id' IS NOT NULL THEN
        v_product_id := (p_product_data ->> 'id')::UUID;
        UPDATE public.products
        SET
            name = p_product_data ->> 'name',
            category = p_product_data ->> 'category',
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
            p_product_data ->> 'category',
            (p_product_data ->> 'price')::NUMERIC,
            p_product_data ->> 'imageUrl',
            p_product_data ->> 'description',
            (p_product_data ->> 'weight')::NUMERIC,
            (p_product_data ->> 'height')::NUMERIC,
            (p_product_data ->> 'width')::NUMERIC,
            (p_product_data ->> 'length')::NUMERIC
        ) RETURNING id INTO v_product_id;
    END IF;

    -- Extract the IDs of variants to keep from the input JSON into an array
    SELECT array_agg((elem ->> 'id')::UUID)
    INTO v_variant_ids_to_keep
    FROM jsonb_array_elements(p_variants_data) AS elem
    WHERE elem ->> 'id' IS NOT NULL;

    -- Delete variants that are not in the new list using the array
    DELETE FROM public.product_variants
    WHERE product_id = v_product_id
      AND id <> ALL(COALESCE(v_variant_ids_to_keep, '{}'));

    -- Upsert variants
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

    -- Return the saved product with its variants
    SELECT jsonb_build_object(
        'product', (SELECT to_jsonb(p) FROM public.products p WHERE p.id = v_product_id),
        'variants', (SELECT jsonb_agg(to_jsonb(pv)) FROM public.product_variants pv WHERE pv.product_id = v_product_id)
    ) INTO v_result;

    RETURN v_result;
END;
$function$