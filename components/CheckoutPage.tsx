import React, { useState, useEffect } from 'react';
import { CartItem, ShippingOption } from '../types';
import { Lock, User, Home, MapPin, Mail, Truck, Loader2, AlertCircle, FileText, Hash, Gift, DollarSign } from 'lucide-react';
import { supabase } from '../src/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import MercadoPagoBrick from './MercadoPagoBrick';
import PageHeader from '../src/components/PageHeader';
import usePageHeader from '../src/hooks/usePageHeader'; // Importando o hook
import emailjs from "@emailjs/browser"; // Importando a biblioteca EmailJS
import { initMercadoPago } from '@mercadopago/sdk-react'; // Importando initMercadoPago para acesso ao SDK

// Inicializa o Mercado Pago para acesso ao SDK (a chave pública já está no MercadoPagoBrick, mas precisamos do SDK aqui)
const MERCADO_PAGO_PUBLIC_KEY = 'APP_USR-20aecbec-5586-45ad-aa8d-eed850bc6e08'; 
initMercadoPago(MERCADO_PAGO_PUBLIC_KEY, { locale: 'pt-BR' });

interface CheckoutPageProps {
  cartItems: CartItem[];
  onNavigate: (page: string) => void;
  session: Session | null;
  globalDiscountPercentage: number; // Nova prop
  paymentOnDeliveryActive: boolean; // Nova prop
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ cartItems, onNavigate, session, globalDiscountPercentage, paymentOnDeliveryActive }) => {
  const { headerData, isLoading: isHeaderLoading } = usePageHeader('checkout'); // Usando o hook
  
  // --- START: Empty Cart Check ---
  if (cartItems.length === 0) {
    // Redireciona se o carrinho estiver vazio
    useEffect(() => {
      onNavigate('cart');
    }, [onNavigate]);
    
    // Renderiza um estado de carregamento brevemente
    return <div className="flex justify-center items-center p-8 h-screen"><Loader2 className="animate-spin" size={32} /></div>;
  }
  // --- END: Empty Cart Check ---

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    document: '',
    postalCode: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
  });
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cashbackBalance, setCashbackBalance] = useState(0);
  const [cashbackToApply, setCashbackToApply] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'mercadopago' | 'cod'>('mercadopago');

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('full_name, saldo_cashback')
            .eq('id', userId)
            .single();
        
        if (data) {
            setFormData(prev => ({
                ...prev,
                fullName: data.full_name || session?.user?.user_metadata.full_name || '',
            }));
            setCashbackBalance(data.saldo_cashback || 0);
        }
    };

    if (session?.user) {
      setFormData(prev => ({ ...prev, email: session.user.email || '' }));
      fetchProfile(session.user.id);
    }
  }, [session]);
  
  // Se o COD estiver ativo e for a única opção, seleciona COD por padrão
  useEffect(() => {
    if (paymentOnDeliveryActive && !selectedShipping) {
        setSelectedPaymentMethod('cod');
    }
  }, [paymentOnDeliveryActive, selectedShipping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (id === 'postalCode') {
      setShippingOptions([]);
      setSelectedShipping(null);
      setError(null);
    }
  };

  const calculateItemPrice = (item: CartItem) => {
    // Prioriza o preço da variante, depois o discount_price do produto, depois o preço base do produto
    let price = item.selectedVariant.price ?? item.discount_price ?? item.price;

    // Se não houver discount_price individual ou da variante, aplica o desconto global
    if (item.selectedVariant.price === undefined && item.discount_price === undefined && globalDiscountPercentage > 0) {
      price = item.price * (1 - (globalDiscountPercentage / 100));
    }
    return price;
  };

  const subtotal = cartItems.reduce((sum, item) => calculateItemPrice(item) * item.quantity + sum, 0);
  const shippingCost = selectedShipping ? parseFloat(selectedShipping.price) : 0;
  const totalBeforeCashback = subtotal + shippingCost;

  const handleCalculateShipping = async () => {
    const cep = formData.postalCode.replace(/\D/g, '');
    if (cep.length !== 8) {
      setError('Por favor, insira um CEP válido com 8 dígitos.');
      return;
    }

    setIsCalculatingShipping(true);
    setError(null);
    setShippingOptions([]);
    setSelectedShipping(null);

    let updatedShippingDetails = { ...formData };

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) throw new Error('CEP não encontrado.');
      
      updatedShippingDetails = { ...formData, street: data.logradouro, neighborhood: data.bairro, city: data.localidade, state: data.uf };
      setFormData(updatedShippingDetails);

      const { data: shippingData, error: shippingError } = await supabase.functions.invoke('calculate-shipping', {
        body: { shippingDetails: updatedShippingDetails, cartItems: cartItems.map(item => ({...item, price: calculateItemPrice(item)})) },
      });

      if (shippingError || (shippingData && shippingData.error)) {
        throw new Error(shippingError?.message || shippingData?.error || 'Não foi possível calcular o frete.');
      }
      
      const validOptions = shippingData.filter((option: ShippingOption) => !option.error);
      setShippingOptions(validOptions);
      if (validOptions.length === 0) setError('Nenhuma opção de frete encontrada para este CEP.');

    } catch (e: any) {
      setError(e.message || 'Ocorreu um erro inesperado.');
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  const handleCashbackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value)) {
        const numericValue = parseFloat(value) || 0;
        if (numericValue > cashbackBalance) {
            setCashbackToApply(cashbackBalance.toString());
        } else if (numericValue > totalBeforeCashback) {
            setCashbackToApply(totalBeforeCashback.toFixed(2));
        } else {
            setCashbackToApply(value);
        }
    }
  };

  const appliedCashback = parseFloat(cashbackToApply) || 0;
  const finalTotal = totalBeforeCashback - appliedCashback;

  const handleOrderSuccess = (orderId: string) => {
    console.log(`Pedido criado com sucesso. ID: ${orderId}`);
    onNavigate('orderconfirmation');
  };

  const handleOrderError = (e: any) => {
    console.error('Erro no pedido:', e);
    setError(e.message || 'Ocorreu um erro ao finalizar o pedido. Tente novamente.');
    setIsSubmitting(false);
  };

  // Função auxiliar para criar o pedido no Supabase e enviar o e-mail
  const createOrderAndNotify = async (status: string) => {
    const shippingDetails = { ...formData, shippingOption: selectedShipping };
    
    const { data: newOrderId, error: rpcError } = await supabase.rpc('create_order', {
      cart_items: cartItems.map(item => ({...item, price: calculateItemPrice(item)})),
      shipping_details: shippingDetails,
      p_shipping_cost: shippingCost,
      p_total_amount: totalBeforeCashback,
      p_cashback_to_apply: appliedCashback
    });

    if (rpcError) throw rpcError;

    // Formatação dos itens do carrinho para o e-mail
    const formattedCartItems = cartItems.map(item => {
        const itemPrice = calculateItemPrice(item);
        const variantDescription = [item.selectedVariant.color_name, item.selectedVariant.color, item.selectedVariant.size]
            .filter(Boolean)
            .join(' / ');
        
        const priceFormatted = formatPrice(itemPrice * item.quantity);
        
        return `${item.quantity}x ${item.name} (${variantDescription || 'Padrão'}) - ${priceFormatted}`;
    }).join('\n');

    // Enviar e-mail de confirmação do pedido via EmailJS
    try {
      await emailjs.send(
        "service_58xpkyb",
        "template_cmiacto",
        {
          to_name: formData.fullName,
          customer_email: formData.email,
          order_id: newOrderId,
          message: formattedCartItems // Usando a string formatada
        },
        "jOZo1dRNn4uZBaV9T"
      );
      console.log("E-mail de confirmação enviado com sucesso!");
    } catch (emailError: any) {
      console.error("Falha ao enviar e-mail de confirmação:", emailError);
      // Não interrompe o fluxo de checkout, apenas loga o erro
    }

    // IGNORANDO MELHOR ENVIO CONFORME SOLICITADO
    // supabase.functions.invoke('add-shipment-to-cart', { body: { orderId: newOrderId } })
    //   .then(({ error: functionError }) => {
    //     if (functionError) console.error('Erro ao registrar no Melhor Envio:', functionError);
    //   });
      
    return newOrderId;
  };

  const handlePaymentOnDeliverySubmit = async () => {
    if (!selectedShipping) {
      setError('Por favor, selecione uma opção de frete antes de finalizar.');
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Criar o pedido no banco de dados com status 'Processando' (default)
      await createOrderAndNotify('Processando');
      
      // 2. Sucesso
      handleOrderSuccess('COD'); // Passa um ID fictício para sucesso
    } catch (e: any) {
      handleOrderError(e);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePaymentSubmit = async (paymentFormData: any) => {
    if (!selectedShipping) {
      setError('Por favor, selecione uma opção de frete antes de pagar.');
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Criar o pedido no banco de dados (status inicial 'Processando')
      const newOrderId = await createOrderAndNotify('Processando');
      
      const amount = finalTotal;
      const email = formData.email;
      const docNumber = formData.document;
      
      // --- CORREÇÃO AQUI: Extraindo paymentMethodId corretamente ---
      const { 
        token, 
        paymentMethodId, // O Brick deve fornecer este campo
        issuer, 
        installments, 
      } = paymentFormData;
      
      // Se o paymentMethodId não vier diretamente, tentamos extrair de outras formas
      const finalPaymentMethodId = paymentMethodId || paymentFormData.payment_method_id;
      
      // Determinar o tipo de identificação
      const identificationType = docNumber ? (docNumber.replace(/\D/g, '').length > 11 ? 'CNPJ' : 'CPF') : undefined;

      // 2. Validação de Campos Essenciais
      const requiredFields = [
        { value: amount, name: 'transaction_amount' },
        { value: finalPaymentMethodId, name: 'payment_method_id' }, // Usando o valor corrigido
        { value: email, name: 'payer.email' },
        { value: identificationType, name: 'payer.identification.type' },
        { value: docNumber, name: 'payer.identification.number' }
      ];
      
      // Validação específica para cartão de crédito
if (finalPaymentMethodId && 
    finalPaymentMethodId !== 'pix' && 
    finalPaymentMethodId !== 'bolbradesco' &&
    finalPaymentMethodId !== 'pec') {

    requiredFields.push(
        { value: token, name: 'token' },
        { value: installments, name: 'installments' },
        { value: issuer, name: 'issuer_id' }
    );

    // Se o token não existir, erro de cartão
    if (!token) {
        throw new Error("Falha ao tokenizar o cartão. Tente novamente.");
    }
}

      const missingField = requiredFields.find(field => !field.value);
      if (missingField) {
        throw new Error(`Dados incompletos para processar o pagamento. Campo faltando: ${missingField.name}`);
      }

      // 3. Montar o Payload para a Edge Function (Formato estrito do MP)
      const payloadToEdgeFunction: any = {
        transaction_amount: amount,
        payment_method_id: finalPaymentMethodId, // Usando o valor corrigido
        external_reference: newOrderId,
        payer: {
          email: email,
          identification: {
            type: identificationType,
            number: docNumber
          }
        }
      };
      
      // Adicionar campos específicos de Cartão
      if (finalPaymentMethodId && finalPaymentMethodId !== 'pix' && finalPaymentMethodId !== 'bolbradesco') {
          payloadToEdgeFunction.token = token;
          payloadToEdgeFunction.installments = installments;
          payloadToEdgeFunction.issuer_id = issuer;
      }
      
      console.log("PAYLOAD ENVIADO PARA EDGE FUNCTION:", payloadToEdgeFunction);

      // 4. Chamar a Edge Function
      const { data: paymentResult, error: paymentError } = await supabase.functions.invoke('process-mercadopago-payment', {
        body: payloadToEdgeFunction
      });

      if (paymentError) {
        // Erro de invocação da função (rede, timeout, etc.)
        throw new Error(`Erro de comunicação com o servidor: ${paymentError.message}`);
      }
      
      if (paymentResult.error) {
        // Erro retornado pela Edge Function (geralmente erro da API do MP)
        throw new Error(paymentResult.error);
      }
      
      console.log("RETORNO FINAL DA EDGE FUNCTION:", paymentResult);

      // 5. Sucesso
      handleOrderSuccess(newOrderId);

    } catch (e: any) {
      handleOrderError(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (isHeaderLoading) {
    return <div className="flex justify-center items-center p-8 h-screen"><Loader2 className="animate-spin" size={32} /></div>;
  }

  return (
    <>
      <PageHeader 
        title={headerData?.title || "Finalizar Compra"}
        description={headerData?.description || "Preencha seus dados, escolha o frete e finalize o pagamento."}
        imageUrl={headerData?.image_url}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="w-full lg:w-3/5">
            <div className="space-y-8">
              {/* Delivery Info */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Informações de Entrega</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label htmlFor="fullName" className="text-sm font-medium text-gray-700 block mb-2">Nome Completo</label>
                      <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" id="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900" required /></div>
                    </div>
                    <div>
                      <label htmlFor="email" className="text-sm font-medium text-gray-700 block mb-2">E-mail</label>
                      <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="email" id="email" value={formData.email} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900" required /></div>
                    </div>
                    <div>
                      <label htmlFor="document" className="text-sm font-medium text-gray-700 block mb-2">CPF/CNPJ</label>
                      <div className="relative"><FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" id="document" value={formData.document} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900" required /></div>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="postalCode" className="text-sm font-medium text-gray-700 block mb-2">CEP</label>
                      <div className="flex gap-2 items-center">
                        <div className="relative flex-grow"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" id="postalCode" value={formData.postalCode} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900" required placeholder="00000-000" /></div>
                        <button type="button" onClick={handleCalculateShipping} disabled={isCalculatingShipping} className="flex items-center justify-center gap-2 bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 disabled:bg-gray-100">{isCalculatingShipping ? <Loader2 className="animate-spin" size={20} /> : <Truck size={20} />}<span>Calcular</span></button>
                      </div>
                    </div>
                    <div className="sm:col-span-2"><label htmlFor="street" className="text-sm font-medium text-gray-700 block mb-2">Rua</label><div className="relative"><Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" id="street" value={formData.street} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900" required /></div></div>
                    <div><label htmlFor="number" className="text-sm font-medium text-gray-700 block mb-2">Número</label><div className="relative"><Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" id="number" value={formData.number} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900" required /></div></div>
                    <div><label htmlFor="neighborhood" className="text-sm font-medium text-gray-700 block mb-2">Bairro</label><div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" id="neighborhood" value={formData.neighborhood} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900" required /></div></div>
                    <div><label htmlFor="city" className="text-sm font-medium text-gray-700 block mb-2">Cidade</label><div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" id="city" value={formData.city} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900" required /></div></div>
                    <div><label htmlFor="state" className="text-sm font-medium text-gray-700 block mb-2">Estado</label><div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" id="state" value={formData.state} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900" required /></div></div>
                  </div>
                </div>
              </div>

              {/* Shipping Options */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Opções de Frete</h2>
                {isCalculatingShipping && <div className="flex justify-center items-center gap-2 text-gray-600"><Loader2 className="animate-spin" /> Calculando frete...</div>}
                <div className="space-y-3 mt-4">
                  {shippingOptions.map(option => (
                    <label key={option.id} className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${selectedShipping?.id === option.id ? 'bg-red-50 border-red-500' : 'border-gray-200 hover:border-gray-400'}`}>
                      <input type="radio" name="shipping" checked={selectedShipping?.id === option.id} onChange={() => setSelectedShipping(option)} className="hidden" />
                      <img src={option.company.picture} alt={option.company.name} className="w-8 h-8 mr-4" />
                      <div className="flex-grow"><p className="font-semibold text-gray-900">{option.name}</p><p className="text-sm text-gray-600">Entrega em até {option.delivery_time} dias úteis</p></div>
                      <p className="text-lg font-bold text-gray-900">{formatPrice(parseFloat(option.price))}</p>
                    </label>
                  ))}
                </div>
              </div>

              {/* Cashback */}
              {cashbackBalance > 0 && (
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4"><Gift size={24} /> Usar Saldo de Cashback</h2>
                      <p className="text-sm text-gray-600 mb-4">Você tem <span className="font-bold text-green-600">{formatPrice(cashbackBalance)}</span> disponíveis.</p>
                      <div className="flex items-center gap-4">
                          <input type="text" value={cashbackToApply} onChange={handleCashbackChange} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900" placeholder="0.00" />
                          <button type="button" onClick={() => setCashbackToApply(Math.min(cashbackBalance, totalBeforeCashback).toFixed(2))} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Usar Tudo</button>
                      </div>
                  </div>
              )}

              {/* Payment */}
              {selectedShipping && (
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Lock size={24} /> 3. Pagamento</h2>
                  {error && <div className="flex items-center gap-2 text-red-700 bg-red-100 p-3 rounded-md mb-4"><AlertCircle size={20} /> {error}</div>}
                  {isSubmitting && <div className="flex justify-center items-center gap-2 text-gray-600 p-4"><Loader2 className="animate-spin" /> Processando seu pedido e pagamento...</div>}
                  
                  {/* Payment Method Selector */}
                  <div className="mb-6 space-y-3">
                    <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${selectedPaymentMethod === 'mercadopago' ? 'bg-red-50 border-red-500' : 'border-gray-200 hover:border-gray-400'}`}>
                        <input type="radio" name="paymentMethod" checked={selectedPaymentMethod === 'mercadopago'} onChange={() => setSelectedPaymentMethod('mercadopago')} className="hidden" />
                        <div className="flex items-center gap-3">
                            <img src="/mercado-pago-logo-2.png" alt="Mercado Pago" className="w-8 h-8 object-contain" />
                            <p className="font-semibold text-gray-900">Cartão, Pix ou Boleto (Mercado Pago)</p>
                        </div>
                    </label>
                    
                    {paymentOnDeliveryActive && (
                        <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${selectedPaymentMethod === 'cod' ? 'bg-red-50 border-red-500' : 'border-gray-200 hover:border-gray-400'}`}>
                            <input type="radio" name="paymentMethod" checked={selectedPaymentMethod === 'cod'} onChange={() => setSelectedPaymentMethod('cod')} className="hidden" />
                            <div className="flex items-center gap-3">
                                <DollarSign className="w-8 h-8 text-green-600" />
                                <p className="font-semibold text-gray-900">Pagamento na Entrega</p>
                            </div>
                        </label>
                    )}
                  </div>

                  {/* Mercado Pago Brick */}
                  {selectedPaymentMethod === 'mercadopago' && (
                    <div style={{ display: isSubmitting ? 'none' : 'block' }}>
                      <MercadoPagoBrick
                        amount={finalTotal}
                        onPaymentSuccess={() => {}} // A lógica agora está no onSubmit
                        onPaymentError={handleOrderError} // Usando handleOrderError para capturar erros do MP
                        orderId="" // O ID do pedido será gerado dentro do onSubmit
                        onSubmit={handlePaymentSubmit}
                      />
                    </div>
                  )}
                  
                  {/* COD Button */}
                  {selectedPaymentMethod === 'cod' && (
                    <button
                        onClick={handlePaymentOnDeliverySubmit}
                        disabled={isSubmitting}
                        className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <DollarSign size={20} />}
                        Finalizar Pedido (Pagar na Entrega)
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-2/5">
            <div className="sticky top-28 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-4 mb-4">Resumo do Pedido</h2>
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {cartItems.map(item => {
                  const itemPrice = calculateItemPrice(item);
                  const variantDescription = [item.selectedVariant.color, item.selectedVariant.size].filter(Boolean).join(' / ');
                  const imageUrl = item.selectedVariant.image_url || item.imageUrl;
                  return (
                    <div key={item.id + item.selectedVariant.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img src={imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                        <div><p className="font-semibold text-gray-900">{item.name}</p>{variantDescription && <p className="text-xs text-gray-600">{variantDescription}</p>}<p className="text-sm text-gray-600">Qtd: {item.quantity}</p></div>
                      </div>
                      <p className="font-semibold text-gray-900">{formatPrice(itemPrice * item.quantity)}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Frete</span><span>{selectedShipping ? formatPrice(shippingCost) : 'A calcular'}</span></div>
                {appliedCashback > 0 && (
                  <div className="flex justify-between text-green-600"><span>Cashback Aplicado</span><span>- {formatPrice(appliedCashback)}</span></div>
                )}
              </div>
              <div className="flex justify-between text-xl font-extrabold text-gray-900 mt-6 pt-4 border-t border-gray-200">
                <span>Total</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;