import React from 'react';
import PageHeader from './PageHeader';
import usePageHeader from '../hooks/usePageHeader';
import { Loader2 } from 'lucide-react';

const ReturnsPolicyPage: React.FC = () => {
  const { headerData, isLoading } = usePageHeader('politica-de-trocas');

  if (isLoading) {
    return <div className="flex justify-center items-center p-8 h-screen"><Loader2 className="animate-spin" size={32} /></div>;
  }

  return (
    <div className="bg-white text-gray-800">
      <PageHeader 
        title={headerData?.title || 'Política de Trocas e Devoluções'}
        description={headerData?.description || 'Entenda como funciona nosso processo.'}
        imageUrl={headerData?.image_url}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto space-y-6 prose lg:prose-lg">
          <h2>1. Condições Gerais</h2>
          <p>Todas as ocorrências que envolvam troca ou devolução devem ser feitas no prazo de até 7 (sete) dias, a contar da data de entrega, e devem ser comunicadas ao nosso setor de atendimento ao cliente.</p>
          
          <h2>2. Quando recusar o produto</h2>
          <p>Os produtos são enviados ao cliente exatamente como nos foram entregues pelo fabricante. Se ocorrer qualquer das hipóteses abaixo, recuse o recebimento e escreva o motivo da recusa no verso do Danfe:</p>
          <ul>
            <li>Embalagem aberta ou avariada;</li>
            <li>Produto avariado;</li>
            <li>Produto em desacordo com o pedido;</li>
            <li>Falta de acessórios.</li>
          </ul>

          <h2>3. Troca ou cancelamento da compra</h2>
          <p>A devolução de qualquer produto só pode ser feita no prazo de até 7 (sete) dias, a contar da data de entrega. Nesse período, se o produto apresentar defeito, ou se você não estiver satisfeito(a) com a compra, comunique nosso setor de atendimento ao cliente e solicite a troca.</p>
        </div>
      </div>
    </div>
  );
};

export default ReturnsPolicyPage;