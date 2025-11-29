import React from 'react';
import PageHeader from '../src/components/PageHeader';
import usePageHeader from '../src/hooks/usePageHeader';
import { Loader2, Zap, MessageSquare, Star } from 'lucide-react';

const AboutPage: React.FC = () => {
  const { headerData, isLoading } = usePageHeader('sobre');

  const features = [
    {
      icon: <Star className="h-8 w-8 text-red-500" />,
      title: 'Qualidade Superior',
      description: 'Selecionamos cuidadosamente cada item para garantir a melhor qualidade e durabilidade.',
    },
    {
      icon: <Zap className="h-8 w-8 text-red-500" />,
      title: 'Logística Otimizada',
      description: 'Receba seus produtos rapidamente e com segurança no conforto da sua casa.',
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-red-500" />,
      title: 'Suporte Dedicado',
      description: 'Nossa equipe está sempre pronta para ajudar com qualquer dúvida ou problema.',
    },
  ];
  
  if (isLoading) {
      return <div className="flex justify-center items-center p-8 h-screen"><Loader2 className="animate-spin" size={32} /></div>;
  }

  return (
    <div className="bg-white text-gray-800">
      {/* Hero Section */}
      <PageHeader 
        title={headerData?.title || 'Sobre a VitalVillé'}
        description={headerData?.description || 'Conectando você aos melhores produtos com paixão e tecnologia.'}
        imageUrl={headerData?.image_url}
      />

      {/* Content Section */}
      <div className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            
            {/* Our Story */}
            <div className="mb-16">
              <h2 className="text-3xl font-extrabold tracking-tight text-center sm:text-4xl mb-4 text-gray-900">Nossa História</h2>
              <p className="text-lg text-gray-600 leading-relaxed text-center">
                A VitalVillé nasceu de um sonho: criar uma experiência de compra online que fosse não apenas conveniente, mas também inspiradora. Fundada em 2024, começamos como uma pequena operação focada em produtos de tecnologia e, com a paixão de nossa equipe e a confiança de nossos clientes, crescemos para oferecer uma vasta gama de produtos em diversas categorias. Nosso compromisso sempre foi o mesmo: oferecer produtos incríveis com um serviço que encanta.
              </p>
            </div>

            {/* Our Mission */}
             <div className="mb-20 text-center p-8 bg-red-50 border border-red-200 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold mb-3 text-gray-900">Nossa Missão</h3>
                <p className="text-xl text-red-600 italic">
                    "Facilitar o acesso a produtos de alta qualidade que melhorem o dia a dia de nossos clientes, através de uma plataforma inovadora, confiável e com atendimento humano."
                </p>
            </div>


            {/* Why Choose Us */}
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-center sm:text-4xl mb-12 text-gray-900">Por que nos escolher?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature) => (
                  <div key={feature.title} className="text-center p-6 bg-white rounded-lg border border-gray-200 shadow-sm transition-shadow duration-300 hover:shadow-lg">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mx-auto mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;