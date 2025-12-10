import React from 'react';
import HeroSection from './HeroSection';
import HomeCategories from './HomeCategories';
import NewArrivalsSection from './NewArrivalsSection';
import CashbackBanner from '../src/components/CashbackBanner';
import { Product, Category, ProductVariant, HeroSlide } from '../types';
import { Truck, Headset, CreditCard, Rocket } from 'lucide-react';

interface HomePageProps {
  onAddToCart: (product: Product, quantity: number, selectedVariant: ProductVariant) => void;
  products: Product[];
  categories: Category[];
  onProductSelect: (product: Product) => void;
  wishlistItems: Product[];
  onToggleWishlist: (product: Product) => void;
  slides: HeroSlide[];
  onNavigate: (page: string) => void;
  onCategorySelect: (categoryName: string) => void;
  cashbackPercentage: number;
  globalDiscountPercentage: number;
  freeShippingThreshold: number; // Nova prop
  freeShippingMessageTemplate: string; // Nova prop
}

const HomePage: React.FC<HomePageProps> = (props) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const freeShippingMessage = props.freeShippingThreshold > 0 && props.freeShippingMessageTemplate
    ? props.freeShippingMessageTemplate.replace('{threshold}', formatPrice(props.freeShippingThreshold))
    : 'Frete grátis em pedidos selecionados para todo o Brasil.';

  const infoItems = [
    {
      icon: <Truck size={40} className="text-white" />,
      title: 'Frete Grátis',
      description: freeShippingMessage,
    },
    {
      icon: <Headset size={40} className="text-white" />,
      title: 'Suporte',
      description: 'Atendimento disponível de Segunda a Sexta das 9h às 19h, Sábado dass 9H às 13H para te ajudar sempre que precisar.',
    },
    {
      icon: <CreditCard size={40} className="text-white" />,
      title: 'Pagamento on-line',
      description: 'Pague com segurança e praticidade direto pelo site, usando cartões ou PIX.',
    },
    {
      icon: <Rocket size={40} className="text-white" />,
      title: 'Entrega rápida',
      description: 'Receba seu pedido em tempo recorde, com agilidade e confiança.',
    },
  ];

  return (
    <div className="bg-white text-gray-900">
      <HeroSection slides={props.slides} onNavigate={props.onNavigate} />
      <HomeCategories categories={props.categories} onCategorySelect={props.onCategorySelect} />
      <NewArrivalsSection
        products={props.products}
        onAddToCart={props.onAddToCart}
        onProductSelect={props.onProductSelect}
        wishlistItems={props.wishlistItems}
        onToggleWishlist={props.onToggleWishlist}
        globalDiscountPercentage={props.globalDiscountPercentage}
      />
      <CashbackBanner onNavigate={props.onNavigate} percentage={props.cashbackPercentage} />

      {/* Green Banner Section moved from Footer */}
      <div className="bg-green-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {infoItems.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="flex-shrink-0">{item.icon}</div>
              <div>
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-sm opacity-90">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;