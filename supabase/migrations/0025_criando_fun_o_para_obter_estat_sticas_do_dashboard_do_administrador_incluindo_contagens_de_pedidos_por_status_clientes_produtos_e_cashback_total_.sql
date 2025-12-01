CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
 RETURNS TABLE(
    total_orders integer,
    processing_orders integer,
    paid_orders integer,
    total_customers integer,
    total_products integer,
    total_cashback_credited numeric
 )
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*)::INTEGER FROM public.orders) AS total_orders,
        (SELECT COUNT(*)::INTEGER FROM public.orders WHERE status = 'Processando') AS processing_orders,
        (SELECT COUNT(*)::INTEGER FROM public.orders WHERE status = 'Pago') AS paid_orders,
        (SELECT COUNT(*)::INTEGER FROM auth.users) AS total_customers,
        (SELECT COUNT(*)::INTEGER FROM public.products) AS total_products,
        (SELECT COALESCE(SUM(amount), 0) FROM public.cashback_logs WHERE type = 'credit')::NUMERIC AS total_cashback_credited;
END;
$function$;