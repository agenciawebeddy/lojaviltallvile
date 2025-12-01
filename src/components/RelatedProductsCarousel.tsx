import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Product, ProductVariant } from '../../types';
import ProductCard from '../../components/ProductCard'; // Caminho de importação corrigido
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface RelatedProductsCarouselProps {
  products: Product[];
  onAddToCart: (product: Product, quantity: number, selectedVariant: ProductVariant) => void;
  onProductSelect: (product: Product) => void; // Adicionado às props
  wishlistItems: Product[];
  onToggleWishlist: (product: Product) => void;
  currentProductId: string; // Para excluir o produto atual do carrossel
}

const RelatedProductsCarousel: React.FC<RelatedProductsCarouselProps> = ({
  products,
  onAddToCart,
  onProductSelect, // Desestruturado das props
  wishlistItems,
  onToggleWishlist,
  currentProductId,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) {
      const buffer = 2; // Pequena margem para evitar problemas de arredondamento
      setCanScrollLeft(el.scrollLeft > buffer);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - buffer);
    }
  }, []);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const card = scrollContainerRef.current.querySelector(':scope > div');
      if (card) {
        const scrollAmount = card.clientWidth * 2; // Scroll por 2 itens
        scrollContainerRef.current.scrollBy({
          left: direction === 'left' ? -scrollAmount : scrollAmount,
          behavior: 'smooth',
        });
      }
    }
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    // Pequeno atraso para garantir que o layout esteja renderizado
    const timer = setTimeout(() => checkScrollability(), 100);

    el.addEventListener('scroll', checkScrollability, { passive: true });
    window.addEventListener('resize', checkScrollability);
    
    return () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', checkScrollability);
      window.removeEventListener('resize', checkScrollability);
    };
  }, [products, checkScrollability]);

  const filteredProducts = products.filter(p => p.id !== currentProductId);

  if (filteredProducts.length === 0) {
    return null; // Não exibe o carrossel se não houver produtos relacionados
  }

  return (
    <section className="py-8 sm:py-12 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Produtos Relacionados</h2>
        </div>
        
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mx-3 scrollbar-hide"
          >
            {filteredProducts.map((product) => {
              const isInWishlist = wishlistItems.some(item => item.id === product.id);
              return (
                <div key={product.id} className="flex-shrink-0 w-1/2 sm:w-1/3 lg:w-1/4 xl:w-1/5 snap-start px-3">
                  <ProductCard 
                    product={product} 
                    onAddToCart={onAddToCart}
                    onProductSelect={onProductSelect} // Passando a prop
                    isInWishlist={isInWishlist}
                    onToggleWishlist={onToggleWishlist}
                  />
                </div>
              )
            })}
          </div>
          
          {canScrollLeft && (
            <button onClick={() => scroll('left')} className="absolute top-1/2 -translate-y-1/2 -left-4 z-10 p-2 bg-white border border-gray-300 shadow-md text-gray-700 hover:bg-gray-100 rounded-full hidden lg:flex items-center justify-center">
              <ChevronLeft size={24} />
            </button>
          )}
          {canScrollRight && (
            <button onClick={() => scroll('right')} className="absolute top-1/2 -translate-y-1/2 -right-4 z-10 p-2 bg-white border border-gray-300 shadow-md text-gray-700 hover:bg-gray-100 rounded-full hidden lg:flex items-center justify-center">
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default RelatedProductsCarousel;