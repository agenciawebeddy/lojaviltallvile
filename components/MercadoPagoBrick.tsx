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

  // Customização simplificada para evitar erros de propriedades inválidas
  const customization = {
    paymentMethods: {
      creditCard: 'all',
      debitCard: 'all',
      ticket: 'all',
      pix: 'all',
    },
    visual: {
      style: {
        theme: 'default',
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