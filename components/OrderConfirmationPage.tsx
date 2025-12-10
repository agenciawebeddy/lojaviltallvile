import React from 'react';
import { CheckCircle } from 'lucide-react';

interface OrderConfirmationPageProps {
  onNavigate: (page: string) => void;
}

const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ onNavigate }) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="max-w-lg mx-auto bg-white p-8 rounded-lg border border-gray-200 shadow-2xl text-gray-900">
        <CheckCircle className="mx-auto h-24 w-24 text-red-500" strokeWidth={1.5} />
        <h1 className="mt-8 text-4xl font-extrabold text-gray-900 tracking-tight">Obrigado pelo seu pedido!</h1>
        <p className="mt-4 text-lg text-gray-600">
          Seu pedido foi recebido e está sendo processado. Você receberá uma confirmação por e-mail em breve.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="mt-10 bg-red-500 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Continuar Comprando
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;