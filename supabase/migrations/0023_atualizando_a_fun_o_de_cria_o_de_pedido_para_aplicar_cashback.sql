CREATE OR REPLACE FUNCTION public.create_order(
    cart_items jsonb, 
    shipping_details jsonb, 
    p_shipping_cost numeric, 
    p_total_amount numeric,
    p_cashback_to_apply numeric DEFAULT 0
)
RETURNS uuid
LANGUAGE plpgsql
AS $function$
DECLARE
  new_order_id UUID;
  item JSONB;
  current_cashback_balance NUMERIC;
  final_total_amount NUMERIC;
BEGIN
  -- Validar o cashback a ser aplicado
  SELECT saldo_cashback INTO current_cashback_balance FROM public.profiles WHERE id = auth.uid();
  
  IF p_cashback_to_apply > 0 THEN
    IF p_cashback_to_apply > COALESCE(current_cashback_balance, 0) THEN
      RAISE EXCEPTION 'Saldo de cashback insuficiente.';
    END IF;
    IF p_cashback_to_apply > p_total_amount THEN
      RAISE EXCEPTION 'O cashback aplicado não pode ser maior que o total do pedido.';
    END IF;
  END IF;

  final_total_amount := p_total_amount - p_cashback_to_apply;

  -- Insert the main order details
  INSERT INTO public.orders (user_id, total_amount, shipping_cost, shipping_address, shipping_option)
  VALUES (auth.uid(), final_total_amount, p_shipping_cost, shipping_details, shipping_details -> 'shippingOption')
  RETURNING id INTO new_order_id;

  -- Loop through cart items and insert them into order_items
  FOR item IN SELECT * FROM jsonb_array_elements(cart_items)
  LOOP
    INSERT INTO public.order_items (order_id, product_id, quantity, price, product_details)
    VALUES (
      new_order_id,
      (item ->> 'id')::UUID,
      (item ->> 'quantity')::INTEGER,
      (item ->> 'price')::NUMERIC,
      jsonb_build_object('name', item ->> 'name', 'imageUrl', item ->> 'imageUrl')
    );
  END LOOP;

  -- Se cashback foi usado, atualizar o saldo e registrar no log
  IF p_cashback_to_apply > 0 THEN
    UPDATE public.profiles
    SET saldo_cashback = saldo_cashback - p_cashback_to_apply
    WHERE id = auth.uid();

    INSERT INTO public.cashback_logs (user_id, order_id, type, amount, description)
    VALUES (auth.uid(), new_order_id, 'usage', p_cashback_to_apply, 'Uso de cashback no pedido #' || substr(new_order_id::text, 1, 8));
  END IF;

  RETURN new_order_id;
END;
$function$