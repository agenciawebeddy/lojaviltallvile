CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, saldo_cashback)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name', 0.00);
  RETURN new;
END;
$function$;