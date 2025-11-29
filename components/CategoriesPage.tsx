import React from 'react';
import { Category } from '../types';

interface CategoriesPageProps {
  categories: Category[];
  onCategorySelect: (categoryName: string) => void;
}

const CategoriesPage: React.FC<CategoriesPageProps> = ({ categories, onCategorySelect }) => {
  return (
    <div className="bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Nossas Categorias</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">Encontre exatamente o que você procura navegando por nossas coleções selecionadas.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {categories.map((category) => (
                <div 
                  key={category.id} 
                  onClick={() => onCategorySelect(category.name)}
                  className="group flex flex-col items-center text-center gap-3 cursor-pointer transition-transform duration-300 transform hover:scale-110"
                >
                  <img 
                    src={category.imageUrl} 
                    alt={category.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-700 group-hover:border-blue-500 transition-all duration-300 shadow-lg"
                  />
                  <h3 className="text-lg font-semibold text-white tracking-wide mt-2">{category.name}</h3>
                </div>
            ))}
            </div>
        </div>
    </div>
  );
};

export default CategoriesPage;