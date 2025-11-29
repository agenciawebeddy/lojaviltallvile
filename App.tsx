import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './src/integrations/supabase/client';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import ShopPage from './src/components/ShopPage';
import CategoriesPage from './components/CategoriesPage';
import AboutPage from './components/AboutPage';
import TechnologyPage from './src/components/TechnologyPage'; // Importação adicionada
import ProductDetailPage from './components/ProductDetailPage';
import WishlistPage from './components/WishlistPage';
import AuthPage from './src/components/AuthPage';
import ResetPasswordPage from './src/components/ResetPasswordPage'; // NOVO IMPORT
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import OrderConfirmationPage from './components/OrderConfirmationPage';
import DashboardPage from './src/components/DashboardPage';
import UserDashboardPage from './src/components/UserDashboardPage';
import ShippingTestPage from './src/components/ShippingTestPage';
import SyncTestPage from './src/components/SyncTestPage';
import AddToCartModal from './src/components/AddToCartModal';
import PopupModal from './src/components/PopupModal'; // NOVO IMPORT
import { Product, CartItem, Category, ProductVariant, HeroSlide, SocialLink, StoreSettings } from './types';
import HelpPage from './src/components/HelpPage';
import ContactPage from './src/components/ContactPage';
import ReturnsPolicyPage from './src/components/ReturnsPolicyPage';
import PrivacyPolicyPage from './src/components/PrivacyPolicyPage';
import TermsPage from './src/components/TermsPage';

const defaultStoreSettings: StoreSettings = {
  cashback_is_active: true,
  cashback_percentage: 5.00,
  free_shipping_is_active: false,
  free_shipping_threshold: 250.00,
  free_shipping_message: 'FRETE GRÁTIS PARA TODOS OS PEDIDOS ACIMA DE {threshold}', // Novo campo
  store_logo_url: undefined, // Novo campo
  logo_height: 40, // NOVO VALOR PADRÃO
  logo_width: 150, // NOVO VALOR PADRÃO
  global_discount_percentage: 0.00, // NOVO CAMPO
};

