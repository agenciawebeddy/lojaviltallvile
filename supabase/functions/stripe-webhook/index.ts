// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@16.5.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
});

const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  
  if (!signature || !webhookSecret) {
      return new Response("Missing Stripe signature or webhook secret", { status: 400 });
  }

  let event;
  const body = await req.text();

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new Response(`Webhook error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    
    if (!orderId) {
        console.error("Checkout session completed but missing order_id metadata.");
        return new Response("Missing order_id", { status: 400 });
    }

    try {
        // Atualiza o status do pedido para 'Pago' no Supabase
        const { error } = await supabaseAdmin
            .from('orders')
            .update({ 
                status: 'Pago',
                // Opcional: Salvar o ID da sessão do Stripe para referência
                stripe_session_id: session.id 
            })
            .eq('id', orderId);

        if (error) {
            console.error(`Failed to update order ${orderId} status to Paid:`, error);
            return new Response(`Database error: ${error.message}`, { status: 500 });
        }
        
        console.log(`Order ${orderId} successfully updated to Paid.`);

    } catch (e) {
        console.error("Error processing checkout.session.completed:", e);
        return new Response(`Internal server error: ${e.message}`, { status: 500 });
    }
  }

  return new Response("ok", { status: 200 });
});