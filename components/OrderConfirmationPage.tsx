import React from 'react';
import { CheckCircle } from 'lucide-react';

interface OrderConfirmationPageProps {
  onNavigate: (page: string) => void;
}

const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ onNavigate }) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="max-w-lg mx-auto bg-gray-800 p-8 rounded-lg border border-gray-700 shadow-2xl">
        <CheckCircle className="mx-auto h-24 w-24 text-green-500" strokeWidth={1.5} />
        <h1 className="mt-8 text-4xl font-extrabold text-white tracking-tight">Obrigado pelo seu pedido!</h1>
        <p className="mt-4 text-lg text-gray-400">
          Seu pedido foi recebido e está sendo processado. Você receberá uma confirmação por e-mail em breve.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="mt-10 bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Continuar Comprando
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;