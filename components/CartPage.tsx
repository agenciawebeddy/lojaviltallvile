import React from 'react';
import { CartItem } from '../types';
import { Plus, Minus, Trash2, ShoppingCart, Gift, Loader2 } from 'lucide-react';
import PageHeader from '../src/components/PageHeader';
import usePageHeader from '../src/hooks/usePageHeader'; // Importando o hook

interface CartPageProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, variantId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string, variantId: string) => void;
  onNavigate: (page: string) => void;
  onCheckout: () => void;
  freeShippingIsActive: boolean;
  freeShippingThreshold: number;
  globalDiscountPercentage: number; // Nova prop
}

const CartPage: React.FC<CartPageProps> = ({ cartItems, onUpdateQuantity, onRemoveItem, onNavigate, onCheckout, freeShippingIsActive, freeShippingThreshold, globalDiscountPercentage }) => {
  const { headerData, isLoading } = usePageHeader('cart'); // Usando o hook

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const calculateItemPrice = (item: CartItem) => {
    // Prioriza o preço da variante, depois o discount_price do produto, depois o preço base do produto
    let price = item.selectedVariant.price ?? item.discount_price ?? item.price;

    // Se não houver discount_price individual ou da variante, aplica o desconto global
    if (item.selectedVariant.price === undefined && item.discount_price === undefined && globalDiscountPercentage > 0) {
      price = item.price * (1 - (globalDiscountPercentage / 100));
    }
    return price;
  };

  const total = cartItems.reduce((sum, item) => {
    return sum + calculateItemPrice(item) * item.quantity;
  }, 0);

  const amountLeftForFreeShipping = freeShippingThreshold - total;
  const hasFreeShipping = freeShippingIsActive && total >= freeShippingThreshold;
  const progressPercentage = hasFreeShipping ? 100 : (total / freeShippingThreshold) * 100;

  if (isLoading) {
    return <div className="flex justify-center items-center p-8 h-screen"><Loader2 className="animate-spin" size={32} /></div>;
  }

  if (cartItems.length === 0) {
    return (
      <>
        <PageHeader 
          title={headerData?.title || "Seu Carrinho"}
          description={headerData?.description || "Parece que você ainda não adicionou nenhum produto. Que tal explorar a loja?"}
          imageUrl={headerData?.image_url}
        />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <ShoppingCart className="mx-auto h-24 w-24 text-gray-400" strokeWidth={1} />
          <h1 className="mt-8 text-4xl font-extrabold text-gray-900 tracking-tight">Seu carrinho está vazio</h1>
          <button
            onClick={() => onNavigate('shop')}
            className="mt-8 bg-red-500 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Ir para a Loja
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader 
        title={headerData?.title || "Seu Carrinho"}
        description={headerData?.description || "Revise seus itens e prossiga para o checkout."}
        imageUrl={headerData?.image_url}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="w-full lg:w-2/3">
            <div className="space-y-4">
              {cartItems.map(item => {
                const itemPrice = calculateItemPrice(item);
                const colorDisplay = item.selectedVariant.color_name || item.selectedVariant.color;
                const variantDescription = [colorDisplay, item.selectedVariant.size].filter(Boolean).join(' / ');
                return (
                  <div key={item.id + item.selectedVariant.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-lg border border-gray-200 gap-4">
                    {/* Image & Info */}
                    <div className="flex items-center gap-4 flex-grow">
                      <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
                      <div className="flex-grow">
                        <h2 className="text-lg font-bold text-gray-900">{item.name}</h2>
                        {variantDescription && <p className="text-sm text-gray-600">{variantDescription}</p>}
                        <p className="text-md font-semibold text-red-500 mt-1">{formatPrice(itemPrice)}</p>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button onClick={() => onUpdateQuantity(item.id, item.selectedVariant.id, item.quantity - 1)} className="p-2 hover:bg-gray-100 rounded-l-md"><Minus size={16} /></button>
                        <span className="px-4 py-1 font-bold bg-gray-100">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, item.selectedVariant.id, item.quantity + 1)} className="p-2 hover:bg-gray-100 rounded-r-md"><Plus size={16} /></button>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-bold text-gray-900 text-right min-w-[100px]">{formatPrice(itemPrice * item.quantity)}</p>
                        <button onClick={() => onRemoveItem(item.id, item.selectedVariant.id)} className="text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-28 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-4 mb-4">Resumo do Pedido</h2>
              
              {freeShippingIsActive && total > 0 && (
                <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 text-center">
                  {hasFreeShipping ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <Gift size={20} />
                      <p className="font-semibold">Parabéns! Você ganhou frete grátis!</p>
                    </div>
                  ) : (
                    <p className="text-sm text-red-800">
                      Faltam <span className="font-bold">{formatPrice(amountLeftForFreeShipping)}</span> para você ganhar <span className="font-bold">frete grátis!</span>
                    </p>
                  )}
                  <div className="w-full bg-red-200 rounded-full h-2.5 mt-3">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frete</span>
                  <span>A calcular</span>
                </div>
              </div>
              <div className="flex justify-between text-xl font-extrabold text-gray-900 mt-6 pt-4 border-t border-gray-200">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <button 
                onClick={onCheckout}
                className="mt-6 w-full bg-red-500 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Finalizar Compra
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;