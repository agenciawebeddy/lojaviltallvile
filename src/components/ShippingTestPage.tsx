import React, { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Loader2, AlertCircle, Truck } from 'lucide-react';
import { CartItem, ShippingOption } from '../../types';

// Produto fixo para o teste
const testProduct: CartItem = {
  id: 'test-product-1',
  name: 'Produto de Teste',
  category: ['Teste'],
  price: 99.90,
  imageUrl: 'https://picsum.photos/200',
  rating: 5,
  description: 'Um produto para testar o cálculo de frete.',
  weight: 0.5, // kg
  width: 15,  // cm
  height: 5, // cm
  length: 20, // cm
  quantity: 1,
  selectedVariant: {
    id: 'default-test-variant',
    product_id: 'test-product-1',
    stock: 1,
  },
};

const ShippingTestPage: React.FC = () => {
  const [postalCode, setPostalCode] = useState('');
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);

  const handleCalculateShipping = async () => {
    if (postalCode.replace(/\D/g, '').length !== 8) {
      setError('Por favor, insira um CEP válido com 8 dígitos.');
      return;
    }
    setIsCalculating(true);
    setError(null);
    setShippingOptions([]);
    setRawResponse(null);

    const shippingDetails = {
        postalCode: postalCode,
        address: "Rua de Teste",
        city: "Cidade Teste",
        fullName: "Cliente Teste",
        email: "teste@example.com"
    };

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('calculate-shipping', {
        body: { 
          shippingDetails: shippingDetails, 
          cartItems: [testProduct] 
        },
      });

      setRawResponse(JSON.stringify(data, null, 2));

      if (invokeError) {
        // Tenta extrair uma mensagem de erro mais detalhada da resposta
        let detailedError = invokeError.message;
        if (invokeError.context && invokeError.context.responseText) {
            try {
                const errorJson = JSON.parse(invokeError.context.responseText);
                if (errorJson.error) {
                    detailedError = errorJson.error;
                }
            } catch (e) {
                // Ignora o erro de parsing, usa a mensagem padrão
            }
        }
        throw new Error(detailedError);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }

      const validOptions = data.filter((option: ShippingOption) => !option.error);
      setShippingOptions(validOptions);
      
      if (validOptions.length === 0 && !data.error) {
        setError('Nenhuma opção de frete encontrada para este CEP. Verifique a resposta crua para mais detalhes.');
      }

    } catch (e: any) {
        setError(e.message || 'Ocorreu um erro inesperado.');
        console.error(e);
    } finally {
        setIsCalculating(false);
    }
  };
  
  const formatPrice = (price: number | string) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numericPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Página de Teste de Frete</h1>
        <p className="text-gray-600 mb-8">Use esta página para testar a comunicação com a API do Melhor Envio.</p>

        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Produto de Teste</h2>
          <div className="flex items-center gap-4">
            <img src={testProduct.imageUrl} alt={testProduct.name} className="w-16 h-16 object-cover rounded-md" />
            <div>
              <p className="font-semibold text-gray-900">{testProduct.name}</p>
              <p className="text-sm text-gray-500">
                {testProduct.weight}kg - {testProduct.length}x{testProduct.width}x{testProduct.height} cm
              </p>
            </div>
            <p className="ml-auto font-semibold text-gray-900">{formatPrice(testProduct.price)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Calcular Frete</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="flex-grow px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-red-500 focus:border-red-500"
              placeholder="Digite o CEP de destino"
            />
            <button
              onClick={handleCalculateShipping}
              disabled={isCalculating}
              className="flex items-center justify-center gap-2 bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed"
            >
              {isCalculating ? <Loader2 className="animate-spin" size={20} /> : <Truck size={20} />}
              <span>Calcular</span>
            </button>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Resultados</h2>
          {isCalculating && (
            <div className="flex justify-center items-center gap-2 text-gray-600 p-4 bg-white rounded-lg border border-gray-200">
              <Loader2 className="animate-spin" /> Calculando...
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 font-semibold">
                <AlertCircle size={20} /> Erro ao Calcular
              </div>
              <p className="mt-2 text-red-700">{error}</p>
            </div>
          )}
          {shippingOptions.length > 0 && (
            <div className="space-y-3">
              {shippingOptions.map(option => (
                <div key={option.id} className="flex items-center p-4 rounded-lg border border-gray-200 bg-white">
                  <img src={option.company.picture} alt={option.company.name} className="w-8 h-8 mr-4" />
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-900">{option.name}</p>
                    <p className="text-sm text-gray-600">Entrega em até {option.delivery_time} dias úteis</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{formatPrice(option.price)}</p>
                </div>
              ))}
            </div>
          )}
          {rawResponse && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Resposta Crua da API</h3>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 overflow-x-auto border border-gray-200">
                <code>{rawResponse}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShippingTestPage;