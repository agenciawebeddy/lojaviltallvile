import { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { Product, CartItem, Category, ProductVariant, HeroSlide, SocialLink, StoreSettings } from '../../types';

const defaultStoreSettings: StoreSettings = {
  cashback_is_active: true,
  cashback_percentage: 5.00,
  free_shipping_is_active: false,
  free_shipping_threshold: 250.00,
  free_shipping_message: 'FRETE GRÁTIS PARA TODOS OS PEDIDOS ACIMA DE {threshold}',
  store_logo_url: undefined,
  logo_height: 40,
  logo_width: 150,
  global_discount_percentage: 0.00,
  payment_on_delivery_active: false, // NOVO DEFAULT
};

// Utility functions for localStorage
const loadState = (key: string) => {
  try {
    const serializedState = localStorage.getItem(key);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (e) {
    console.error(`Could not load state from localStorage for key "${key}"`, e);
    return undefined;
  }
};

const saveState = (key: string, state: any) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(key, serializedState);
  } catch (e) {
    console.error(`Could not save state to localStorage for key "${key}"`, e);
  }
};

export const useAppLogic = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(defaultStoreSettings);
  const [activePopup, setActivePopup] = useState<any | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const [cartItems, setCartItems] = useState<CartItem[]>(loadState('cartItems') || []);
  const [wishlistItems, setWishlistItems] = useState<Product[]>(loadState('wishlistItems') || []);

  const [currentPage, setCurrentPage] = useState(loadState('currentPage') || 'home');
  const [initialShopCategory, setInitialShopCategory] = useState<string | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [postLoginRedirect, setPostLoginRedirect] = useState<string | null>(null);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchCategory, setSearchCategory] = useState<string>('');

  // Persist cart and wishlist to localStorage
  useEffect(() => {
    saveState('cartItems', cartItems);
  }, [cartItems]);

  useEffect(() => {
    saveState('wishlistItems', wishlistItems);
  }, [wishlistItems]);
  
  // Persist currentPage to localStorage
  useEffect(() => {
    saveState('currentPage', currentPage);
  }, [currentPage]);

  // Supabase Auth Listener
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
        setCartItems([]); // Clear cart on sign out
        setWishlistItems([]); // Clear wishlist on sign out
        setCurrentPage('home');
      }
    });

    return () => subscription.unsubscribe();
  }, [postLoginRedirect]);

  // Initial Data Fetching
  useEffect(() => {
    const fetchData = async () => {
      // Fetch Store Settings first
      const { data: settingsData, error: settingsError } = await supabase.from('store_settings').select('*').eq('id', 1).single();
      let currentStoreSettings = defaultStoreSettings;
      if (settingsError) {
        console.error('Error fetching store settings:', JSON.stringify(settingsError, null, 2));
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
        setShowPopup(true);
      }
    };
    fetchData();
  }, []);

  // URL parameter handling
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment_status');
    const hash = window.location.hash;

    if (paymentStatus === 'success') {
      setCartItems([]);
      setCurrentPage('orderconfirmation');
      window.history.replaceState(null, '', window.location.pathname);
    } else if (paymentStatus === 'failure' || paymentStatus === 'pending') {
      setCurrentPage('home');
      window.history.replaceState(null, '', window.location.pathname);
    } else if (hash.includes('type=recovery')) {
      setCurrentPage('reset-password');
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const handleAddToCart = useCallback((productToAdd: Product, quantity: number, selectedVariant: ProductVariant) => {
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
  }, []);

  const handleUpdateCartQuantity = useCallback((productId: string, variantId: string, newQuantity: number) => {
    setCartItems(prevItems => {
      if (newQuantity <= 0) {
        return prevItems.filter(item => !(item.id === productId && item.selectedVariant.id === variantId));
      }
      return prevItems.map(item =>
        item.id === productId && item.selectedVariant.id === variantId ? { ...item, quantity: newQuantity } : item
      );
    });
  }, []);

  const handleRemoveFromCart = useCallback((productId: string, variantId: string) => {
    setCartItems(prevItems => prevItems.filter(item => !(item.id === productId && item.selectedVariant.id === variantId)));
  }, []);

  const handleToggleWishlist = useCallback((product: Product) => {
    setWishlistItems(prevItems => {
      const isWishlisted = prevItems.some(item => item.id === product.id);
      if (isWishlisted) {
        return prevItems.filter(item => item.id !== product.id);
      } else {
        return [...prevItems, product];
      }
    });
  }, []);

  const handleSearch = useCallback((term: string, category: string) => {
    setSearchTerm(term);
    setSearchCategory(category);
    setInitialShopCategory(undefined);
    setCurrentPage('shop');
  }, []);

  const navigateTo = useCallback((path: string) => {
    setSelectedProduct(null);
    const cleanPath = path.toLowerCase().replace(/^\/|\/$/g, '');
    const parts = cleanPath.split('/');
    const page = parts[0];
    const param = parts[1];

    if (page === 'shop' && param) {
      setInitialShopCategory(param);
      setSearchTerm('');
      setSearchCategory('');
    } else if (page.toLowerCase() !== 'shop') {
      setInitialShopCategory(undefined);
      setSearchTerm('');
      setSearchCategory('');
    }

    if (page.toLowerCase() === 'orderconfirmation') {
      setCartItems([]);
    }

    setCurrentPage(page);
    window.scrollTo(0, 0);
  }, []);

  const handleCategorySelect = useCallback((categoryName: string) => {
    setSelectedProduct(null);
    setInitialShopCategory(categoryName);
    setSearchTerm('');
    setSearchCategory('');
    setCurrentPage('shop');
    window.scrollTo(0, 0);
  }, []);

  const handleProductSelect = useCallback((product: Product) => {
    setSelectedProduct(product);
    window.scrollTo(0, 0);
  }, []);

  const handleBackToShop = useCallback(() => {
    setSelectedProduct(null);
    setCurrentPage('shop');
    window.scrollTo(0, 0);
  }, []);

  const handleCheckoutNavigation = useCallback(() => {
    if (session) {
      navigateTo('checkout');
    } else {
      setPostLoginRedirect('checkout');
      navigateTo('login');
    }
  }, [session, navigateTo]);

  const handleViewCartFromModal = useCallback(() => {
    setShowAddToCartModal(false);
    navigateTo('cart');
  }, [navigateTo]);

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const isAdminPage = currentPage === 'dashboard' || currentPage === 'shipping-test' || currentPage === 'synctest';

  return {
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
    postLoginRedirect,
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
  };
};