import React from 'react';
import { Product, ProductVariant } from '../types';
import ProductGrid from './ProductGrid';
import PageHeader from '../src/components/PageHeader'; // Importando PageHeader

interface WishlistPageProps {
  wishlistItems: Product[];
  onAddToCart: (product: Product, quantity: number, selectedVariant: ProductVariant) => void;
  onToggleWishlist: (product: Product) => void;
  onProductSelect: (product: Product) => void;
}

const WishlistPage: React.FC<WishlistPageProps> = ({ wishlistItems, onAddToCart, onToggleWishlist, onProductSelect }) => {
  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <PageHeader 
        title="Minha Lista de Desejos"
        description="Seus produtos favoritos, salvos em um só lugar."
        imageUrl="https://picsum.photos/seed/wishlist/1920/300"
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {wishlistItems.length > 0 ? (
          <ProductGrid
            title=""
            products={wishlistItems}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
            onProductSelect={onProductSelect}
            wishlistItems={wishlistItems}
          />
        ) : (
          <div className="text-center py-20 px-6 bg-gray-50 rounded-lg border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Sua lista de desejos está vazia</h2>
            <p className="mt-2 text-gray-600">
              Adicione itens que você ama à sua lista de desejos para que possa encontrá-los facilmente mais tarde.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;