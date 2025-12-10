import React, { useState, useMemo, useEffect } from 'react';
import { Product, Category, ProductVariant } from '@/types';
import ProductGrid from '@/components/ProductGrid';
import { Filter, X } from 'lucide-react'; // Importando os ícones necessários
import PageHeader from '@/src/components/PageHeader'; // Importando PageHeader

interface ShopPageProps {
  onAddToCart: (product: Product, quantity: number, selectedVariant: ProductVariant) => void;
  allProducts: Product[];
  allCategories: Category[];
  initialCategory?: string;
  onProductSelect: (product: Product) => void;
  wishlistItems: Product[];
  onToggleWishlist: (product: Product) => void;
  onNavigate: (page: string) => void;
  searchTerm?: string; // Nova prop
  searchCategory?: string; // Nova prop
  globalDiscountPercentage: number; // Nova prop
}

// Componente de UI para os filtros, para evitar duplicação de código
const FiltersUI: React.FC<{
  allCategories: Category[];
  selectedCategory: string | null;
  handleCategoryChange: (name: string) => void;
  priceRange: { min: number; max: number };
  setPriceRange: (range: { min: number; max: number }) => void;
  formatPrice: (price: number) => string;
}> = ({ allCategories, selectedCategory, handleCategoryChange, priceRange, setPriceRange, formatPrice }) => (
  <div className="space-y-8">
    {/* Filtro de Categoria */}
    <div>
      <h3 className="font-bold text-sm uppercase tracking-wider mb-4">Categorias de Produto</h3>
      <ul className="space-y-2 text-sm text-gray-600">
        {allCategories.map(cat => {
          // Usamos o nome da categoria em minúsculas para comparação
          const categoryNameLower = cat.name.toLowerCase();
          const selectedCategoryLower = selectedCategory?.toLowerCase();
          const isSelected = selectedCategoryLower === categoryNameLower;
          
          return (
            <li key={cat.id} className="flex justify-between items-center">
              <a
                onClick={() => handleCategoryChange(cat.name)}
                className={`cursor-pointer hover:text-gray-900 ${isSelected ? 'text-red-600 font-semibold' : ''}`}
              >
                {cat.name}
              </a>
              <span className={`text-xs rounded-full w-6 h-6 flex items-center justify-center transition-colors ${isSelected ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {cat.product_count || 0}
              </span>
            </li>
          );
        })}
      </ul>
    </div>

    {/* Filtro de Preço */}
    <div className="pt-8 border-t border-gray-200">
      <h3 className="font-bold text-sm uppercase tracking-wider mb-4">Filtrar por Preço</h3>
      <input
        type="range"
        min="0"
        max="8200"
        step="100"
        value={priceRange.max}
        onChange={e => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
      />
      <div className="flex items-center justify-between mt-4 text-sm">
        <span className="text-gray-600">Preço: {formatPrice(priceRange.min)} — {formatPrice(priceRange.max)}</span>
        <button className="bg-gray-200 text-gray-700 font-semibold py-1 px-4 text-xs hover:bg-gray-300 rounded-sm">
          Filtrar
        </button>
      </div>
    </div>
  </div>
);

const ShopPage: React.FC<ShopPageProps> = ({ onAddToCart, allProducts, allCategories, initialCategory, onProductSelect, wishlistItems, onToggleWishlist, onNavigate, searchTerm = '', searchCategory = '', globalDiscountPercentage }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 8200 });
  const [sortBy, setSortBy] = useState('relevance');
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // Efeito para sincronizar filtros com props de pesquisa
  useEffect(() => {
    // Se a categoria inicial vier da URL (App.tsx), ela já está em minúsculas.
    // Precisamos encontrar o nome da categoria com a capitalização correta para exibição,
    // mas o filtro deve usar o valor minúsculo para comparação.
    const categoryToSelect = initialCategory || searchCategory;
    if (categoryToSelect) {
        // Tentamos encontrar o nome original da categoria para manter a UI consistente
        const foundCategory = allCategories.find(cat => cat.name.toLowerCase() === categoryToSelect.toLowerCase());
        setSelectedCategory(foundCategory ? foundCategory.name : categoryToSelect);
    } else if (searchTerm) {
      // Se houver termo de pesquisa, limpa a seleção de categoria do filtro lateral
      setSelectedCategory(null);
    }
  }, [initialCategory, searchCategory, searchTerm, allCategories]);

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategory(prev => (prev === categoryName ? null : categoryName));
  };

  const filteredAndSortedProducts = useMemo(() => {
    let products = [...allProducts]; // Usar allProducts diretamente
    const lowerSearchTerm = searchTerm.toLowerCase().trim();

    // 1. Filtrar por Categoria (insensível a maiúsculas/minúsculas)
    const activeCategoryFilter = selectedCategory || searchCategory;
    if (activeCategoryFilter) {
      const filterLower = activeCategoryFilter.toLowerCase();
      products = products.filter(p =>
        Array.isArray(p.category) && p.category.some(cat => cat.toLowerCase() === filterLower)
      );
    }

    // 2. Filtrar por Termo de Pesquisa
    if (lowerSearchTerm) {
        products = products.filter(p =>
            p.name.toLowerCase().includes(lowerSearchTerm) ||
            p.description?.toLowerCase().includes(lowerSearchTerm)
        );
    }

    // 3. Filtrar por Preço
    products = products.filter(p => {
        // Aqui, o filtro de preço deve considerar o preço que está sendo exibido (discount_price ou price)
        const priceToFilter = p.discount_price && p.discount_price > 0 ? p.discount_price : p.price;
        return priceToFilter >= priceRange.min && priceToFilter <= priceRange.max;
    });

    // 4. Ordenar
    switch (sortBy) {
      case 'price-asc':
        products.sort((a, b) => {
            const priceA = a.discount_price && a.discount_price > 0 ? a.discount_price : a.price;
            const priceB = b.discount_price && b.discount_price > 0 ? b.discount_price : b.price;
            return priceA - priceB;
        });
        break;
      case 'price-desc':
        products.sort((a, b) => {
            const priceA = a.discount_price && a.discount_price > 0 ? a.discount_price : a.price;
            const priceB = b.discount_price && b.discount_price > 0 ? b.discount_price : b.price;
            return priceB - priceA;
        });
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return products;
  }, [allProducts, selectedCategory, priceRange, sortBy, searchTerm, searchCategory]);

  const formatPrice = (price: number) => price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
  const pageTitle = searchTerm ? `Resultados para "${searchTerm}"` : 'Nossa Loja';
  const pageDescription = searchTerm ? `Encontramos ${filteredAndSortedProducts.length} produtos.` : 'Explore nossa coleção completa de produtos selecionados.';

  return (
    <div className="bg-white text-gray-800">
      <PageHeader 
        title={pageTitle}
        description={pageDescription}
        imageUrl="https://picsum.photos/seed/shop/1920/300"
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Barra Lateral de Filtros para Desktop */}
          <aside className="hidden lg:block w-full lg:w-1/4 xl:w-1/5">
            <FiltersUI 
              allCategories={allCategories}
              selectedCategory={selectedCategory}
              handleCategoryChange={handleCategoryChange}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              formatPrice={formatPrice}
            />
          </aside>

          {/* Gaveta de Filtros para Mobile */}
          <div className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${isFilterMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsFilterMenuOpen(false)}></div>
            <div className={`relative h-full w-4/5 max-w-sm bg-white shadow-lg p-6 overflow-y-auto transition-transform duration-300 ease-in-out ${isFilterMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Filtros</h3>
                <button onClick={() => setIsFilterMenuOpen(false)}><X size={24} /></button>
              </div>
              <FiltersUI 
                allCategories={allCategories}
                selectedCategory={selectedCategory}
                handleCategoryChange={handleCategoryChange}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                formatPrice={formatPrice}
              />
            </div>
          </div>

          {/* Produtos */}
          <div className="w-full lg:w-3/4 xl:w-4/5">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                <a onClick={() => onNavigate('home')} className="hover:text-gray-800 cursor-pointer">Home</a> / <span>Shop</span>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <button onClick={() => setIsFilterMenuOpen(true)} className="lg:hidden flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-sm text-gray-700">
                  <Filter size={16} />
                  Filtros
                </button>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500 hidden sm:block">
                    Mostrar: {/* Tradução de 'Show:' */}
                    {[9, 12, 18, 24].map(num => (
                      <button key={num} onClick={() => setItemsPerPage(num)} className={`px-2 ${itemsPerPage === num ? 'text-gray-900 font-semibold' : ''}`}>
                        {num}
                      </button>
                    ))}
                  </div>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    // Ajuste de estilo para mobile: reduzindo o tamanho da fonte e padding
                    className="bg-gray-50 border border-gray-300 rounded-md py-1 px-2 text-xs sm:py-2 sm:px-3 sm:text-sm text-gray-700 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="relevance">Padrão</option>
                    <option value="rating">Avaliação</option>
                    <option value="price-asc">Preço: Menor</option>
                    <option value="price-desc">Preço: Maior</option>
                  </select>
                </div>
              </div>
            </div>
            
            <ProductGrid
              products={filteredAndSortedProducts.slice(0, itemsPerPage)}
              onAddToCart={onAddToCart}
              onProductSelect={onProductSelect}
              wishlistItems={wishlistItems}
              onToggleWishlist={onToggleWishlist}
              title=""
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;