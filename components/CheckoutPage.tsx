import React, { useState, useEffect } from 'react';
import { CartItem, ShippingOption } from '../types';
import { Lock, User, Home, MapPin, Mail, Truck, Loader2, AlertCircle, FileText, Hash, Gift, CreditCard, DollarSign } from 'lucide-react';
import { supabase } from '../src/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import PageHeader from '../src/components/PageHeader';
import usePageHeader from '../src/hooks/usePageHeader';
import emailjs from "@emailjs/browser";

interface CheckoutPageProps {
  cartItems: CartItem[];
  onNavigate: (page: string) => void;
  session: Session | null;
  globalDiscountPercentage: number;
  paymentOnDeliveryActive: boolean;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ cartItems, onNavigate, session, globalDiscountPercentage, paymentOnDeliveryActive }) => {
  const { headerData, isLoading: isHeaderLoading } = usePageHeader('checkout');
  
  const SUCCESS_URL = import.meta.env.VITE_URL_SUCESSO || `${window.location.origin}/?payment_status=success`;
  const CANCEL_URL = import.meta.env.VITE_URL_CANCELAMENTO || `${window.location.origin}/?payment_status=failure`;

  if (cartItems.length === 0) {
    useEffect(() => {
      onNavigate('cart');
    }, [onNavigate]);
    
    return <div className="flex justify-center items-center p-8 h-screen"><Loader2 className="animate-spin" size={32} /></div>;
  }

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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'cod'>('stripe');

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
        const { data } = await supabase
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
  
  useEffect(() => {
    if (paymentOnDeliveryActive) {
        setSelectedPaymentMethod('cod');
    } else {
        setSelectedPaymentMethod('stripe');
    }
  }, [paymentOnDeliveryActive]);

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
    let price = item.selectedVariant.price ?? item.discount_price ?? item.price;

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
          message: formattedCartItems
        },
        "jOZo1dRNn4uZBaV9T"
      );
      console.log("E-mail de confirmação enviado com sucesso!");
    } catch (emailError: any) {
      console.error("Falha ao enviar e-mail de confirmação:", emailError);
    }
      
    return newOrderId;
  };

  const handleStripePayment = async () => {
    if (!selectedShipping) {
      setError('Por favor, selecione uma opção de frete antes de pagar.');
      return;
    }
    
    // Validação básica dos campos de endereço
    const requiredFields = ['fullName', 'email', 'document', 'postalCode', 'street', 'number', 'neighborhood', 'city', 'state'];
    const missingField = requiredFields.find(field => !formData[field as keyof typeof formData]);
    
    if (missingField) {
        setError(`Por favor, preencha o campo obrigatório: ${missingField}.`);
        return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Criar o pedido no banco de dados com status 'Processando' (default)
      // O webhook do Stripe irá atualizar para 'Pago'
      const newOrderId = await createOrderAndNotify('Processando');
      
      // 2. Preparar dados para a Edge Function do Stripe
      const stripeItems = cartItems.map(item => ({
        name: item.name,
        price: calculateItemPrice(item),
        quantity: item.quantity,
        imageUrl: item.imageUrl,
        variantDescription: [item.selectedVariant.color_name, item.selectedVariant.size].filter(Boolean).join(' / '),
      }));

      const { data: sessionData, error: invokeError } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          items: stripeItems,
          customerEmail: formData.email,
          shippingCost: shippingCost,
          orderId: newOrderId,
          userId: session?.user?.id,
          successUrl: SUCCESS_URL,
          cancelUrl: CANCEL_URL,
        },
      });

      if (invokeError) {
        throw new Error(`Erro ao criar sessão de checkout: ${invokeError.message}`);
      }
      
      if (sessionData.error) {
        throw new Error(sessionData.error);
      }

      // 3. Redirecionar para o Stripe
      window.location.href = sessionData.url;

    } catch (e: any) {
      handleOrderError(e);
    } finally {
      // Não definimos isSubmitting como false aqui, pois o usuário será redirecionado
      // Apenas em caso de erro antes do redirecionamento, ele será reativado.
    }
  };
  
  const handlePaymentOnDeliverySubmit = async () => {
    if (!selectedShipping) {
      setError('Por favor, selecione uma opção de frete antes de finalizar.');
      return;
    }
    
    // Validação básica dos campos de endereço
    const requiredFields = ['fullName', 'email', 'document', 'postalCode', 'street', 'number', 'neighborhood', 'city', 'state'];
    const missingField = requiredFields.find(field => !formData[field as keyof typeof formData]);
    
    if (missingField) {
        setError(`Por favor, preencha o campo obrigatório: ${missingField}.`);
        return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Criar o pedido no banco de dados com status 'Processando' (default)
      await createOrderAndNotify('Processando');
      
      // 2. Sucesso
      handleOrderSuccess('COD'); 
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
                  {isSubmitting && <div className="flex justify-center items-center gap-2 text-gray-600 p-4"><Loader2 className="animate-spin" /> Processando pagamento...</div>}
                  
                  {/* Payment Method Selector */}
                  <div className="mb-6 space-y-3">
                    <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${selectedPaymentMethod === 'stripe' ? 'bg-red-50 border-red-500' : 'border-gray-200 hover:border-gray-400'}`}>
                        <input type="radio" name="paymentMethod" checked={selectedPaymentMethod === 'stripe'} onChange={() => setSelectedPaymentMethod('stripe')} className="hidden" />
                        <div className="flex items-center gap-3">
                            <CreditCard className="w-8 h-8 text-indigo-600" />
                            <p className="font-semibold text-gray-900">Cartão de Crédito/Débito (Stripe)</p>
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

                  {/* Stripe Button */}
                  {selectedPaymentMethod === 'stripe' && (
                    <button
                        onClick={handleStripePayment}
                        disabled={isSubmitting}
                        className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CreditCard size={20} />}
                        Pagar com Stripe ({formatPrice(finalTotal)})
                    </button>
                  )}
                  
                  {/* COD Button */}
                  {selectedPaymentMethod === 'cod' && (
                    <button
                        onClick={handlePaymentOnDeliverySubmit}
                        disabled={isSubmitting}
                        className="w-full bg-red-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-600 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Lock size={20} />}
                        Finalizar Pedido (Pagar na Entrega)
                    </button>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    {selectedPaymentMethod === 'stripe' 
                        ? 'Você será redirecionado para a página de pagamento seguro do Stripe.'
                        : 'Seu pedido será criado com status "Processando".'
                    }
                  </p>
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