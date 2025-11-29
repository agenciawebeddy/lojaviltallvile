import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Session } from '@supabase/supabase-js';
import { Category, CartItem, SocialLink } from '../types';
import {
  Phone,
  Search,
  User,
  Heart,
  ShoppingCart,
  Menu,
  ChevronDown,
  LogOut,
  X,
  Globe,
  ChevronRight
} from 'lucide-react';
import SocialIconRenderer from '../src/components/SocialIconRenderer'; // Importação adicionada
import { formatPrice } from '../src/utils/formatters';

interface HeaderProps {
  cartItemCount: number;
  wishlistItemCount: number;
  currentPage: string;
  onNavigate: (page: string) => void;
  onSignOut: () => void;
  session: Session | null;
  allCategories: Category[];
  cartItems: CartItem[];
  onCategorySelect: (categoryName: string) => void;
  freeShippingThreshold: number;
  socialLinks: SocialLink[];
  onSearch: (term: string, category: string) => void;
  freeShippingMessageTemplate: string;
  storeLogoUrl?: string;
  logoHeight: number; // Nova prop
  logoWidth: number; // Nova prop
}

const Header: React.FC<HeaderProps> = ({
  cartItemCount,
  wishlistItemCount,
  onNavigate,
  onSignOut,
  session,
  allCategories,
  cartItems,
  onCategorySelect,
  freeShippingThreshold,
  socialLinks,
  onSearch,
  freeShippingMessageTemplate,
  storeLogoUrl,
  logoHeight, // Recebendo a altura
  logoWidth, // Recebendo a largura
}) => {
  const [isDepartmentsMenuOpen, setIsDepartmentsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileDepartmentsOpen, setIsMobileDepartmentsOpen] = useState(false); // Novo estado para o menu mobile de departamentos
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const departmentsMenuRef = useRef<HTMLDivElement>(null);

  const total = cartItems.reduce((sum, item) => {
    const price = item.selectedVariant.price ?? item.price;
    return sum + price * item.quantity;
  }, 0);

  const handleCategoryClick = (categoryName: string) => {
    onCategorySelect(categoryName);
    setIsDepartmentsMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleSearchClick = () => {
    onSearch(searchTerm, searchCategory);
    setIsMobileMenuOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (departmentsMenuRef.current && !departmentsMenuRef.current.contains(event.target as Node)) {
        setIsDepartmentsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const mainNavLinks = useMemo(() => [
    { name: 'HOME', action: () => onNavigate('home'), icon: '/home.png' },
    { name: 'Loja', action: () => onNavigate('shop'), icon: '/shop.png' },
    {
      name: 'Moda Feminina',
      action: () => handleCategoryClick('Feminino'),
      icon: allCategories.find(c => c.name === 'Feminino')?.icon_url || null
    },
    {
      name: 'Moda Masculina',
      action: () => handleCategoryClick('Masculino'),
      icon: allCategories.find(c => c.name === 'Masculino')?.icon_url || null
    },
    {
      name: 'OUTLET',
      action: () => handleCategoryClick('Outlet'),
      icon: allCategories.find(c => c.name === 'Outlet')?.icon_url || null
    },
  ], [allCategories, onNavigate, handleCategoryClick]);

  const freeShippingMessage = freeShippingThreshold > 0 && freeShippingMessageTemplate
    ? freeShippingMessageTemplate.replace('{threshold}', formatPrice(freeShippingThreshold))
    : 'FRETE GRÁTIS DISPONÍVEL EM PROMOÇÕES ESPECÍFICAS';

  const isAdmin = session?.user?.email === 'edsonantonio@webeddy.com.br';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm text-gray-800">
      {/* Top Bar */}
      <div className="bg-green-600 text-white text-xs">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-10">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2">
              <Phone size={14} />
              <span>(11) 97961-3666</span>
            </div>
            <span className="hidden md:block">{freeShippingMessage}</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="hidden sm:flex items-center gap-4">
              {socialLinks.map(link => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-gray-200">
                  {link.icon_url ? (
                    <img src={link.icon_url} alt={link.name} className="w-4 h-4 object-contain" />
                  ) : (
                    // Adicionando text-white explicitamente para garantir a cor
                    <SocialIconRenderer name={link.name} size={16} className="text-white" />
                  )}
                </a>
              ))}
            </div>
            <a onClick={() => onNavigate('contato')} className="hover:text-gray-200 cursor-pointer text-white">CONTATO</a>
            <a onClick={() => onNavigate('sobre')} className="hover:text-gray-200 cursor-pointer text-white">SOBRE</a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center py-4">
          {/* Logo - Alinhada à esquerda */}
          <div onClick={() => onNavigate('home')} className="cursor-pointer flex-shrink-0">
            {storeLogoUrl ? (
              <img
                src={storeLogoUrl}
                alt="Logo da Loja"
                style={{ height: `${logoHeight}px`, width: `${logoWidth}px` }}
                className="object-contain"
              />
            ) : (
              <img
                src="/logo.png"
                alt="Logo da Loja"
                style={{ height: `${logoHeight}px`, width: `${logoWidth}px` }}
                className="object-contain"
              />
            )}
          </div>

          {/* Search Bar - Centralizada (com margens automáticas) */}
          <div className="hidden lg:flex flex-grow max-w-xl mx-auto items-center border bg-white border-gray-300 rounded-md ml-8">
            <input
              type="text"
              placeholder="Buscar produtos"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-grow px-4 py-2 rounded-l-md focus:outline-none"
            />
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="px-4 py-2 border-l border-gray-300 bg-transparent focus:outline-none text-sm text-gray-500"
            >
              <option value="">Todas as Categorias</option>
              {allCategories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
            </select>
            <button onClick={handleSearchClick} className="bg-red-500 text-white p-3 rounded-r-md hover:bg-red-600">
              <Search size={20} />
            </button>
          </div>

          {/* Action Icons - Alinhados à direita */}
          <div className="flex items-center gap-4 md:gap-6 ml-auto">
            {session ? (
              <div className="hidden md:flex items-center gap-6 text-sm">
                <a onClick={() => onNavigate('dashboard')} className="cursor-pointer hover:text-red-500 flex items-center gap-2">
                  <User size={24} />
                  <span className="font-semibold">{isAdmin ? 'Dashboard' : 'Minha Conta'}</span>
                </a>
                <button onClick={onSignOut} className="cursor-pointer hover:text-red-500 flex items-center gap-2">
                  <LogOut size={24} />
                  <span className="font-semibold">Sair</span>
                </button>
              </div>
            ) : (
              <a onClick={() => onNavigate('login')} className="cursor-pointer hover:text-red-500 flex flex-col items-center text-sm hidden md:flex">
                <User size={24} />
                <span className="font-semibold text-xs">Logar</span>
              </a>
            )}
            <a onClick={() => onNavigate('wishlist')} className="relative cursor-pointer hover:text-red-500">
              <Heart size={24} />
              {wishlistItemCount > 0 && <span className="absolute -top-1 -right-2 text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">{wishlistItemCount}</span>}
            </a>
            <a onClick={() => onNavigate('cart')} className="relative cursor-pointer hover:text-red-500 flex items-center gap-2">
              <ShoppingCart size={24} />
              {cartItemCount > 0 && <span className="absolute -top-1 left-3 text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">{cartItemCount}</span>}
              <span className="text-sm font-bold hidden xl:block">{formatPrice(total)}</span>
            </a>
            <button className="lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={28} />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Navigation Bar */}
      <nav className="hidden lg:flex border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-14">
          <div ref={departmentsMenuRef} className="relative">
            <button onClick={() => setIsDepartmentsMenuOpen(!isDepartmentsMenuOpen)} className="flex items-center gap-2 bg-gray-100 px-4 h-14 font-semibold hover:bg-gray-200">
              <Menu size={20} />
              <span>TODOS OS DEPARTAMENTOS</span>
              <ChevronDown size={20} className={`transition-transform ${isDepartmentsMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDepartmentsMenuOpen && (
              <div className="absolute top-full left-0 bg-white shadow-lg border border-gray-200 w-72 py-2 z-20">
                <ul>
                  {allCategories.map(cat => (
                    <li key={cat.id}>
                      <a onClick={() => handleCategoryClick(cat.name)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer">
                        {cat.icon_url ? (
                          <img src={cat.icon_url} alt={`${cat.name} icon`} className="w-5 h-5 object-contain" />
                        ) : (
                          <span className="w-5 h-5" />
                        )}
                        <span>{cat.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="flex items-center gap-6 text-sm font-semibold ml-8">
            {mainNavLinks.map(link => (
              <a key={link.name} onClick={link.action} className="flex items-center gap-2 hover:text-red-500 cursor-pointer">
                {link.icon && <img src={link.icon} alt="" className="w-5 h-5 object-contain" />}
                <span>{link.name}</span>
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed top-0 left-0 h-full w-4/5 max-w-sm bg-white shadow-lg p-6 overflow-y-auto overflow-x-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-bold text-xl">Menu</h2>
              <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
            </div>

            {/* Mobile Search Bar */}
            <div className="flex items-center border bg-gray-50 border-gray-300 rounded-md mb-6 w-full">
              <input
                type="text"
                placeholder="Buscar produtos"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-grow px-4 py-2 rounded-l-md focus:outline-none bg-transparent min-w-0"
              />
              <button onClick={handleSearchClick} className="bg-red-500 text-white p-3 rounded-r-md hover:bg-red-600 flex-shrink-0">
                <Search size={20} />
              </button>
            </div>

            <nav className="flex flex-col gap-4">
              {/* Departamentos (Acordeão) */}
              <div className="border-b border-gray-200 pb-2">
                <button
                  onClick={() => setIsMobileDepartmentsOpen(!isMobileDepartmentsOpen)}
                  className="w-full flex justify-between items-center font-semibold text-gray-500 text-sm uppercase py-2"
                >
                  <span>Departamentos</span>
                  {isMobileDepartmentsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {isMobileDepartmentsOpen && (
                  <ul className="mt-2 space-y-2">
                    {allCategories.map(cat => (
                      <li key={cat.id}>
                        <a onClick={() => handleCategoryClick(cat.name)} className="flex items-center gap-3 px-2 py-1 text-gray-700 hover:text-red-500 cursor-pointer">
                          {cat.icon_url && <img src={cat.icon_url} alt="" className="w-5 h-5 object-contain" />}
                          {cat.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Removendo a linha duplicada */}
              {/* <hr className="my-4" /> */}
              <h3 className="font-semibold text-gray-500 text-sm uppercase">Navegação</h3>
              {mainNavLinks.map(link => (
                <a key={link.name} onClick={() => { link.action(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 cursor-pointer hover:text-red-500">
                  {link.icon ? (
                    <img src={link.icon} alt="" className="w-5 h-5 object-contain" />
                  ) : (
                    <span className="w-5 h-5" />
                  )}
                  <span>{link.name}</span>
                </a>
              ))}
              <hr className="my-4" />
              <h3 className="font-semibold text-gray-500 text-sm uppercase">Conta</h3>
              {session ? (
                <>
                  <a onClick={() => { onNavigate('dashboard'); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 cursor-pointer hover:text-red-500">
                    <User size={20} />
                    <span>{isAdmin ? 'Dashboard' : 'Minha Conta'}</span>
                  </a>
                  <a onClick={() => { onSignOut(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 cursor-pointer hover:text-red-500">
                    <LogOut size={20} />
                    <span>Sair</span>
                  </a>
                </>
              ) : (
                <a onClick={() => { onNavigate('login'); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 cursor-pointer hover:text-red-500">
                  <User size={20} />
                  <span>Logar</span>
                </a>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;