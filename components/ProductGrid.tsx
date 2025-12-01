import React from 'react';
import { Product, ProductVariant } from '../types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  title: string;
  subtitle?: string;
  products: Product[];
  onAddToCart: (product: Product, quantity: number, selectedVariant: ProductVariant) => void;
  onProductSelect: (product: Product) => void;
  wishlistItems: Product[];
  onToggleWishlist: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart, onProductSelect, wishlistItems, onToggleWishlist }) => {
  return (
    <section>
      {products.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {products.map((product) => {
            const isInWishlist = wishlistItems.some(item => item.id === product.id);
            return (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={onAddToCart}
                onProductSelect={onProductSelect}
                isInWishlist={isInWishlist}
                onToggleWishlist={onToggleWishlist}
              />
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold text-gray-600">Nenhum produto encontrado</h3>
          <p className="mt-2 text-gray-500">Tente ajustar seus filtros para encontrar o que você procura.</p>
        </div>
      )}
    </section>
  );
};

export default ProductGrid;