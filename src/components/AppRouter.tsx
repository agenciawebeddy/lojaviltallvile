import React from 'react';
import { Session } from '@supabase/supabase-js';
import HomePage from '../../components/HomePage';
import ShopPage from './ShopPage';
import CategoriesPage from '../../components/CategoriesPage';
import AboutPage from '../../components/AboutPage';
import TechnologyPage from './TechnologyPage';
import ProductDetailPage from '../../components/ProductDetailPage';
import WishlistPage from '../../components/WishlistPage';
import AuthPage from './AuthPage';
import ResetPasswordPage from './ResetPasswordPage';
import CartPage from '../../components/CartPage';
import CheckoutPage from '../../components/CheckoutPage';
import OrderConfirmationPage from '../../components/OrderConfirmationPage';
import DashboardPage from './DashboardPage';
import UserDashboardPage from './UserDashboardPage';
import ShippingTestPage from './ShippingTestPage';
import SyncTestPage from './SyncTestPage';
import HelpPage from './HelpPage';
import ContactPage from './ContactPage';
import ReturnsPolicyPage from './ReturnsPolicyPage';
import PrivacyPolicyPage from './PrivacyPolicyPage';
import TermsPage from './TermsPage';
import { Product, CartItem, Category, ProductVariant, HeroSlide, StoreSettings } from '../../types';

interface AppRouterProps {
  currentPage: string;
  selectedProduct: Product | null;
  session: Session | null;
  products: Product[];
  allCategories: Category[];
  heroSlides: HeroSlide[];
  storeSettings: StoreSettings | null;
  cartItems: CartItem[];
  wishlistItems: Product[];
  initialShopCategory?: string;
  searchTerm: string;
  searchCategory: string;
  onAddToCart: (product: Product, quantity: number, selectedVariant: ProductVariant) => void;
  onUpdateCartQuantity: (productId: string, variantId: string, newQuantity: number) => void;
  onRemoveFromCart: (productId: string, variantId: string) => void;
  onToggleWishlist: (product: Product) => void;
  onProductSelect: (product: Product) => void;
  onCategorySelect: (categoryName: string) => void;
  onNavigate: (page: string) => void;
  onBackToShop: () => void;
  onCheckoutNavigation: () => void;
}

