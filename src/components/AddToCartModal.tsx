import React from 'react';
import { CartItem } from '../../types';
import { CheckCircle, X } from 'lucide-react';

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewCart: () => void;
  item: CartItem | null;
}

const AddToCartModal: React.FC<AddToCartModalProps> = ({ isOpen, onClose, onViewCart, item }) => {
  if (!isOpen || !item) return null;

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const itemPrice = item.selectedVariant.price ?? item.price;
  const colorDisplay = item.selectedVariant.color_name || item.selectedVariant.color;
  const variantDescription = [colorDisplay, item.selectedVariant.size].filter(Boolean).join(' / ');
  const imageUrl = item.selectedVariant.image_url || item.imageUrl;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md border border-gray-200 relative animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition-colors">
          <X size={24} />
        </button>
        
        <div className="p-8 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Produto Adicionado!</h2>
          
          <div className="text-left bg-gray-50 p-4 rounded-md my-6 flex items-center gap-4 border border-gray-200">
            <img src={imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
            <div>
              <p className="font-semibold text-gray-800">{item.name}</p>
              {variantDescription && <p className="text-sm text-gray-600">{variantDescription}</p>}
              <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
              <p className="font-bold text-red-500">{formatPrice(itemPrice * item.quantity)}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button 
              onClick={onClose}
              className="w-full bg-white text-gray-800 font-bold py-3 px-6 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              Continuar
            </button>
            <button 
              onClick={onViewCart}
              className="w-full bg-red-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-600 transition-colors"
            >
              Ver Carrinho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal;