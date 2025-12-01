import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import AppRouter from './src/components/AppRouter'; // Import the new AppRouter
import AddToCartModal from './src/components/AddToCartModal';
import PopupModal from './src/components/PopupModal';
import { useAppLogic } from './src/hooks/useAppLogic'; // Import the new hook

const App: React.FC = () => {
  const {
    session,
    products,
    allCategories,
    heroSlides,
    socialLinks,
    storeSettings,
    activePopup,
    showPopup,
    setShowPopup,
    cartItems,
    wishlistItems,
    currentPage,
    initialShopCategory,
    selectedProduct,
    showAddToCartModal,
    setShowAddToCartModal,
    lastAddedItem,
    searchTerm,
    searchCategory,
    handleSignOut,
    handleAddToCart,
    handleUpdateCartQuantity,
    handleRemoveFromCart,
    handleToggleWishlist,
    handleSearch,
    navigateTo,
    handleCategorySelect,
    handleProductSelect,
    handleBackToShop,
    handleCheckoutNavigation,
    handleViewCartFromModal,
    cartItemCount,
    isAdminPage,
  } = useAppLogic();

  const defaultStoreSettings = {
    logo_height: 40,
    logo_width: 150,
    free_shipping_message: 'FRETE GRÁTIS DISPONÍVEL EM PROMOÇÕES ESPECÍFICAS',
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
        onSearch={handleSearch}
        freeShippingMessageTemplate={storeSettings?.free_shipping_message || defaultStoreSettings.free_shipping_message}
        storeLogoUrl={storeSettings?.store_logo_url}
        logoHeight={storeSettings?.logo_height || defaultStoreSettings.logo_height}
        logoWidth={storeSettings?.logo_width || defaultStoreSettings.logo_width}
      />
      <main className={`flex-grow pt-header-safe ${isAdminPage ? 'bg-gray-50' : ''}`}>
        <AppRouter
          currentPage={currentPage}
          selectedProduct={selectedProduct}
          session={session}
          products={products}
          allCategories={allCategories}
          heroSlides={heroSlides}
          storeSettings={storeSettings}
          cartItems={cartItems}
          wishlistItems={wishlistItems}
          initialShopCategory={initialShopCategory}
          searchTerm={searchTerm}
          searchCategory={searchCategory}
          onAddToCart={handleAddToCart}
          onUpdateCartQuantity={handleUpdateCartQuantity}
          onRemoveFromCart={handleRemoveFromCart}
          onToggleWishlist={handleToggleWishlist}
          onProductSelect={handleProductSelect}
          onCategorySelect={handleCategorySelect}
          onNavigate={navigateTo}
          onBackToShop={handleBackToShop}
          onCheckoutNavigation={handleCheckoutNavigation}
        />
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