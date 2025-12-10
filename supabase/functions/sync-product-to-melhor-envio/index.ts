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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const melhorEnvioToken = Deno.env.get('MELHOR_ENVIO_API_TOKEN');

    if (!melhorEnvioToken) {
        throw new Error("A chave da API do Melhor Envio (MELHOR_ENVIO_API_TOKEN) não foi configurada.");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { product } = await req.json();
    if (!product) throw new Error("Dados do produto não fornecidos.");

    const { data: settings } = await supabaseAdmin.from('store_settings').select('contact_email').eq('id', 1).single();
    
    const authHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${melhorEnvioToken}`,
      'User-Agent': `LojaEddy (${settings?.contact_email || 'contato@loja.com'})`
    };

    // Preparar os dados do produto
    const productPayload = {
      name: product.name,
      insurance_value: parseFloat(product.price),
      weight: parseFloat(product.weight),
      width: parseFloat(product.width),
      height: parseFloat(product.height),
      length: parseFloat(product.length),
    };

    // Construir a URL correta e definir o método
    const baseUrl = `https://www.melhorenvio.com.br/api/v2/products`;
    const url = product.melhor_envio_product_id ? `${baseUrl}/${product.melhor_envio_product_id}` : baseUrl;
    const method = product.melhor_envio_product_id ? 'PUT' : 'POST';

    // Enviar a requisição para o endpoint correto
    const response = await fetch(url, {
      method,
      headers: authHeaders,
      body: JSON.stringify(productPayload),
    });

    if (!response.ok) {
      const responseBodyText = await response.text();
      let errorDetails;
      try { errorDetails = JSON.parse(responseBodyText); } catch (e) { errorDetails = responseBodyText; }
      
      console.error("Melhor Envio API Error Response:", { status: response.status, body: errorDetails });

      let errorMessage = `Falha na API (Status: ${response.status}).`;
      if (typeof errorDetails === 'object' && errorDetails !== null) {
        if (errorDetails.message) errorMessage += ` Mensagem: ${errorDetails.message}`;
        if (errorDetails.error) errorMessage += ` Erro: ${errorDetails.error}`;
        if (errorDetails.errors) errorMessage += ` Detalhes: ${JSON.stringify(errorDetails.errors)}`;
      } else if (responseBodyText) {
        errorMessage += ` Resposta: ${responseBodyText}`;
      }
      
      throw new Error(errorMessage);
    }

    const responseData = await response.json();

    // Atualizar o ID no nosso banco de dados se for um novo produto
    if (method === 'POST' && responseData.id) {
      await supabaseAdmin
        .from('products')
        .update({ melhor_envio_product_id: responseData.id })
        .eq('id', product.id);
    }

    return new Response(
      JSON.stringify({ success: true, data: responseData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});