// Funções utilitárias para localStorage
const loadState = (key: string) => {
  try {
    const serializedState = localStorage.getItem(key);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (e) {
    console.error("Could not load state from localStorage", e);
    return undefined;
  }
};

const saveState = (key: string, state: any) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(key, serializedState);
  } catch (e) {
    console.error("Could not save state to localStorage", e);
  }
};

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(defaultStoreSettings);
  const [activePopup, setActivePopup] = useState<any | null>(null); // Estado para o pop-up ativo
  const [showPopup, setShowPopup] = useState(false); // Estado para controlar a visibilidade do pop-up

  // Carrega o estado inicial do localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(loadState('cartItems') || []);
  const [wishlistItems, setWishlistItems] = useState<Product[]>(loadState('wishlistItems') || []);

  const [currentPage, setCurrentPage] = useState('home');
  const [initialShopCategory, setInitialShopCategory] = useState<string | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [postLoginRedirect, setPostLoginRedirect] = useState<string | null>(null);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);

  // Estado de Pesquisa Global
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchCategory, setSearchCategory] = useState<string>('');

  // Efeito para persistir o carrinho
  useEffect(() => {
    saveState('cartItems', cartItems);
  }, [cartItems]);

  // Efeito para persistir a lista de desejos
  useEffect(() => {
    saveState('wishlistItems', wishlistItems);
  }, [wishlistItems]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === 'SIGNED_IN') {
        if (postLoginRedirect) {
          setCurrentPage(postLoginRedirect);
          setPostLoginRedirect(null);
        } else {
          setCurrentPage('home');
        }
      }
      if (_event === 'SIGNED_OUT') {
        setCurrentPage('home');
      }
    });

    return () => subscription.unsubscribe();
  }, [postLoginRedirect]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Store Settings first to get global_discount_percentage
      const { data: settingsData, error: settingsError } = await supabase.from('store_settings').select('*').eq('id', 1).single();
      let currentStoreSettings = defaultStoreSettings;
      if (settingsError) {
        console.error('Error fetching store settings:', settingsError);
      } else {
        currentStoreSettings = settingsData || defaultStoreSettings;
      }
      setStoreSettings(currentStoreSettings);

      // Fetch Products
      const { data: productsData, error: productsError } = await supabase.from('products').select('*, variants:product_variants(*)').order('created_at', { ascending: false });
      if (productsError) console.error('Error fetching products:', productsError);
      else {
        setProducts(productsData as Product[]);
      }

      // Fetch Categories with product count
      const { data: categoriesData, error: categoriesError } = await supabase.rpc('get_categories_with_product_count');
      if (categoriesError) console.error('Error fetching categories with product count:', categoriesError);
      else setAllCategories(categoriesData as Category[]);

      // Fetch Hero Slides
      const { data: slidesData, error: slidesError } = await supabase
        .from('hero_slides')
        .select('*')
        .order('sort_order', { ascending: true });

      if (slidesError) console.error('Error fetching hero slides:', slidesError);
      else setHeroSlides(slidesData as HeroSlide[]);

      // Fetch Social Links
      const { data: socialData, error: socialError } = await supabase
        .from('social_links')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (socialError) console.error('Error fetching social links:', socialError);
      else setSocialLinks(socialData as SocialLink[]);

      // Fetch Active Popup
      const { data: popupData, error: popupError } = await supabase
        .from('popups')
        .select('*')
        .eq('is_active', true)
        .single();

      if (popupError && popupError.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error('Error fetching active popup:', popupError);
      } else if (popupData) {
        setActivePopup(popupData);
        setShowPopup(true); // Exibe o pop-up se houver um ativo
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment_status');
    const hash = window.location.hash;

    if (paymentStatus === 'success') {
      setCartItems([]); // Limpa o carrinho após a confirmação do pedido
      setCurrentPage('orderconfirmation');
      window.history.replaceState(null, '', window.location.pathname);
    } else if (paymentStatus === 'failure' || paymentStatus === 'pending') {
      setCurrentPage('home');
      window.history.replaceState(null, '', window.location.pathname);
    } else if (hash.includes('type=recovery')) {
      // Se houver um hash de recuperação, navega para a página de reset de senha
      setCurrentPage('reset-password');
    }
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleAddToCart = (productToAdd: Product, quantity: number, selectedVariant: ProductVariant) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === productToAdd.id && item.selectedVariant.id === selectedVariant.id);
      let newItems;
      let itemForModal: CartItem;

      if (existingItem) {
        newItems = prevItems.map(item => {
          if (item.id === productToAdd.id && item.selectedVariant.id === selectedVariant.id) {
            const updatedItem = { ...item, quantity: item.quantity + quantity };
            itemForModal = updatedItem;
            return updatedItem;
          }
          return item;
        });
      } else {
        const newItem = { ...productToAdd, quantity, selectedVariant };
        itemForModal = newItem;
        newItems = [...prevItems, newItem];
      }

      setLastAddedItem(itemForModal);
      setShowAddToCartModal(true);
      return newItems;
    });
  };

  const handleUpdateCartQuantity = (productId: string, variantId: string, newQuantity: number) => {
    setCartItems(prevItems => {
      if (newQuantity <= 0) {
        return prevItems.filter(item => !(item.id === productId && item.selectedVariant.id === variantId));
      }
      return prevItems.map(item =>
        item.id === productId && item.selectedVariant.id === variantId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const handleRemoveFromCart = (productId: string, variantId: string) => {
    setCartItems(prevItems => prevItems.filter(item => !(item.id === productId && item.selectedVariant.id === variantId)));
  };

  const handleToggleWishlist = (product: Product) => {
    setWishlistItems(prevItems => {
      const isWishlisted = prevItems.some(item => item.id === product.id);
      if (isWishlisted) {
        return prevItems.filter(item => item.id !== product.id);
      } else {
        return [...prevItems, product];
      }
    });
  };

  const handleSearch = (term: string, category: string) => {
    setSearchTerm(term);
    setSearchCategory(category);
    setInitialShopCategory(undefined); // Limpa a categoria inicial se for uma pesquisa
    navigateTo('shop');
  };

  const navigateTo = (path: string) => {
    setSelectedProduct(null);

    // Remove barras iniciais e finais para padronizar
    const cleanPath = path.toLowerCase().replace(/^\/|\/$/g, '');

    // Verifica se é uma rota com parâmetro (ex: shop/outlet)
    const parts = cleanPath.split('/');
    const page = parts[0];
    const param = parts[1];

    if (page === 'shop' && param) {
      setInitialShopCategory(param);
      setSearchTerm('');
      setSearchCategory('');
    } else if (page.toLowerCase() !== 'shop') {
      setInitialShopCategory(undefined);
      setSearchTerm(''); // Limpa o termo de pesquisa ao sair da loja
      setSearchCategory('');
    }

    if (page.toLowerCase() === 'orderconfirmation') {
      setCartItems([]);
    }

    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleCategorySelect = (categoryName: string) => {
    setSelectedProduct(null);
    setInitialShopCategory(categoryName);
    setSearchTerm(''); // Limpa a pesquisa ao selecionar uma categoria
    setSearchCategory('');
    setCurrentPage('shop');
    window.scrollTo(0, 0);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    window.scrollTo(0, 0);
  }

  const handleBackToShop = () => {
    setSelectedProduct(null);
    setCurrentPage('shop');
    window.scrollTo(0, 0);
  }

  const handleCheckoutNavigation = () => {
    if (session) {
      navigateTo('checkout');
    } else {
      setPostLoginRedirect('checkout');
      navigateTo('login');
    }
  };

  const handleViewCartFromModal = () => {
    setShowAddToCartModal(false);
    navigateTo('cart');
  };

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const isAdminPage = currentPage === 'dashboard' || currentPage === 'shipping-test' || currentPage === 'synctest';

  const renderPage = () => {
    if (selectedProduct) {
      const isInWishlist = wishlistItems.some(item => item.id === selectedProduct.id);
      return (
        <ProductDetailPage
          product={selectedProduct}
          onAddToCart={handleAddToCart}
          onBackToShop={handleBackToShop}
          isInWishlist={isInWishlist}
          onToggleWishlist={handleToggleWishlist}
          onNavigate={navigateTo}
          cashbackPercentage={storeSettings?.cashback_percentage || 0}
          onProductSelect={handleProductSelect}
          globalDiscountPercentage={storeSettings?.global_discount_percentage || 0} // Passando o desconto global
        />
      );
    }

    switch (currentPage) {
      case 'home':
        return <HomePage
          onAddToCart={handleAddToCart}
          products={products}
          categories={allCategories}
          onProductSelect={handleProductSelect}
          wishlistItems={wishlistItems}
          onToggleWishlist={handleToggleWishlist}
          slides={heroSlides}
          onNavigate={navigateTo}
          onCategorySelect={handleCategorySelect}
          cashbackPercentage={storeSettings?.cashback_percentage || 0}
          globalDiscountPercentage={storeSettings?.global_discount_percentage || 0}
          freeShippingThreshold={storeSettings?.free_shipping_threshold || 0}
          freeShippingMessageTemplate={storeSettings?.free_shipping_message || defaultStoreSettings.free_shipping_message!}
        />;
      case 'shop':
        return <ShopPage
          onAddToCart={handleAddToCart}
          allProducts={products}
          allCategories={allCategories}
          initialCategory={initialShopCategory}
          onProductSelect={handleProductSelect}
          wishlistItems={wishlistItems}
          onToggleWishlist={handleToggleWishlist}
          onNavigate={navigateTo}
          searchTerm={searchTerm} // Passando o termo de pesquisa
          searchCategory={searchCategory} // Passando a categoria de pesquisa
          globalDiscountPercentage={storeSettings?.global_discount_percentage || 0} // Passando o desconto global
        />;
      case 'categorias':
        return <CategoriesPage categories={allCategories} onCategorySelect={handleCategorySelect} />;
      case 'sobre':
        return <AboutPage />;
      case 'tecnologia': // Novo caso de rota
        return <TechnologyPage />;
      case 'ajuda':
        return <HelpPage />;
      case 'contato':
        return <ContactPage />;
      case 'trocas':
        return <ReturnsPolicyPage />;
      case 'privacidade':
        return <PrivacyPolicyPage />;
      case 'termos':
        return <TermsPage />;
      case 'wishlist':
        return <WishlistPage wishlistItems={wishlistItems} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} onProductSelect={handleProductSelect} />;
      case 'cart':
        return <CartPage
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveFromCart}
          onNavigate={navigateTo}
          onCheckout={handleCheckoutNavigation}
          freeShippingIsActive={storeSettings?.free_shipping_is_active || false}
          freeShippingThreshold={storeSettings?.free_shipping_threshold || 0}
          globalDiscountPercentage={storeSettings?.global_discount_percentage || 0} // Passando o desconto global
        />;
      case 'checkout':
        return <CheckoutPage
          cartItems={cartItems}
          onNavigate={navigateTo}
          session={session}
          globalDiscountPercentage={storeSettings?.global_discount_percentage || 0} // Passando o desconto global
        />;
      case 'orderconfirmation':
        return <OrderConfirmationPage onNavigate={navigateTo} />;
      case 'login':
        return <div className="flex-grow flex items-center justify-center p-4 pt-header-safe"><AuthPage /></div>;
      case 'reset-password': // NOVA ROTA
        return <ResetPasswordPage />;
      case 'dashboard':
        if (!session) {
          setPostLoginRedirect('dashboard');
          return <div className="flex-grow flex items-center justify-center p-4 pt-header-safe"><AuthPage /></div>;
        }
        return session.user.email === 'edsonantonio@webeddy.com.br'
          ? <DashboardPage onNavigate={navigateTo} />
          : <UserDashboardPage />;
      case 'shipping-test':
        if (!session) {
          setPostLoginRedirect('shipping-test');
          return <div className="flex-grow flex items-center justify-center p-4 pt-header-safe"><AuthPage /></div>;
        }
        return session.user.email === 'edsonantonio@webeddy.com.br'
          ? <ShippingTestPage />
          : <HomePage
            onAddToCart={handleAddToCart}
            products={products}
            categories={allCategories}
            onProductSelect={handleProductSelect}
            wishlistItems={wishlistItems}
            onToggleWishlist={handleToggleWishlist}
            slides={heroSlides}
            onNavigate={navigateTo}
            onCategorySelect={handleCategorySelect}
            cashbackPercentage={storeSettings?.cashback_percentage || 0}
            globalDiscountPercentage={storeSettings?.global_discount_percentage || 0}
            freeShippingThreshold={storeSettings?.free_shipping_threshold || 0}
            freeShippingMessageTemplate={storeSettings?.free_shipping_message || defaultStoreSettings.free_shipping_message!}
          />;
      case 'synctest':
        return session ? <SyncTestPage /> : <div className="flex-grow flex items-center justify-center p-4 pt-header-safe"><AuthPage /></div>;
      default:
        return <HomePage
          onAddToCart={handleAddToCart}
          products={products}
          categories={allCategories}
          onProductSelect={handleProductSelect}
          wishlistItems={wishlistItems}
          onToggleWishlist={handleToggleWishlist}
          slides={heroSlides}
          onNavigate={navigateTo}
          onCategorySelect={handleCategorySelect}
          cashbackPercentage={storeSettings?.cashback_percentage || 0}
          globalDiscountPercentage={storeSettings?.global_discount_percentage || 0}
          freeShippingThreshold={storeSettings?.free_shipping_threshold || 0}
          freeShippingMessageTemplate={storeSettings?.free_shipping_message || defaultStoreSettings.free_shipping_message!}
        />;
    }
  };

  return (
    <div className={`${isAdminPage ? 'bg-gray-50' : 'bg-white'} text-gray-900 min-h-screen flex flex-col`}>
      <Header
        cartItemCount={cartItemCount}
        wishlistItemCount={wishlistItems.length}
        currentPage={currentPage}
        onNavigate={navigateTo}
        onSignOut={handleSignOut}
        session={session}
        allCategories={allCategories}
        cartItems={cartItems}
        onCategorySelect={handleCategorySelect}
        freeShippingThreshold={storeSettings?.free_shipping_threshold || 0}
        socialLinks={socialLinks}
        onSearch={handleSearch} // Passando a função de pesquisa
        freeShippingMessageTemplate={storeSettings?.free_shipping_message || defaultStoreSettings.free_shipping_message!} // Passando a mensagem
        storeLogoUrl={storeSettings?.store_logo_url} // Passando a URL do logo
        logoHeight={storeSettings?.logo_height || defaultStoreSettings.logo_height} // Passando a altura
        logoWidth={storeSettings?.logo_width || defaultStoreSettings.logo_width} // Passando a largura
      />
      <main className={`flex-grow pt-header-safe ${isAdminPage ? 'bg-gray-50' : ''}`}>
        {renderPage()}
      </main>
      <Footer
        onNavigate={navigateTo}
        socialLinks={socialLinks}
        onCategorySelect={handleCategorySelect}
      />
      <AddToCartModal
        isOpen={showAddToCartModal}
        onClose={() => setShowAddToCartModal(false)}
        onViewCart={handleViewCartFromModal}
        item={lastAddedItem}
      />
      {activePopup && (
        <PopupModal
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
          title={activePopup.title}
          description={activePopup.description}
          imageUrl={activePopup.image_url}
          buttonText={activePopup.button_text}
          buttonLink={activePopup.button_link}
          onNavigate={navigateTo}
        />
      )}
    </div>
  );
};

export default App;