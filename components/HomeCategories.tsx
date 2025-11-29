import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Category } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HomeCategoriesProps {
  categories: Category[];
  onCategorySelect: (categoryName: string) => void;
}

const HomeCategories: React.FC<HomeCategoriesProps> = ({ categories, onCategorySelect }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
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
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.7;
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
        const el = scrollContainerRef.current;
        const shouldScrollRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 2;
        
        if (shouldScrollRight) {
          scroll('right');
        } else {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        }
      }
    }, 5000);
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
    stopAutoScroll();
  };

  return (
    <section className="py-4 sm:py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider">Categorias</h2>
          <div className="w-16 h-1 bg-pink-500 mt-2"></div>
        </div>
        <div 
          className="relative"
          onMouseEnter={stopAutoScroll}
          onMouseLeave={startAutoScroll}
        >
          {isOverflowing && canScrollLeft && (
            <button
              onClick={() => handleManualScroll('left')}
              className="absolute top-1/2 -translate-y-1/2 -left-4 z-10 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-opacity hidden md:block border border-gray-200"
              aria-label="Scroll left"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-4 sm:gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mx-3 scrollbar-hide"
          >
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => onCategorySelect(category.name)}
                className="group/item flex flex-col items-center text-center gap-2 cursor-pointer flex-shrink-0 w-24 sm:w-40 snap-start"
              >
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-20 h-20 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-gray-200 group-hover/item:border-pink-500 transition-all duration-300 shadow-sm"
                />
                <h3 className="text-xs font-semibold text-gray-700 tracking-wide uppercase mt-2 h-10 flex items-center justify-center text-center w-24 sm:w-40">
                  {category.name}
                </h3>
              </div>
            ))}
          </div>
          {isOverflowing && canScrollRight && (
            <button
              onClick={() => handleManualScroll('right')}
              className="absolute top-1/2 -translate-y-1/2 -right-4 z-10 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-opacity hidden md:block border border-gray-200"
              aria-label="Scroll right"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default HomeCategories;