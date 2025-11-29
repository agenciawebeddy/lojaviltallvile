import React, { useRef, useCallback, useMemo } from 'react';
import { Product, ProductVariant } from '../types';
import ProductCard from './ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NewArrivalsSectionProps {
  products: Product[];
  onAddToCart: (product: Product, quantity: number, selectedVariant: ProductVariant) => void;
  onProductSelect: (product: Product) => void;
  wishlistItems: Product[];
  onToggleWishlist: (product: Product) => void;
  globalDiscountPercentage: number; // Nova prop
}

const NewArrivalsSection: React.FC<NewArrivalsSectionProps> = ({ products, onAddToCart, onProductSelect, wishlistItems, onToggleWishlist, globalDiscountPercentage }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const card = scrollContainerRef.current.querySelector(':scope > div');
      if (card) {
        const scrollAmount = card.clientWidth * 2; // Scroll by 2 items
        scrollContainerRef.current.scrollBy({
          left: direction === 'left' ? -scrollAmount : scrollAmount,
          behavior: 'smooth',
        });
      }
    }
  }, []);

  return (
    <section className="py-4 sm:py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-light tracking-tight text-gray-900">Destaque</h2>
        </div>
        
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mx-3 scrollbar-hide"
          >
            {products.map((product) => { // Usar products diretamente
              const isInWishlist = wishlistItems.some(item => item.id === product.id);
              return (
                <div key={product.id} className="flex-shrink-0 w-1/2 lg:w-1/4 snap-start px-3">
                  <ProductCard 
                    product={product} 
                    onAddToCart={onAddToCart}
                    onProductSelect={onProductSelect}
                    isInWishlist={isInWishlist}
                    onToggleWishlist={onToggleWishlist}
                  />
                </div>
              )
            })}
          </div>
          
          <button onClick={() => scroll('left')} className="absolute top-1/2 -translate-y-1/2 -left-4 z-10 p-2 bg-white border border-gray-300 shadow-md text-gray-700 hover:bg-gray-100 rounded-full hidden lg:flex items-center justify-center">
            <ChevronLeft size={24} />
          </button>
          <button onClick={() => scroll('right')} className="absolute top-1/2 -translate-y-1/2 -right-4 z-10 p-2 bg-white border border-gray-300 shadow-md text-gray-700 hover:bg-gray-100 rounded-full hidden lg:flex items-center justify-center">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default NewArrivalsSection;