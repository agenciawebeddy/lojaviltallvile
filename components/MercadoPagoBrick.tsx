import React from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

const MERCADO_PAGO_PUBLIC_KEY = 'APP_USR-20aecbec-5586-45ad-aa8d-eed850bc6e08'; 

// Inicializa o Mercado Pago diretamente, pois a chave já está definida.
initMercadoPago(MERCADO_PAGO_PUBLIC_KEY, { locale: 'pt-BR' });

interface MercadoPagoBrickProps {
  amount: number;
  onPaymentSuccess: (paymentId: string, status: string) => void;
  onPaymentError: (error: any) => void;
  onSubmit: (formData: any) => Promise<void>;
  orderId: string; // Mantido para compatibilidade, mas a lógica principal está no onSubmit
}

const MercadoPagoBrick: React.FC<MercadoPagoBrickProps> = ({ amount, onPaymentError, onSubmit }) => {

  const initialization = {
    amount: amount,
  };

  const customization = {
    paymentMethods: {
      creditCard: 'all',
      debitCard: 'all',
      ticket: 'all',
      pix: 'all',
    },
    visual: {
      style: {
        theme: 'default', // Alterado para o tema claro
        customVariables: {
          baseColor: '#374151', // gray-700 para textos
          backgroundColor: '#f9fafb', // gray-50 para o fundo
          formBackgroundColor: '#ffffff', // white para o fundo do formulário
          inputBackgroundColor: '#ffffff', // white para inputs
          borderRadius: '0.5rem',
          fontSizeMedium: '1rem',
          // Adicionando cores para combinar com o tema da loja
          primaryColor: '#ef4444', // red-500
          secondaryColor: '#f87171', // red-400
        }
      }
    }
  } as const;

  return (
    <Payment
      initialization={initialization}
      customization={customization}
      onSubmit={onSubmit}
      onReady={() => console.log('Brick de pagamento pronto!')}
      onError={(error) => onPaymentError(error)}
    />
  );
};

export default MercadoPagoBrick;