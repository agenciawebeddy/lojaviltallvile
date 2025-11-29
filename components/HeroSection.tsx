import React, { useState, useEffect, useCallback } from 'react';
import { HeroSlide } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroSectionProps {
  slides: HeroSlide[];
  onNavigate: (page: string) => void;
  onCategorySelect?: (categoryName: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ slides, onNavigate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = useCallback(() => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, slides.length]);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  useEffect(() => {
    if (slides.length > 1) {
      const timer = setTimeout(() => {
        goToNext();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, slides.length, goToNext]);

  if (!slides || slides.length === 0) {
    return null;
  }

  const handleButtonClick = (link: string) => {
    onNavigate(link);
  };

  return (
    <section className="relative h-[40vh] md:h-[650px] w-full text-white overflow-hidden">
      {slides.map((slide, index) => {
        const isActive = index === currentIndex;
        
        return (
          <div
            key={slide.id}
            // Usamos absolute e opacidade para controlar a transição
            className={`absolute inset-0 w-full h-full bg-center bg-cover transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            style={{ backgroundImage: `url(${slide.image_url})` }}
          >
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className={`text-center p-4 max-w-3xl transition-all duration-1000 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight" dangerouslySetInnerHTML={{ __html: slide.title }}></h1>
                <p className="mt-4 text-lg md:text-xl text-gray-200">{slide.description}</p>
                {slide.button_text && slide.button_link && (
                  <button
                    onClick={() => handleButtonClick(slide.button_link)}
                    className="mt-8 bg-red-500 text-white font-bold py-2 px-6 sm:py-3 sm:px-8 rounded-lg text-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    {slide.button_text}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {slides.length > 1 && (
        <>
          {/* Controles de Navegação - Ocultos em telas pequenas (mobile) */}
          <button onClick={goToPrevious} className="absolute top-1/2 left-4 -translate-y-1/2 p-2 bg-black/30 rounded-full hover:bg-black/50 transition-colors z-20 hidden md:block">
            <ChevronLeft size={32} />
          </button>
          <button onClick={goToNext} className="absolute top-1/2 right-4 -translate-y-1/2 p-2 bg-black/30 rounded-full hover:bg-black/50 transition-colors z-20 hidden md:block">
            <ChevronRight size={32} />
          </button>
          
          {/* Indicadores de Posição */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, slideIndex) => (
              <div
                key={slideIndex}
                onClick={() => setCurrentIndex(slideIndex)}
                className={`w-3 h-3 rounded-full cursor-pointer transition-colors ${currentIndex === slideIndex ? 'bg-white' : 'bg-white/50'}`}
              ></div>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroSection;