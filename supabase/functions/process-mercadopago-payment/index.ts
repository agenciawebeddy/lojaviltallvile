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
    
    // --- Validação de Campos Obrigatórios ---
    const requiredFields = [
        'transaction_amount', 'token', 'installments', 'payment_method_id', 'external_reference'
    ];
    
    for (const field of requiredFields) {
        if (!paymentData[field]) {
            throw new Error(`Dados incompletos: Campo obrigatório '${field}' ausente.`);
        }
    }
    
    // Validação do Payer (obrigatório para todos os fluxos de pagamento que estamos usando)
    if (!paymentData.payer || !paymentData.payer.email || !paymentData.payer.identification || !paymentData.payer.identification.number) {
        throw new Error('Dados incompletos: Informações do pagador (email e CPF/CNPJ) são obrigatórias.');
    }

    // 1. Construção do payload estrito do Mercado Pago
    const paymentPayload: any = {
      transaction_amount: paymentData.transaction_amount,
      token: paymentData.token,
      description: `Pedido #${paymentData.external_reference.substring(0, 8)}`,
      installments: paymentData.installments,
      payment_method_id: paymentData.payment_method_id,
      issuer_id: paymentData.issuer_id, // Opcional, mas incluído se vier
      external_reference: paymentData.external_reference,
      payer: {
        email: paymentData.payer.email,
        identification: paymentData.payer.identification
      }
    };

    // 2. Filtrar campos undefined/null (garantindo que apenas dados válidos sejam enviados)
    // Isso é crucial para issuer_id, que pode ser nulo para PIX/Boleto
    const cleanPayload = Object.fromEntries(
        Object.entries(paymentPayload).filter(([_, v]) => v !== undefined && v !== null)
    );
    
    // Garante que o objeto payer não tenha campos nulos/undefined
    if (cleanPayload.payer) {
        cleanPayload.payer = Object.fromEntries(
            Object.entries(cleanPayload.payer).filter(([_, v]) => v !== undefined && v !== null)
        );
        if (cleanPayload.payer.identification) {
            cleanPayload.payer.identification = Object.fromEntries(
                Object.entries(cleanPayload.payer.identification).filter(([_, v]) => v !== undefined && v !== null)
            );
        }
    }

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Idempotency-Key': crypto.randomUUID(), // Previne pagamentos duplicados
      },
      body: JSON.stringify(cleanPayload),
    });

    const responseData = await response.json();

    if (!response.ok || (responseData.status !== 'approved' && responseData.status !== 'in_process')) {
      console.error('Erro na API do Mercado Pago:', responseData);
      
      let errorMessage = 'Falha ao processar o pagamento.';
      if (responseData.message) {
          errorMessage = responseData.message;
      } else if (responseData.cause && responseData.cause.length > 0) {
          // Tenta extrair a causa do erro
          errorMessage = responseData.cause[0].description || responseData.cause[0].code || 'Erro desconhecido do Mercado Pago.';
      }
      
      throw new Error(errorMessage);
    }

    // Se o pagamento for aprovado, atualiza o status do pedido no Supabase
    if (responseData.status === 'approved') {
        const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update({ status: 'Pago' })
            .eq('id', paymentData.external_reference);

        if (updateError) {
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