import React from 'react';
import { Globe } from 'lucide-react';
import { SocialLink } from '../types';
import SocialIconRenderer from '../src/components/SocialIconRenderer';

interface FooterProps {
  onNavigate: (page: string) => void;
  socialLinks: SocialLink[];
  onCategorySelect: (categoryName: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, socialLinks, onCategorySelect }) => {
  const handleOutletClick = () => {
    onCategorySelect('Outlet');
  };

  return (
    <footer className="bg-gray-800 text-gray-300">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-white uppercase mb-4">Departamentos</h3>
            <ul className="space-y-2 text-sm">
              <li><a onClick={() => onNavigate('shop')} className="hover:text-white cursor-pointer">Todos departamentos</a></li>
              <li><a onClick={handleOutletClick} className="hover:text-white cursor-pointer">Outlet</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white uppercase mb-4">Informações</h3>
            <ul className="space-y-2 text-sm">
              <li><a onClick={() => onNavigate('tecnologia')} className="hover:text-white cursor-pointer">Tecnologia e Recursos</a></li>
              <li><a onClick={() => onNavigate('ajuda')} className="hover:text-white cursor-pointer">Ajuda e Suporte</a></li>
              <li><a onClick={() => onNavigate('contato')} className="hover:text-white cursor-pointer">Contato</a></li>
              <li><a onClick={() => onNavigate('trocas')} className="hover:text-white cursor-pointer">Política de Trocas e Devoluções</a></li>
              <li><a onClick={() => onNavigate('privacidade')} className="hover:text-white cursor-pointer">Política de Privacidade</a></li>
              <li><a onClick={() => onNavigate('termos')} className="hover:text-white cursor-pointer">Termos e Condições</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white uppercase mb-4">Nossa Loja</h3>
            <address className="not-italic space-y-2 text-sm">
              <p>Rua Equestre, 77 - São Paulo - SP, 89226-460</p>
              <p>(11) 97961-3666</p>
              <p>agencia.webeddy@gmail.com</p>
            </address>
          </div>
          <div>
            <h3 className="font-bold text-white uppercase mb-4">Horário de Atendimento</h3>
            <div className="space-y-2 text-sm">
              <p>Segunda a Sexta: 9h às 19h</p>
              <p>Sábado: 9h às 13h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Footer */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <h4 className="font-semibold text-white mb-2">Sistema de pagamento:</h4>
            <img src="/mercado-pago-logo-2.png" alt="Mercado Pago" className="h-10 w-auto" />
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Nossas redes sociais:</h4>
            <div className="flex items-center gap-4">
              {socialLinks.length > 0 ? (
                socialLinks.map(link => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                    <SocialIconRenderer
                      name={link.name}
                      iconUrl={link.icon_url}
                      size={20}
                      className="text-gray-300 hover:text-white"
                    />
                  </a>
                ))
              ) : (
                <>
                  <SocialIconRenderer name="Facebook" size={20} className="text-gray-300 hover:text-white" />
                  <SocialIconRenderer name="Instagram" size={20} className="text-gray-300 hover:text-white" />
                  <SocialIconRenderer name="Youtube" size={20} className="text-gray-300 hover:text-white" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-xs">
          <p>© 2015 VitalVille. Todos os direitos reservados. CNPJ: 0000000000</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;