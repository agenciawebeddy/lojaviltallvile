import React from 'react';
import { Gift } from 'lucide-react';

interface CashbackBannerProps {
  onNavigate: (page: string) => void;
  percentage: number;
}

const CashbackBanner: React.FC<CashbackBannerProps> = ({ onNavigate, percentage }) => {
  if (!percentage || percentage <= 0) {
    return null;
  }

  return (
    <section className="bg-white py-8 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative bg-blue-600 rounded-lg p-8 md:p-12 overflow-hidden shadow-xl text-white">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6 text-center md:text-left">
                        <div className="bg-blue-700 p-4 rounded-full flex-shrink-0 border border-blue-500">
                            <Gift className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-extrabold">Ganhe {percentage}% de Volta!</h2>
                            <p className="mt-1 max-w-lg">
                                Em todas as compras, você recebe {percentage}% do valor de volta como crédito para usar em pedidos futuros.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => onNavigate('shop')}
                        className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg flex-shrink-0"
                    >
                        Começar a Comprar
                    </button>
                </div>
            </div>
        </div>
    </section>
  );
};

export default CashbackBanner;