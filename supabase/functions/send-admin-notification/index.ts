// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@1.1.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { record } = await req.json(); // The new user record from the trigger

    if (!record) {
      throw new Error("No user record provided in the request body.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch store settings to get admin email and store name
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('store_settings')
      .select('contact_email, store_name')
      .eq('id', 1)
      .single();

    if (settingsError) {
      console.error('Error fetching store settings:', settingsError);
      throw new Error('Could not fetch store settings for admin email.');
    }

    const adminEmail = settings.contact_email;
    const storeName = settings.store_name || 'LojaEddy';

    if (!adminEmail) {
      throw new Error("Admin email not configured in store settings.");
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY'); // Assuming you'll use Resend for emails
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not set in environment variables.");
    }

    const resend = new Resend(resendApiKey);

    const { data, error: resendError } = await resend.emails.send({
      from: `${storeName} <onboarding@resend.dev>`, // Replace with your verified Resend domain
      to: [adminEmail],
      subject: `Novo Cadastro na ${storeName}`,
      html: `
        <h1>Novo Usuário Cadastrado!</h1>
        <p>Um novo usuário se cadastrou na sua loja ${storeName}.</p>
        <ul>
          <li><strong>ID do Usuário:</strong> ${record.id}</li>
          <li><strong>Email:</strong> ${record.email}</li>
          <li><strong>Nome Completo:</strong> ${record.raw_user_meta_data?.full_name || 'Não informado'}</li>
          <li><strong>Data de Cadastro:</strong> ${new Date(record.created_at).toLocaleString('pt-BR')}</li>
        </ul>
        <p>Acesse o painel de administração para mais detalhes.</p>
      `,
    });

    if (resendError) {
      console.error('Error sending email with Resend:', resendError);
      throw new Error(`Failed to send email: ${resendError.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, emailData: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in Edge function send-admin-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});