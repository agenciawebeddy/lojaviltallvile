CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER -- Changed to SECURITY INVOKER
SET search_path = 'public'
AS $$
BEGIN
  RAISE NOTICE 'Attempting to insert profile for user ID: %', NEW.id;
  INSERT INTO public.profiles (id, full_name, saldo_cashback)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', 0.00);
  RAISE NOTICE 'Profile inserted successfully for user ID: %', NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error inserting profile for user %: %', NEW.id, SQLERRM;
    RETURN NULL; -- Or handle as appropriate, returning NULL will abort the transaction
END;
$$;