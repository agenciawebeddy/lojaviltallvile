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
    const paymentData = await req.json();
    const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (!accessToken) {
      throw new Error('O token de acesso do Mercado Pago não está configurado.');
    }

    const paymentPayload = {
      transaction_amount: paymentData.transaction_amount,
      token: paymentData.token,
      description: `Pedido #${paymentData.external_reference.substring(0, 8)}`,
      installments: paymentData.installments,
      payment_method_id: paymentData.payment_method_id,
      issuer_id: paymentData.issuer_id,
      payer: {
        email: paymentData.payer.email,
        identification: {
          type: paymentData.payer.identification.type,
          number: paymentData.payer.identification.number,
        },
      },
      external_reference: paymentData.external_reference,
    };

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Idempotency-Key': crypto.randomUUID(), // Previne pagamentos duplicados
      },
      body: JSON.stringify(paymentPayload),
    });

    const responseData = await response.json();

    if (!response.ok || (responseData.status !== 'approved' && responseData.status !== 'in_process')) {
      console.error('Erro na API do Mercado Pago:', responseData);
      const errorMessage = responseData.cause?.[0]?.description || responseData.message || 'Falha ao processar o pagamento.';
      throw new Error(errorMessage);
    }

    // Se o pagamento for aprovado, atualiza o status do pedido no Supabase
    if (responseData.status === 'approved') {
        const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update({ status: 'Pago' })
            .eq('id', paymentData.external_reference);

        if (updateError) {
            // Apenas registra o erro, pois o pagamento já foi processado.
            console.error('Erro ao atualizar o status do pedido no Supabase:', updateError);
        }
    }

    return new Response(
      JSON.stringify({ success: true, paymentId: responseData.id, status: responseData.status }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});