CREATE OR REPLACE FUNCTION public.create_order(
  cart_items JSONB,
  shipping_details JSONB,
  p_shipping_cost NUMERIC,
  p_total_amount NUMERIC
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  new_order_id UUID;
  item JSONB;
BEGIN
  -- Insert the main order details
  INSERT INTO public.orders (user_id, total_amount, shipping_cost, shipping_address, shipping_option)
  VALUES (auth.uid(), p_total_amount, p_shipping_cost, shipping_details, shipping_details -> 'shippingOption')
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

  RETURN new_order_id;
END;
$$;