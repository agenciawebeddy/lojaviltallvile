// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@16.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { 
      items, 
      customerEmail, 
      shippingCost, 
      orderId, 
      userId,
      successUrl,
      cancelUrl
    } = await req.json();

    if (!items || items.length === 0) {
        throw new Error("O carrinho está vazio.");
    }
    if (!customerEmail) {
        throw new Error("E-mail do cliente é obrigatório.");
    }
    if (!orderId) {
        throw new Error("ID do pedido é obrigatório.");
    }

    // Mapeia os itens do carrinho para o formato line_items do Stripe
    const lineItems = items.map((item) => ({
        price_data: {
            currency: "brl",
            product_data: { 
                name: item.name,
                description: item.variantDescription || 'Produto Padrão',
                images: [item.imageUrl]
            },
            // O Stripe espera o valor em centavos
            unit_amount: Math.round(item.price * 100), 
        },
        quantity: item.quantity,
    }));
    
    // Adiciona o custo de frete como um item de linha separado
    if (shippingCost > 0) {
        lineItems.push({
            price_data: {
                currency: "brl",
                product_data: { name: "Custo de Envio" },
                unit_amount: Math.round(shippingCost * 100),
            },
            quantity: 1,
        });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "pix"], // Adicionando Pix (se configurado no Stripe)
      customer_email: customerEmail,
      line_items: lineItems,
      metadata: {
        order_id: orderId,
        user_id: userId,
      },
      // URLs de redirecionamento
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (e) {
    console.error("Stripe Checkout Error:", e);
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});