const AppRouter: React.FC<AppRouterProps> = ({
  currentPage,
  selectedProduct,
  session,
  products,
  allCategories,
  heroSlides,
  storeSettings,
  cartItems,
  wishlistItems,
  initialShopCategory,
  searchTerm,
  searchCategory,
  onAddToCart,
  onUpdateCartQuantity,
  onRemoveFromCart,
  onToggleWishlist,
  onProductSelect,
  onCategorySelect,
  onNavigate,
  onBackToShop,
  onCheckoutNavigation,
}) => {
  const defaultStoreSettings = {
    cashback_percentage: 0,
    free_shipping_is_active: false,
    free_shipping_threshold: 0,
    free_shipping_message: '',
    global_discount_percentage: 0,
    payment_on_delivery_active: false, // NOVO DEFAULT
  };

  const currentSettings = storeSettings || defaultStoreSettings;

  if (selectedProduct) {
    const isInWishlist = wishlistItems.some(item => item.id === selectedProduct.id);
    return (
      <ProductDetailPage
        product={selectedProduct}
        onAddToCart={onAddToCart}
        onBackToShop={onBackToShop}
        isInWishlist={isInWishlist}
        onToggleWishlist={onToggleWishlist}
        onNavigate={onNavigate}
        cashbackPercentage={currentSettings.cashback_percentage || 0}
        onProductSelect={onProductSelect}
        globalDiscountPercentage={currentSettings.global_discount_percentage || 0}
      />
    );
  }

  switch (currentPage) {
    case 'home':
      return (
        <HomePage
          onAddToCart={onAddToCart}
          products={products}
          categories={allCategories}
          onProductSelect={onProductSelect}
          wishlistItems={wishlistItems}
          onToggleWishlist={onToggleWishlist}
          slides={heroSlides}
          onNavigate={onNavigate}
          onCategorySelect={onCategorySelect}
          cashbackPercentage={currentSettings.cashback_percentage || 0}
          globalDiscountPercentage={currentSettings.global_discount_percentage || 0}
          freeShippingThreshold={currentSettings.free_shipping_threshold || 0}
          freeShippingMessageTemplate={currentSettings.free_shipping_message || ''}
        />
      );
    case 'shop':
      return (
        <ShopPage
          onAddToCart={onAddToCart}
          allProducts={products}
          allCategories={allCategories}
          initialCategory={initialShopCategory}
          onProductSelect={onProductSelect}
          wishlistItems={wishlistItems}
          onToggleWishlist={onToggleWishlist}
          onNavigate={onNavigate}
          searchTerm={searchTerm}
          searchCategory={searchCategory}
          globalDiscountPercentage={currentSettings.global_discount_percentage || 0}
        />
      );
    case 'categorias':
      return <CategoriesPage categories={allCategories} onCategorySelect={onCategorySelect} />;
    case 'sobre':
      return <AboutPage />;
    case 'tecnologia':
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
      return (
        <WishlistPage
          wishlistItems={wishlistItems}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          onProductSelect={onProductSelect}
        />
      );
    case 'cart':
      return (
        <CartPage
          cartItems={cartItems}
          onUpdateQuantity={onUpdateCartQuantity}
          onRemoveItem={onRemoveFromCart}
          onNavigate={onNavigate}
          onCheckout={onCheckoutNavigation}
          freeShippingIsActive={currentSettings.free_shipping_is_active || false}
          freeShippingThreshold={currentSettings.free_shipping_threshold || 0}
          globalDiscountPercentage={currentSettings.global_discount_percentage || 0}
        />
      );
    case 'checkout':
      return (
        <CheckoutPage
          cartItems={cartItems}
          onNavigate={onNavigate}
          session={session}
          globalDiscountPercentage={currentSettings.global_discount_percentage || 0}
          paymentOnDeliveryActive={currentSettings.payment_on_delivery_active || false}
        />
      );
    case 'orderconfirmation':
      return <OrderConfirmationPage onNavigate={onNavigate} />;
    case 'login':
      return (
        <div className="flex-grow flex items-center justify-center p-4 pt-header-safe">
          <AuthPage />
        </div>
      );
    case 'reset-password':
      return <ResetPasswordPage />;
    case 'dashboard':
      return session?.user?.email === 'edsonantonio@webeddy.com.br' ? (
        <DashboardPage onNavigate={onNavigate} />
      ) : (
        <UserDashboardPage />
      );
    case 'shipping-test':
      return session?.user?.email === 'edsonantonio@webeddy.com.br' ? (
        <ShippingTestPage />
      ) : (
        <HomePage
          onAddToCart={onAddToCart}
          products={products}
          categories={allCategories}
          onProductSelect={onProductSelect}
          wishlistItems={wishlistItems}
          onToggleWishlist={onToggleWishlist}
          slides={heroSlides}
          onNavigate={onNavigate}
          onCategorySelect={onCategorySelect}
          cashbackPercentage={currentSettings.cashback_percentage || 0}
          globalDiscountPercentage={currentSettings.global_discount_percentage || 0}
          freeShippingThreshold={currentSettings.free_shipping_threshold || 0}
          freeShippingMessageTemplate={currentSettings.free_shipping_message || ''}
        />
      );
    case 'synctest':
      return <SyncTestPage />;
    default:
      return (
        <HomePage
          onAddToCart={onAddToCart}
          products={products}
          categories={allCategories}
          onProductSelect={onProductSelect}
          wishlistItems={wishlistItems}
          onToggleWishlist={onToggleWishlist}
          slides={heroSlides}
          onNavigate={onNavigate}
          onCategorySelect={onCategorySelect}
          cashbackPercentage={currentSettings.cashback_percentage || 0}
          globalDiscountPercentage={currentSettings.global_discount_percentage || 0}
          freeShippingThreshold={currentSettings.free_shipping_threshold || 0}
          freeShippingMessageTemplate={currentSettings.free_shipping_message || ''}
        />
      );
  }
};

export default AppRouter;