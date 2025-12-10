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
    v_gallery_images TEXT[];
    v_global_discount_percentage NUMERIC;
    v_calculated_discount_price NUMERIC;
    v_original_price NUMERIC := (p_product_data ->> 'price')::NUMERIC;
BEGIN
    -- Obter a porcentagem de desconto global das configurações da loja
    SELECT global_discount_percentage INTO v_global_discount_percentage FROM public.store_settings WHERE id = 1;
    
    -- Converte o array JSON de categorias do input para um array TEXT do PostgreSQL
    SELECT array_agg(value)
    INTO v_categories
    FROM jsonb_array_elements_text(p_product_data -> 'category');

    -- Converte o array JSON de gallery_images do input para um array TEXT do PostgreSQL
    SELECT array_agg(value)
    INTO v_gallery_images
    FROM jsonb_array_elements_text(p_product_data -> 'gallery_images');

    -- Calcular o discount_price se não for fornecido e houver desconto global
    v_calculated_discount_price := (p_product_data ->> 'discount_price')::NUMERIC; -- Tenta usar o discount_price fornecido
    
    IF v_calculated_discount_price IS NULL AND v_global_discount_percentage > 0 THEN
        v_calculated_discount_price := v_original_price * (1 - v_global_discount_percentage / 100);
    END IF;

    -- Upsert do produto principal
    IF p_product_data ? 'id' AND p_product_data ->> 'id' IS NOT NULL THEN
        v_product_id := (p_product_data ->> 'id')::UUID;
        UPDATE public.products
        SET
            name = p_product_data ->> 'name',
            category = v_categories,
            price = v_original_price,
            discount_price = v_calculated_discount_price,
            "imageUrl" = p_product_data ->> 'imageUrl',
            description = p_product_data ->> 'description',
            weight = (p_product_data ->> 'weight')::NUMERIC,
            height = (p_product_data ->> 'height')::NUMERIC,
            width = (p_product_data ->> 'width')::NUMERIC,
            length = (p_product_data ->> 'length')::NUMERIC,
            gallery_images = v_gallery_images
        WHERE id = v_product_id;
    ELSE
        INSERT INTO public.products (name, category, price, discount_price, "imageUrl", description, weight, height, width, length, gallery_images)
        VALUES (
            p_product_data ->> 'name',
            v_categories,
            v_original_price,
            v_calculated_discount_price,
            p_product_data ->> 'imageUrl',
            p_product_data ->> 'description',
            (p_product_data ->> 'weight')::NUMERIC,
            (p_product_data ->> 'height')::NUMERIC,
            (p_product_data ->> 'width')::NUMERIC,
            (p_product_data ->> 'length')::NUMERIC,
            v_gallery_images
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
                color_name = v_variant ->> 'color_name', -- NOVO CAMPO
                size = v_variant ->> 'size',
                price = COALESCE((v_variant ->> 'price')::NUMERIC, v_calculated_discount_price), -- Usa o preço com desconto global se a variante não tiver um preço específico
                stock = (v_variant ->> 'stock')::INTEGER,
                image_url = v_variant ->> 'image_url'
            WHERE id = (v_variant ->> 'id')::UUID;
        ELSE
            INSERT INTO public.product_variants (product_id, color, color_name, size, price, stock, image_url) -- NOVO CAMPO
            VALUES (
                v_product_id,
                v_variant ->> 'color',
                v_variant ->> 'color_name', -- NOVO CAMPO
                v_variant ->> 'size',
                COALESCE((v_variant ->> 'price')::NUMERIC, v_calculated_discount_price), -- Usa o preço com desconto global se a variante não tiver um preço específico
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
$function$