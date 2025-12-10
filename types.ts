export interface ProductVariant {
  id: string;
  product_id: string;
  color?: string;
  color_name?: string; // NOVO CAMPO: Nome amigável da cor
  size?: string;
  price?: number;
  stock: number;
  image_url?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string[];
  price: number;
  discount_price?: number; // NOVO CAMPO: Preço com desconto
  imageUrl: string;
  rating: number;
  description?: string;
  weight: number; // kg
  width: number;  // cm
  height: number; // cm
  length: number; // cm
  variants?: ProductVariant[];
  gallery_images?: string[]; // Novo campo para galeria de imagens
}

export interface Category {
  id: string;
  name: string;
  imageUrl: string;
  icon_url?: string;
  product_count?: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariant: ProductVariant;
}

export interface ShippingOption {
  id: number;
  name: string;
  price: string;
  delivery_time: number;
  company: {
    id: number;
    name: string;
    picture: string;
  };
  error?: string;
}

export interface Profile {
    id: string;
    full_name: string;
    updated_at: string;
    avatar_url: string;
    saldo_cashback: number;
}

export interface CashbackLog {
    id: string;
    created_at: string;
    type: 'credit' | 'usage';
    amount: number;
    description: string;
}

export interface HeroSlide {
    id: string;
    title: string;
    description: string;
    button_text: string;
    button_link: string;
    image_url: string;
    is_active: boolean;
    sort_order: number;
}

export interface SocialLink {
    id: string;
    name: string;
    url: string;
    icon_url?: string;
    sort_order: number;
    is_active: boolean;
}

export interface StoreSettings {
  store_name?: string;
  contact_email?: string;
  origin_postal_code?: string;
  sender_name?: string;
  sender_phone?: string;
  sender_document?: string;
  sender_address?: string;
  cashback_is_active?: boolean;
  cashback_percentage?: number;
  free_shipping_is_active?: boolean;
  free_shipping_threshold?: number;
  free_shipping_message?: string; // Novo campo
  store_logo_url?: string; // NOVO CAMPO
  logo_height?: number; // NOVO CAMPO
  logo_width?: number; // NOVO CAMPO
  global_discount_percentage?: number; // NOVO CAMPO
  payment_on_delivery_active?: boolean; // NOVO CAMPO
}

export interface PageHeaderData {
    id: string;
    page_slug: string;
    title: string;
    description: string;
    image_url: string;
}