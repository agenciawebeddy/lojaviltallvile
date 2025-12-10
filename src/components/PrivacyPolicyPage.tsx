import React from 'react';
import PageHeader from './PageHeader';
import usePageHeader from '../hooks/usePageHeader';
import { Loader2 } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  const { headerData, isLoading } = usePageHeader('politica-de-privacidade');

  if (isLoading) {
    return <div className="flex justify-center items-center p-8 h-screen"><Loader2 className="animate-spin" size={32} /></div>;
  }

  return (
    <div className="bg-white text-gray-800">
      <PageHeader 
        title={headerData?.title || 'Política de Privacidade'}
        description={headerData?.description || 'Sua privacidade é nossa prioridade.'}
        imageUrl={headerData?.image_url}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto space-y-6 prose lg:prose-lg">
          <h2>1. Coleta de Informações</h2>
          <p>Coletamos informações que você nos fornece diretamente, como quando você cria uma conta, faz um pedido ou entra em contato conosco. Isso pode incluir seu nome, e-mail, endereço e informações de pagamento.</p>
          
          <h2>2. Uso das Informações</h2>
          <p>Utilizamos suas informações para processar seus pedidos, nos comunicar com você, personalizar sua experiência de compra e melhorar nossos serviços. Não compartilhamos seus dados com terceiros, exceto quando necessário para a prestação de nossos serviços (ex: transportadoras).</p>

          <h2>3. Segurança</h2>
          <p>Implementamos medidas de segurança para proteger suas informações pessoais contra acesso não autorizado e uso indevido. Todas as transações de pagamento são criptografadas.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;