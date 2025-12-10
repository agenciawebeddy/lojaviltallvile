import React from 'react';
import PageHeader from './PageHeader';
import usePageHeader from '../hooks/usePageHeader';
import { Loader2 } from 'lucide-react';

const HelpPage: React.FC = () => {
  const { headerData, isLoading } = usePageHeader('ajuda-e-suporte');

  if (isLoading) {
    return <div className="flex justify-center items-center p-8 h-screen"><Loader2 className="animate-spin" size={32} /></div>;
  }

  return (
    <div className="bg-white text-gray-800">
      <PageHeader 
        title={headerData?.title || 'Ajuda e Suporte'}
        description={headerData?.description || 'Encontre respostas para suas dúvidas.'}
        imageUrl={headerData?.image_url}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Dúvidas Frequentes</h2>
            <p className="text-gray-600">Aqui você encontra as respostas para as perguntas mais comuns sobre nossos produtos e serviços. Navegue pelas seções para encontrar a ajuda que precisa.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Como faço para acompanhar meu pedido?</h3>
            <p className="text-gray-600">Após a confirmação do pagamento, você receberá um e-mail com o código de rastreamento. Você pode usar esse código no site da transportadora para acompanhar o status da sua entrega.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Quais são as formas de pagamento aceitas?</h3>
            <p className="text-gray-600">Aceitamos pagamentos via Cartão de Crédito, Boleto Bancário e PIX através do Mercado Pago, garantindo total segurança na sua transação.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;