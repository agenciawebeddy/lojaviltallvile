import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Category } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FeaturedCategoriesProps {
  categories: Category[];
  onCategorySelect: (categoryName: string) => void;
}

const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({ categories, onCategorySelect }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const checkScrollability = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) {
      const buffer = 2;
      const hasOverflow = el.scrollWidth > el.clientWidth + buffer;
      setIsOverflowing(hasOverflow);
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - buffer);
    }
  }, []);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  }, []);

  const startAutoScroll = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (scrollContainerRef.current) {
        // Use a function to get the latest state of canScrollRight
        const el = scrollContainerRef.current;
        const shouldScrollRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 2;
        
        if (shouldScrollRight) {
          scroll('right');
        } else {
          // Loop back to the beginning
          el.scrollTo({ left: 0, behavior: 'smooth' });
        }
      }
    }, 4000); // Scroll every 4 seconds
  }, [scroll]);

  const stopAutoScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const timer = setTimeout(() => checkScrollability(), 100);

    el.addEventListener('scroll', checkScrollability, { passive: true });
    window.addEventListener('resize', checkScrollability);
    
    return () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', checkScrollability);
      window.removeEventListener('resize', checkScrollability);
      stopAutoScroll();
    };
  }, [categories, checkScrollability]);

  useEffect(() => {
    if (isOverflowing) {
      startAutoScroll();
    } else {
      stopAutoScroll();
    }
    return () => stopAutoScroll();
  }, [isOverflowing, startAutoScroll]);

  const handleManualScroll = (direction: 'left' | 'right') => {
    scroll(direction);
    // Reset timer on manual interaction
    stopAutoScroll();
    startAutoScroll();
  };

  return (
    <div className="bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Compre por Categoria</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">Encontre exatamente o que você procura navegando por nossas coleções selecionadas.</p>
        </div>
        <div 
          className="relative"
          onMouseEnter={stopAutoScroll}
          onMouseLeave={startAutoScroll}
        >
          {isOverflowing && canScrollLeft && (
            <button
              onClick={() => handleManualScroll('left')}
              className="absolute top-1/2 -translate-y-1/2 -left-2 md:-left-4 z-10 bg-gray-800/80 hover:bg-gray-700 text-white p-2 rounded-full shadow-lg transition-opacity hidden md:block border border-gray-700"
              aria-label="Scroll left"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <div
            ref={scrollContainerRef}
            className={`flex items-center gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 scrollbar-hide ${!isOverflowing ? 'justify-center' : ''}`}
          >
            {categories.map((category, index) => (
              <div
                key={category.id}
                onClick={() => onCategorySelect(category.name)}
                className={`group flex flex-col items-center text-center gap-3 cursor-pointer transition-transform duration-300 transform hover:scale-105 snap-start flex-shrink-0 ${index === 0 ? 'pl-2' : ''} ${index === categories.length - 1 ? 'pr-2' : ''}`}
              >
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-gray-700 group-hover:border-blue-500 transition-all duration-300 shadow-lg"
                />
                <h3 className="text-lg font-semibold text-white tracking-wide mt-2 w-28 truncate">{category.name}</h3>
              </div>
            ))}
          </div>
          {isOverflowing && canScrollRight && (
            <button
              onClick={() => handleManualScroll('right')}
              className="absolute top-1/2 -translate-y-1/2 -right-2 md:-right-4 z-10 bg-gray-800/80 hover:bg-gray-700 text-white p-2 rounded-full shadow-lg transition-opacity hidden md:block border border-gray-700"
              aria-label="Scroll right"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeaturedCategories;