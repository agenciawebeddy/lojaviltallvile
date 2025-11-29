CREATE OR REPLACE FUNCTION public.notify_admin_on_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM net.http_post(
    'https://hqwujtzlhwycndpfqjvd.supabase.co/functions/v1/send-admin-notification',
    '{"record": ' || row_to_json(NEW)::text || '}',
    ARRAY[
      net.http_header('Content-Type', 'application/json'),
      net.http_header('Authorization', 'Bearer ' || current_setting('request.jwt.arr'))
    ]::net.http_header[]
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_notify_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.notify_admin_on_new_user();