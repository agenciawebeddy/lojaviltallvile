import React from 'react';
import PageHeader from './PageHeader';
import usePageHeader from '../hooks/usePageHeader';
import { Loader2 } from 'lucide-react';

const TermsPage: React.FC = () => {
  const { headerData, isLoading } = usePageHeader('termos-e-condicoes');

  if (isLoading) {
    return <div className="flex justify-center items-center p-8 h-screen"><Loader2 className="animate-spin" size={32} /></div>;
  }

  return (
    <div className="bg-white text-gray-800">
      <PageHeader 
        title={headerData?.title || 'Termos e Condições'}
        description={headerData?.description || 'Regras de uso da nossa loja.'}
        imageUrl={headerData?.image_url}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto space-y-6 prose lg:prose-lg">
          <h2>1. Aceitação dos Termos</h2>
          <p>Ao acessar e usar este site, você concorda em cumprir estes Termos e Condições. Se você não concordar com qualquer parte dos termos, não poderá usar nossos serviços.</p>
          
          <h2>2. Uso do Site</h2>
          <p>Você concorda em usar o site apenas para fins legais e de maneira que não infrinja os direitos de, restrinja ou iniba o uso e gozo do site por qualquer terceiro.</p>

          <h2>3. Propriedade Intelectual</h2>
          <p>Todo o conteúdo presente no site, incluindo textos, gráficos, logos e imagens, é de nossa propriedade ou de nossos fornecedores e protegido por leis de direitos autorais.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;