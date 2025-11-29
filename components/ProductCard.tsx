import React, { useState } from 'react';
import { Product, ProductVariant } from '../types';
import { Heart } from 'lucide-react'; // Importando Heart

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number, selectedVariant: ProductVariant) => void;
  onProductSelect: (product: Product) => void;
  isInWishlist: boolean;
  onToggleWishlist: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onProductSelect, isInWishlist, onToggleWishlist }) => {
  const [currentImage, setCurrentImage] = useState(product.imageUrl);

  const handleCardClick = () => {
    onProductSelect(product);
  };

  const handleMouseEnter = () => {
    if (product.gallery_images && product.gallery_images.length > 0) {
      setCurrentImage(product.gallery_images[0]);
    }
  };

  const handleMouseLeave = () => {
    setCurrentImage(product.imageUrl);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  // Lógica para determinar o preço final e o preço original riscado
  // O discount_price já deve vir calculado do banco de dados (incluindo o global_discount_percentage)
  const finalPrice = product.discount_price && product.discount_price > 0 ? product.discount_price : product.price;
  const originalPrice = (product.discount_price && product.discount_price < product.price) ? product.price : null;
  
  const installmentValue = finalPrice / 3;

  return (
    <div className="group text-center border border-gray-200 rounded-lg p-4 flex flex-col h-full transition-shadow hover:shadow-xl bg-white relative"> {/* <-- Adicionado 'relative' aqui */}
      {/* Wishlist Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); onToggleWishlist(product); }}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white shadow-md text-gray-400 hover:text-red-500 transition-colors"
        aria-label="Adicionar à lista de desejos"
      >
        <Heart size={20} className={isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
      </button>
      
      {/* Clickable area for image and text, configured to grow */}
      <div onClick={handleCardClick} className="cursor-pointer flex-grow flex flex-col">
        {/* Image */}
        <div 
          className="relative w-full aspect-square mx-auto mb-4"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <img 
            src={currentImage} 
            alt={product.name} 
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" 
          />
        </div>
        {/* Text container that grows and centers content */}
        <div className="flex-grow flex flex-col justify-center px-2">
          <h3 className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2">
            {product.name}
          </h3>
          
          {/* Preços */}
          <div className="mt-2 mb-1 flex flex-col items-center">
            {originalPrice && (
                <p className="text-xs text-gray-500 line-through">
                    {formatPrice(originalPrice)}
                </p>
            )}
            <p className="text-lg font-bold text-red-500">
                {formatPrice(finalPrice)}
            </p>
          </div>
          
          {/* Parcelamento */}
          <p className="text-xs text-gray-600 font-semibold">
            3x de {formatPrice(installmentValue)} sem juros
          </p>
          
          <p className="text-xs text-gray-500 mt-2">
            {Array.isArray(product.category) ? product.category.join(', ') : product.category}
          </p>
        </div>
      </div>
      
      {/* O botão "Leia Mais" foi removido daqui */}
    </div>
  );
};

export default ProductCard;