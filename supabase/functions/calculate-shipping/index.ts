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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: activeServices, error: servicesError } = await supabaseAdmin
      .from('shipping_services')
      .select('service_id')
      .eq('is_active', true);

    if (servicesError) throw new Error(`Erro no banco de dados ao buscar serviços de frete: ${servicesError.message}`);
    
    const activeServiceIds = activeServices.map(s => s.service_id);

    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('store_settings')
      .select('origin_postal_code, contact_email, free_shipping_is_active, free_shipping_threshold')
      .eq('id', 1)
      .single();
    
    if (settingsError) throw new Error(`Erro no banco de dados ao buscar configurações: ${settingsError.message}`);
    if (!settings || !settings.origin_postal_code) throw new Error('CEP de origem não encontrado nas configurações da loja.');

    const { shippingDetails, cartItems } = await req.json();
    const melhorEnvioToken = Deno.env.get('MELHOR_ENVIO_API_TOKEN');

    if (!melhorEnvioToken) throw new Error('A chave da API de frete não está configurada no servidor.');

    const products = cartItems.map((item) => ({
      width: item.width || 11,
      height: item.height || 2,
      length: item.length || 16,
      weight: item.weight || 0.1,
      insurance_value: item.price,
      quantity: item.quantity,
    }));
    
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let shippingOptions = [];

    // Apenas calcula o frete com a API se houver serviços ativos
    if (activeServiceIds.length > 0) {
        const payload = {
          from: { postal_code: settings.origin_postal_code.replace(/\D/g, '') },
          to: {
            postal_code: shippingDetails.postalCode.replace(/\D/g, ''),
            address: shippingDetails.street,
            number: shippingDetails.number,
            neighborhood: shippingDetails.neighborhood,
            city: shippingDetails.city,
            state_abbr: shippingDetails.state,
          },
          products: products,
          services: activeServiceIds.join(','),
          options: {
              insurance_value: subtotal,
              receipt: false,
              own_hand: false,
              collect: false,
          }
        };

        const response = await fetch("https://www.melhorenvio.com.br/api/v2/me/shipment/calculate", {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${melhorEnvioToken}`,
            'User-Agent': `LojaEddy (${settings.contact_email || 'contato@loja.com'})`
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorBody = await response.json();
          const errorMessage = errorBody.error || (errorBody.errors ? JSON.stringify(errorBody.errors) : `Falha ao comunicar com a transportadora (Status: ${response.status}).`);
          throw new Error(errorMessage);
        }

        const data = await response.json();
        shippingOptions = data.filter(option => !option.error);
    }

    // Adiciona a opção de frete grátis se as condições forem atendidas
    if (settings.free_shipping_is_active && subtotal >= settings.free_shipping_threshold) {
        const freeShippingOption = {
            id: 0,
            name: 'Frete Grátis',
            price: '0.00',
            delivery_time: 7, // Prazo de entrega estimado
            company: {
                id: 0,
                name: 'LojaEddy',
                // Usando o caminho relativo para o arquivo na pasta public/
                picture: '/frete-gratis-icon.png' 
            }
        };
        shippingOptions.unshift(freeShippingOption); // Adiciona no início da lista
    }

    return new Response(
      JSON.stringify(shippingOptions),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na Edge function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});