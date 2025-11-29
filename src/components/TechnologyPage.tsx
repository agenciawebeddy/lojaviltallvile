import React from 'react';
import { Code, Database, Zap, Truck, CreditCard, LayoutDashboard, Gift, Shield, Loader2 } from 'lucide-react';
import PageHeader from './PageHeader';
import usePageHeader from '../hooks/usePageHeader';

const TechnologyPage: React.FC = () => {
  const { headerData, isLoading } = usePageHeader('tecnologia');

  const techStack = [
    { icon: <Code className="h-8 w-8 text-red-500" />, title: 'Frontend Moderno', description: 'Construído com React 19 e TypeScript para uma interface rápida, escalável e livre de erros.' },
    { icon: <Zap className="h-8 w-8 text-red-500" />, title: 'Estilo e Responsividade', description: 'Utilizamos Tailwind CSS para um design responsivo, moderno e totalmente adaptável a qualquer dispositivo.' },
    { icon: <Database className="h-8 w-8 text-red-500" />, title: 'Backend Robusto (Supabase)', description: 'Supabase (PostgreSQL) como nosso banco de dados e backend, garantindo segurança, RLS (Row Level Security) e funções de banco de dados eficientes.' },
  ];

  const features = [
    { icon: <CreditCard className="h-8 w-8 text-green-500" />, title: 'Pagamento Integrado', description: 'Processamento de pagamentos seguro e transparente via Mercado Pago, aceitando Pix, Cartão de Crédito e mais.' },
    { icon: <Truck className="h-8 w-8 text-green-500" />, title: 'Logística Otimizada', description: 'Cálculo de frete em tempo real e gestão de etiquetas via API do Melhor Envio.' },
    { icon: <Gift className="h-8 w-8 text-green-500" />, title: 'Sistema de Cashback', description: 'Incentivo à fidelidade do cliente com um sistema de cashback integrado e gerenciável pelo administrador.' },
    { icon: <LayoutDashboard className="h-8 w-8 text-green-500" />, title: 'Painel Administrativo', description: 'Interface completa para gerenciar produtos, categorias, pedidos, slides e configurações da loja.' },
    { icon: <Shield className="h-8 w-8 text-green-500" />, title: 'Segurança RLS', description: 'Todas as tabelas do banco de dados possuem Row Level Security (RLS) ativada para proteger os dados dos usuários.' },
  ];
  
  if (isLoading) {
      return <div className="flex justify-center items-center p-8 h-screen"><Loader2 className="animate-spin" size={32} /></div>;
  }

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen">
      <PageHeader 
        title={headerData?.title || 'Tecnologia e Recursos da Loja'}
        description={headerData?.description || 'Conheça a arquitetura moderna e as funcionalidades que tornam a VitalVillé rápida e segura.'}
        imageUrl={headerData?.image_url}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Tech Stack Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-extrabold text-center mb-10 text-gray-900">Pilha Tecnológica (Tech Stack)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {techStack.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-lg text-center">
                <div className="flex justify-center mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section>
          <h2 className="text-3xl font-extrabold text-center mb-10 text-gray-900 border-t pt-12">Funcionalidades Principais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-md flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">{item.icon}</div>
                <div>
                  <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TechnologyPage;