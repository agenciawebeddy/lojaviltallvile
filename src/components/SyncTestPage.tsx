import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Product } from '../../types';
import { Loader2, AlertCircle, Send, Bug } from 'lucide-react';

const SyncTestPage: React.FC = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [productDataJson, setProductDataJson] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResponse, setSuccessResponse] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllProducts = async () => {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (data) {
        setAllProducts(data);
      }
    };
    fetchAllProducts();
  }, []);

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const product = allProducts.find(p => p.id === productId);
    if (product) {
      setProductDataJson(JSON.stringify(product, null, 2));
    } else {
      setProductDataJson('');
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);
    setSuccessResponse(null);

    let productPayload;
    try {
      productPayload = JSON.parse(productDataJson);
    } catch (e) {
      setError('O formato JSON dos dados do produto é inválido.');
      setIsSyncing(false);
      return;
    }

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('sync-product-to-melhor-envio', {
        body: { product: productPayload },
      });

      if (invokeError) {
        throw invokeError;
      }
      
      setSuccessResponse(JSON.stringify(data, null, 2));

    } catch (e: any) {
      let fullErrorDetails;
      try {
        fullErrorDetails = JSON.stringify(e, null, 2);
      } catch {
        fullErrorDetails = e.toString();
      }
      setError(`Ocorreu um erro. Detalhes completos:\n\n${fullErrorDetails}`);
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-2">
            <Bug size={32} className="text-red-500"/>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Teste de Sincronização de Produto</h1>
        </div>
        <p className="text-gray-600 mb-8">Use esta ferramenta para enviar dados de um produto para a função de sincronização e ver a resposta bruta.</p>

        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
          <div>
            <label htmlFor="product-select" className="block text-sm font-medium text-gray-700 mb-2">1. Selecione um Produto para Testar</label>
            <select
              id="product-select"
              value={selectedProductId}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">-- Escolha um produto --</option>
              {allProducts.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="product-data" className="block text-sm font-medium text-gray-700 mb-2">2. Dados do Produto (JSON - editável)</label>
            <textarea
              id="product-data"
              value={productDataJson}
              onChange={(e) => setProductDataJson(e.target.value)}
              rows={15}
              className="w-full bg-gray-50 font-mono text-sm border border-gray-300 rounded-md text-green-700 p-3 focus:ring-red-500 focus:border-red-500"
              placeholder="Selecione um produto ou cole o JSON aqui..."
            />
          </div>

          <button
            onClick={handleSync}
            disabled={isSyncing || !productDataJson}
            className="w-full flex items-center justify-center gap-2 bg-red-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-600 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            {isSyncing ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            <span>3. Sincronizar com Melhor Envio</span>
          </button>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Resultados</h2>
          {isSyncing && (
            <div className="flex justify-center items-center gap-2 text-gray-600 p-4 bg-white rounded-lg border border-gray-200">
              <Loader2 className="animate-spin" /> Sincronizando...
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 font-semibold">
                <AlertCircle size={20} /> Erro na Sincronização
              </div>
              <pre className="mt-2 text-red-700 text-sm whitespace-pre-wrap font-mono"><code>{error}</code></pre>
            </div>
          )}
          {successResponse && (
             <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Resposta de Sucesso da API</h3>
              <pre className="bg-gray-50 p-3 rounded-md text-sm text-gray-700 overflow-x-auto border border-gray-200">
                <code>{successResponse}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyncTestPage;