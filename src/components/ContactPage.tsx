import React from 'react';
import PageHeader from './PageHeader';
import usePageHeader from '../hooks/usePageHeader';
import { Loader2, Phone, Mail, MapPin } from 'lucide-react';
import ContactForm from './ContactForm'; // Importando o novo componente

const ContactPage: React.FC = () => {
  const { headerData, isLoading } = usePageHeader('contato');

  if (isLoading) {
    return <div className="flex justify-center items-center p-8 h-screen"><Loader2 className="animate-spin" size={32} /></div>;
  }

  return (
    <div className="bg-white text-gray-800">
      <PageHeader 
        title={headerData?.title || 'Entre em Contato'}
        description={headerData?.description || 'Fale conosco através dos nossos canais.'}
        imageUrl={headerData?.image_url}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nossos Canais</h2>
              <p className="text-gray-600">Estamos disponíveis para ajudar. Escolha a melhor forma de falar com a gente.</p>
            </div>
            <div className="flex items-start gap-4">
              <Phone className="h-6 w-6 text-red-500 mt-1" />
              <div>
                <h3 className="font-semibold">Telefone</h3>
                <p className="text-gray-600">(47) 99159-7333</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Mail className="h-6 w-6 text-red-500 mt-1" />
              <div>
                <h3 className="font-semibold">E-mail</h3>
                <p className="text-gray-600">agencia.webeddy@gmail.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin className="h-6 w-6 text-red-500 mt-1" />
              <div>
                <h3 className="font-semibold">Endereço</h3>
                <p className="text-gray-600">Rua Equestre, 77 - São Paulo - SP, 89226-460</p>
              </div>
            </div>
          </div>
          {/* Formulário de Contato */}
          <ContactForm />
        </div>
      </div>
    </div>
  );
};

export default ContactPage;