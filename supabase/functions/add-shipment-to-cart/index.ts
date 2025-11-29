// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();
    if (!orderId) throw new Error("ID do pedido não fornecido.");

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();
    if (orderError) throw new Error(`Erro ao buscar pedido: ${orderError.message}`);

    const productIds = order.order_items.map(item => item.product_id);
    const { data: productsData, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, melhor_envio_product_id')
      .in('id', productIds);
    if (productsError) throw new Error(`Erro ao buscar produtos: ${productsError.message}`);

    const productsMap = new Map(productsData.map(p => [p.id, p.melhor_envio_product_id]));

    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('store_settings')
      .select('*')
      .eq('id', 1)
      .single();
    if (settingsError) throw new Error(`Erro ao buscar configurações da loja: ${settingsError.message}`);

    const melhorEnvioToken = Deno.env.get('MELHOR_ENVIO_API_TOKEN');
    if (!melhorEnvioToken) throw new Error('A chave da API de frete não está configurada.');

    const recipient = order.shipping_address;
    const selectedService = order.shipping_option;

    const payload = {
      service: selectedService.id,
      from: {
        name: settings.sender_name,
        phone: settings.sender_phone?.replace(/\D/g, ''),
        email: settings.contact_email,
        document: settings.sender_document?.replace(/\D/g, ''),
        address: settings.sender_address,
        postal_code: settings.origin_postal_code?.replace(/\D/g, ''),
      },
      to: {
        name: recipient.fullName,
        phone: recipient.phone?.replace(/\D/g, ''),
        email: recipient.email,
        document: recipient.document?.replace(/\D/g, ''),
        address: recipient.street,
        number: recipient.number,
        neighborhood: recipient.neighborhood,
        city: recipient.city,
        state_abbr: recipient.state,
        postal_code: recipient.postalCode?.replace(/\D/g, ''),
      },
      products: order.order_items.map(item => {
        const melhorEnvioId = productsMap.get(item.product_id);
        if (!melhorEnvioId) {
          throw new Error(`Produto "${item.product_details.name}" (ID: ${item.product_id}) não está sincronizado com o Melhor Envio.`);
        }
        return {
          id: melhorEnvioId,
          quantity: item.quantity,
        };
      }),
      options: {
        insurance_value: order.total_amount - order.shipping_cost,
        receipt: false,
        own_hand: false,
        reverse: false,
        non_commercial: true,
      },
    };

    const response = await fetch("https://www.melhorenvio.com.br/api/v2/me/cart", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${melhorEnvioToken}`,
        'User-Agent': `LojaEddy (${settings.contact_email})`
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Melhor Envio API Error:', responseData);
      throw new Error(responseData.error || responseData.message || 'Falha ao registrar a encomenda.');
    }

    return new Response(
      JSON.stringify({ success: true, shipmentId: responseData.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na Edge function add-shipment-to-cart:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});