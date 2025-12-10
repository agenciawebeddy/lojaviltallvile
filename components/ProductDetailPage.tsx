import React, { useState, useMemo, useEffect } from 'react';
import { Product, ProductVariant, ShippingOption } from '../types'; // Importando ShippingOption
import { Heart, Ruler, Gift, Loader2, Truck, MapPin, AlertCircle } from 'lucide-react'; // Importando ícones
import usePageHeader from '../src/hooks/usePageHeader';
import PageHeader from '../src/components/PageHeader';
import RelatedProductsCarousel from '../src/components/RelatedProductsCarousel';
import { supabase } from '../src/integrations/supabase/client';
import ProductViewTracker from '../src/components/ProductViewTracker'; // Importando o novo componente

interface ProductDetailPageProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number, selectedVariant: ProductVariant) => void;
  onBackToShop: () => void;
  isInWishlist: boolean;
  onToggleWishlist: (product: Product) => void;
  onNavigate: (page: string) => void;
  cashbackPercentage: number;
  onProductSelect: (product: Product) => void;
  globalDiscountPercentage: number; // Nova prop
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, onAddToCart, onBackToShop, isInWishlist, onToggleWishlist, onNavigate, cashbackPercentage, onProductSelect, globalDiscountPercentage }) => {
  const { headerData, isLoading: isHeaderLoading } = usePageHeader('product-detail');

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [displayImage, setDisplayImage] = useState(product.imageUrl);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);

  // Estados para o cálculo de frete
  const [postalCode, setPostalCode] = useState('');
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  const variants = product.variants || [];
  const hasVariants = variants.length > 0;

  const galleryImages = useMemo(() => {
    const images = new Set<string>();
    const uniqueVariantImages = new Set<string>();

    if (product.variants) {
      for (const variant of product.variants) {
        if (variant.image_url) {
          uniqueVariantImages.add(variant.image_url);
        }
      }
    }

    if (uniqueVariantImages.size > 0) {
      if (product.imageUrl) {
        images.add(product.imageUrl);
      }
      uniqueVariantImages.forEach(img => images.add(img));
    } else {
      if (product.imageUrl) {
        images.add(product.imageUrl);
      }
      if (product.gallery_images && Array.isArray(product.gallery_images)) {
        product.gallery_images.forEach(img => images.add(img));
      }
    }

    const uniqueImages = Array.from(images);

    if (product.imageUrl) {
      const mainIndex = uniqueImages.indexOf(product.imageUrl);
      if (mainIndex > 0) {
        uniqueImages.splice(mainIndex, 1);
        uniqueImages.unshift(product.imageUrl);
      }
    }

    return uniqueImages;
  }, [product.imageUrl, product.variants, product.gallery_images]);

  const availableColors = useMemo(() => [...new Set(variants.map(v => v.color).filter(Boolean))], [variants]);
  const availableSizes = useMemo(() => [...new Set(variants.map(v => v.size).filter(Boolean))], [variants]);

  useEffect(() => {
    if (availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0]);
    }
  }, [availableColors, selectedColor]);

  useEffect(() => {
    if (availableSizes.length > 0 && !selectedSize) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes, selectedSize]);

  const sizesForSelectedColor = useMemo(() => {
    if (!selectedColor || availableColors.length === 0) return availableSizes;
    return [...new Set(variants.filter(v => v.color === selectedColor).map(v => v.size).filter(Boolean))];
  }, [variants, selectedColor, availableColors.length]);

  useEffect(() => {
    if (sizesForSelectedColor.length > 0) {
      if (!selectedSize || !sizesForSelectedColor.includes(selectedSize)) {
        setSelectedSize(sizesForSelectedColor[0]);
      }
    } else if (availableSizes.length > 0 && !selectedSize) {
      setSelectedSize(availableSizes[0]);
    }
  }, [sizesForSelectedColor, selectedSize, availableSizes]);

  const selectedVariant = useMemo(() => {
    if (!hasVariants) {
      return { id: 'default', product_id: product.id, stock: 1, price: product.discount_price || product.price, image_url: product.imageUrl };
    }

    const foundVariant = variants.find(v => {
      const colorMatch = availableColors.length === 0 || v.color === selectedColor;
      const sizeMatch = availableSizes.length === 0 || v.size === selectedSize;
      return colorMatch && sizeMatch;
    });

    // Se a variante encontrada não tiver um preço específico, usa o preço de desconto do produto principal
    // que já considera o desconto global
    if (foundVariant && foundVariant.price === undefined) {
      return { ...foundVariant, price: product.discount_price ?? product.price };
    }

    return foundVariant || null;
  }, [variants, selectedColor, selectedSize, hasVariants, product, availableColors, availableSizes]);

  useEffect(() => {
    if (selectedVariant?.image_url) {
      setDisplayImage(selectedVariant.image_url);
    } else {
      setDisplayImage(product.imageUrl);
    }
  }, [selectedVariant, product.imageUrl]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      setIsLoadingRelated(true);
      if (!product.category || product.category.length === 0) {
        setRelatedProducts([]);
        setIsLoadingRelated(false);
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select('*, variants:product_variants(*)')
        .overlaps('category', product.category)
        .limit(10);

      if (error) {
        console.error('Error fetching related products:', error);
        setRelatedProducts([]);
      } else {
        setRelatedProducts(data as Product[]);
      }
      setIsLoadingRelated(false);
    };

    fetchRelatedProducts();
  }, [product.category, product.id]);

  // Lógica para determinar o preço final e o preço original riscado
  const baseProductPrice = product.price;
  let finalPrice = baseProductPrice; // Preço que será exibido
  let originalPrice: number | null = null; // Preço original riscado

  // 1. Se a variante selecionada tem preço específico, usa o preço da variante
  if (selectedVariant?.price !== undefined && selectedVariant.price > 0) {
    finalPrice = selectedVariant.price;
    // Se o preço da variante for diferente do preço base, mostra o preço base riscado
    if (selectedVariant.price < baseProductPrice) {
      originalPrice = baseProductPrice;
    }
  }
  // 2. Se não houver preço na variante, verifica se há discount_price no produto
  else if (product.discount_price !== undefined && product.discount_price > 0) {
    finalPrice = product.discount_price;
    // Se houver desconto, mostra o preço base riscado
    if (product.discount_price < baseProductPrice) {
      originalPrice = baseProductPrice;
    }
  }
  // 3. Caso contrário, usa o preço base sem desconto
  // (Não aplicamos desconto global automaticamente)

  const installmentValue = finalPrice / 3;

  const canAddToCart = !!selectedVariant && selectedVariant.stock > 0;
  const cashbackAmount = finalPrice * (cashbackPercentage / 100);

  const formatPrice = (price: number) => price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleAddToCartClick = () => {
    if (canAddToCart && selectedVariant) {
      onAddToCart(product, quantity, selectedVariant);
    }
  };

  const productCategories = Array.isArray(product.category) ? product.category : [product.category];

  const handleCalculateShipping = async () => {
    const cep = postalCode.replace(/\D/g, '');
    if (cep.length !== 8) {
      setShippingError('Por favor, insira um CEP válido com 8 dígitos.');
      setShippingOptions([]);
      return;
    }

    setIsCalculatingShipping(true);
    setShippingError(null);
    setShippingOptions([]);

    // Prepara os detalhes do produto para a Edge Function
    const productForShipping = {
      ...product,
      quantity: quantity, // Usa a quantidade selecionada
      price: finalPrice, // Usa o preço final do produto/variante
    };

    try {
      // Não precisamos de endereço completo para o cálculo inicial de frete
      const shippingDetails = { postalCode: cep };

      const { data: shippingData, error: invokeError } = await supabase.functions.invoke('calculate-shipping', {
        body: {
          shippingDetails: shippingDetails,
          cartItems: [productForShipping]
        },
      });

      if (invokeError || (shippingData && shippingData.error)) {
        let detailedError = invokeError?.message || shippingData?.error || 'Não foi possível calcular o frete.';
        if (invokeError?.context?.responseText) {
          try {
            const errorJson = JSON.parse(invokeError.context.responseText);
            if (errorJson.error) detailedError = errorJson.error;
          } catch (e) { /* ignore */ }
        }
        throw new Error(detailedError);
      }

      const validOptions = shippingData.filter((option: ShippingOption) => !option.error);
      setShippingOptions(validOptions);

      if (validOptions.length === 0 && !shippingData.error) {
        setShippingError('Nenhuma opção de frete encontrada para este CEP.');
      }

    } catch (e: any) {
      setShippingError(e.message || 'Ocorreu um erro inesperado ao calcular o frete.');
      console.error('Erro ao calcular frete:', e);
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  if (isHeaderLoading) {
    return <div className="flex justify-center items-center p-8 h-screen"><Loader2 className="animate-spin" size={32} /></div>;
  }

  return (
    <div className="bg-white text-gray-800">
      <PageHeader
        title={headerData?.title || "Detalhes do Produto"}
        description={headerData?.description || "Informações completas sobre o produto selecionado."}
        imageUrl={headerData?.image_url}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Galeria de Imagens do Produto */}
          <div>
            <div
              className="border border-gray-200 p-4 rounded-lg mb-4 relative overflow-hidden"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <img
                src={displayImage}
                alt={product.name}
                className={`w-full h-auto object-contain transition-transform duration-300 ${isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'}`}
                style={{ transformOrigin: 'center center' }}
              />
            </div>
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-5 gap-4">
                {galleryImages.map((imgUrl, index) => (
                  <div
                    key={index}
                    onClick={() => setDisplayImage(imgUrl)}
                    className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-colors ${displayImage === imgUrl ? 'border-red-500' : 'border-gray-200 hover:border-gray-400'}`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover aspect-square" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detalhes do Produto */}
          <div>
            <div className="text-sm text-gray-500 mb-4">
              <span onClick={() => onNavigate('home')} className="cursor-pointer hover:text-gray-900">Home</span> /
              <span onClick={() => onNavigate('shop')} className="cursor-pointer hover:text-gray-900"> Loja</span> /
              <span className="font-semibold text-gray-800"> {product.name}</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>

            {/* Preços e Parcelamento */}
            <div className="flex flex-col items-start gap-1 mb-2">
              {originalPrice && (
                <p className="text-xl text-gray-500 line-through">
                  {formatPrice(originalPrice)}
                </p>
              )}
              <p className="text-2xl font-bold text-red-500">
                {formatPrice(finalPrice)}
              </p>
            </div>
            <p className="text-md text-gray-700 mb-6 font-semibold">
              3x de {formatPrice(installmentValue)} sem juros
            </p>

            {cashbackPercentage > 0 && cashbackAmount > 0 && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg flex items-center gap-3">
                <Gift size={24} className="text-green-600 flex-shrink-0" />
                <div>
                  <span className="font-bold">Você recebe {formatPrice(cashbackAmount)} de volta!</span>
                  <p className="text-xs">Este valor será creditado como cashback na sua conta após a confirmação do pagamento.</p>
                </div>
              </div>
            )}

            <p className="text-gray-600 leading-relaxed mb-6">{product.description || 'Nenhuma descrição disponível.'}</p>

            {availableColors.length > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <h3 className="text-md font-semibold text-gray-700">Cor:</h3>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedColor === color ? 'border-gray-800 ring-2 ring-offset-1 ring-gray-800' : 'border-gray-300 hover:border-gray-500'}`}
                      style={{ backgroundColor: color }}
                      aria-label={`Selecionar cor ${color}`}
                    >
                      {/* Conteúdo vazio, a cor é definida pelo background */}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sizesForSelectedColor.length > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <h3 className="text-md font-semibold text-gray-700">Tamanho:</h3>
                <div className="flex flex-wrap gap-2">
                  {sizesForSelectedColor.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-1 rounded-sm border transition-colors text-sm font-semibold ${selectedSize === size ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-300 hover:border-gray-800'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-300 rounded-sm">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-2 text-lg hover:bg-gray-100">-</button>
                <span className="px-5 py-2 text-md font-bold bg-white">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="px-4 py-2 text-lg hover:bg-gray-100">+</button>
              </div>
              <button
                onClick={handleAddToCartClick}
                disabled={!canAddToCart}
                className="flex-grow bg-red-500 text-white font-bold py-3 px-8 rounded-sm hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {canAddToCart ? 'COMPRAR' : 'Indisponível'}
              </button>
            </div>

            {/* Seção de Cálculo de Frete */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><Truck size={20} /> Calcular Frete</h3>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-red-500 focus:border-red-500"
                    placeholder="Digite seu CEP"
                    maxLength={9}
                  />
                </div>
                <button
                  onClick={handleCalculateShipping}
                  disabled={isCalculatingShipping}
                  className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 flex items-center gap-2"
                >
                  {isCalculatingShipping ? <Loader2 className="animate-spin" size={20} /> : 'Calcular'}
                </button>
              </div>
              {shippingError && (
                <div className="flex items-center gap-2 text-red-700 bg-red-100 p-3 rounded-md mt-3">
                  <AlertCircle size={20} /> {shippingError}
                </div>
              )}
              {shippingOptions.length > 0 && (
                <div className="mt-4 space-y-2">
                  {shippingOptions.map(option => (
                    <div key={option.id} className="flex items-center justify-between p-3 rounded-md bg-gray-50 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <img src={option.company.picture} alt={option.company.name} className="w-6 h-6 object-contain" />
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{option.name}</p>
                          <p className="text-xs text-gray-600">Entrega em {option.delivery_time} dias úteis</p>
                        </div>
                      </div>
                      <p className="font-bold text-gray-900">{formatPrice(parseFloat(option.price))}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ajuste de layout para mobile: flex-col no mobile, flex-row no desktop */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 text-sm text-gray-600 mb-8 border-b border-gray-200 pb-6">
              <button
                onClick={() => onToggleWishlist(product)}
                className="flex items-center gap-2 hover:text-gray-900 w-full md:w-auto py-2 px-4 rounded-sm transition-colors"
              >
                <Heart size={16} className={isInWishlist ? 'text-red-500 fill-current' : ''} />
                {isInWishlist ? 'Remover da lista de desejos' : 'Adicionar à lista de desejos'}
              </button>
              <a href="#" className="flex items-center gap-2 hover:text-gray-900 w-full md:w-auto py-2 px-4 rounded-sm transition-colors"><Ruler size={16} /> Guia de tamanhos</a>
            </div>

            <div className="text-sm text-gray-500 space-y-1">
              <p><span className="font-semibold text-gray-700">SKU:</span> N/A</p>
              <p><span className="font-semibold text-gray-700">Categoria:</span> {productCategories.join(', ')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Carrossel de Produtos Relacionados */}
      {!isLoadingRelated && relatedProducts.length > 0 && (
        <RelatedProductsCarousel
          products={relatedProducts}
          onAddToCart={onAddToCart}
          onProductSelect={onProductSelect}
          wishlistItems={[]}
          onToggleWishlist={onToggleWishlist}
          currentProductId={product.id}
        />
      )}

      {/* Product View Tracker */}
      <ProductViewTracker productName={product.name} isVisible={true} />
    </div>
  );
};

export default ProductDetailPage;