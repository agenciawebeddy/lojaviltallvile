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
    console.log("PAYMENT_DATA_RECEBIDO:", paymentData); // Log para depuração
    
    const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (!accessToken) {
      throw new Error('O token de acesso do Mercado Pago não está configurado.');
    }
    
    // --- Validação de Campos Obrigatórios ---
    const requiredBaseFields = [
        'transaction_amount', 'payment_method_id', 'external_reference'
    ];
    
    for (const field of requiredBaseFields) {
        if (!paymentData[field]) {
            throw new Error(`Dados incompletos para processar o pagamento. Campo obrigatório '${field}' ausente.`);
        }
    }
    
    const isCardPayment = paymentData.payment_method_id !== 'pix' && paymentData.payment_method_id !== 'bolbradesco';

    if (isCardPayment) {
        const requiredCardFields = ['token', 'installments', 'issuer_id'];
        for (const field of requiredCardFields) {
            if (!paymentData[field]) {
                throw new Error(`Dados incompletos para pagamento com cartão. Campo obrigatório '${field}' ausente.`);
            }
        }
    }

    // Validação do Payer (opcional, mas se existir, deve ser completo)
    if (paymentData.payer) {
        if (!paymentData.payer.email || !paymentData.payer.identification || !paymentData.payer.identification.number) {
            throw new Error('Dados incompletos: Se o pagador for fornecido, email e CPF/CNPJ são obrigatórios.');
        }
    } else {
        // Para a maioria dos fluxos, o payer é obrigatório. Se o Brick não enviou, o frontend falhou.
        // Mas vamos permitir que o MP retorne o erro se for o caso.
    }

    // 1. Construção do payload estrito do Mercado Pago
    const paymentPayload: any = {
      transaction_amount: paymentData.transaction_amount,
      description: `Pedido #${paymentData.external_reference.substring(0, 8)}`,
      installments: paymentData.installments || 1, // Default para 1 se não for cartão
      payment_method_id: paymentData.payment_method_id,
      external_reference: paymentData.external_reference,
      payer: paymentData.payer,
    };
    
    // Adicionar campos específicos de Cartão
    if (isCardPayment) {
        paymentPayload.token = paymentData.token;
        paymentPayload.issuer_id = paymentData.issuer_id;
    }

    // 2. Filtrar campos undefined/null
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

    const responseBody = await response.json();
    console.log("MP_RESPONSE:", responseBody); // Log para depuração

    if (!response.ok || (responseBody.status !== 'approved' && responseBody.status !== 'in_process' && responseBody.status !== 'pending')) {
      
      let errorMessage = 'Falha ao processar o pagamento.';
      
      // Tratamento de erro específico para token inválido
      if (responseBody.message === 'Invalid card token') {
          errorMessage = 'Token do cartão inválido ou expirado. Por favor, tente novamente com os dados corretos.';
      } else if (responseBody.message) {
          errorMessage = responseBody.message;
      } else if (responseBody.cause && responseBody.cause.length > 0) {
          // Tenta extrair a causa do erro
          errorMessage = responseBody.cause[0].description || responseBody.cause[0].code || 'Erro desconhecido do Mercado Pago.';
      }
      
      throw new Error(errorMessage);
    }

    // Se o pagamento for aprovado, atualiza o status do pedido no Supabase
    if (responseBody.status === 'approved') {
        const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update({ status: 'Pago' })
            .eq('id', paymentData.external_reference);

        if (updateError) {
            console.error('Erro ao atualizar o status do pedido no Supabase:', updateError);
        }
    }

    return new Response(
      JSON.stringify({ success: true, paymentId: responseBody.id, status: responseBody.status }),
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