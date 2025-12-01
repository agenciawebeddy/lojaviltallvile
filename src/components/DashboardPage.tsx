import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Product, ProductVariant, Category } from '../../types';
import { Plus, Edit, Trash2, Loader2, AlertCircle, Package, Settings, Truck, ShoppingBag, Bug, Tag, LayoutDashboard, Image, Share2, FileText, Search, MessageSquare } from 'lucide-react';
import ImageUpload from './ImageUpload';
import SettingsPage from './SettingsPage';
import ShippingSettingsPage from './ShippingSettingsPage';
import OrdersManagementPage from './OrdersManagementPage';
import CategoriesManagementPage from './CategoriesManagementPage';
import AdminStats from './AdminStats';
import HeroSliderManagementPage from './HeroSliderManagementPage';
import MultiSelectDropdown from './MultiSelectDropdown';
import SocialLinksManagementPage from './SocialLinksManagementPage';
import MultiImageUpload from './MultiImageUpload'; // Importando o novo componente
import PageHeader from './PageHeader'; // Importando PageHeader
import PageHeaderManagementPage from './PageHeaderManagementPage'; // NOVO IMPORT
import SyncTestPage from '../components/SyncTestPage'; // Importação adicionada
import ShippingTestPage from '../components/ShippingTestPage'; // Importação adicionada
import PopupManagementPage from './PopupManagementPage'; // NOVO IMPORT

const ProductForm = ({ product, onSave, onCancel }: { product: Partial<Product> | null, onSave: () => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState<Partial<Product>>(product || { variants: [], category: [], gallery_images: [] });
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isEditing = !!product?.id;

    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase.from('categories').select('*').order('name');
            if (data) {
                setCategories(data);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const numericFields = ['price', 'discount_price', 'weight', 'height', 'width', 'length'];
        
        if (numericFields.includes(name)) {
            // Permite que o campo seja vazio (undefined) se o valor for uma string vazia
            const numericValue = value.replace(',', '.');
            setFormData(prev => ({ ...prev, [name]: numericValue === '' ? undefined : Number(numericValue) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCategoryChange = (selectedCategories: string[]) => {
        setFormData(prev => ({ ...prev, category: selectedCategories }));
    };

    const handleVariantChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newVariants = [...(formData.variants || [])];
        const numericFields = ['price', 'stock'];
        
        const variant = { 
            ...newVariants[index], 
            [name]: numericFields.includes(name) ? (value === '' ? undefined : Number(value.replace(',', '.'))) : value 
        };
        newVariants[index] = variant;
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };
    
    const handleVariantImageUpload = (index: number, imageUrl: string) => {
        const newVariants = [...(formData.variants || [])];
        const variant = { ...newVariants[index], image_url: imageUrl };
        newVariants[index] = variant;
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const addVariant = () => {
        const newVariant: Partial<ProductVariant> = { color: '#000000', color_name: '', size: '', price: formData.price, stock: 1 }; // Cor padrão preta
        setFormData(prev => ({ ...prev, variants: [...(prev.variants || []), newVariant] }));
    };

    const removeVariant = (index: number) => {
        setFormData(prev => ({ ...prev, variants: prev.variants?.filter((_, i) => i !== index) }));
    };

    const handleImageUpload = (imageUrl: string) => {
        setFormData(prev => ({ ...prev, imageUrl }));
    };
    
    const handleGalleryImagesUpdate = (urls: string[]) => {
        setFormData(prev => ({ ...prev, gallery_images: urls }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const { error: rpcError } = await supabase.rpc('upsert_product_with_variants', {
            p_product_data: { 
                ...formData, 
                variants: undefined, 
                category: formData.category || [],
                gallery_images: formData.gallery_images || [] // Incluindo a galeria
            },
            p_variants_data: formData.variants || []
        });

        if (rpcError) {
            setError(`Erro ao salvar: ${rpcError.message}`);
            setIsLoading(false);
        } else {
            onSave();
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{isEditing ? 'Editar Produto' : 'Adicionar Novo Produto'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Nome do Produto</label>
                        <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" required />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Categorias</label>
                        <MultiSelectDropdown
                            options={categories.map(cat => ({ value: cat.name, label: cat.name }))}
                            selected={Array.isArray(formData.category) ? formData.category : []}
                            onChange={handleCategoryChange}
                            placeholder="Selecione as categorias"
                        />
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">Preço Base (BRL)</label>
                        <input type="number" name="price" step="0.01" value={formData.price || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" required />
                    </div>
                    <div>
                        <label htmlFor="discount_price" className="block text-sm font-medium text-gray-700 mb-2">Preço com Desconto (BRL - Opcional)</label>
                        <input type="number" name="discount_price" step="0.01" value={formData.discount_price || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" placeholder="Deixe vazio se não houver desconto" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Imagem Principal</label>
                        <ImageUpload onImageUpload={handleImageUpload} currentImageUrl={formData.imageUrl} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Galeria de Imagens Adicionais</label>
                        <MultiImageUpload 
                            onImagesUpdate={handleGalleryImagesUpdate} 
                            currentImageUrls={formData.gallery_images || []} 
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                        <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={4} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500"></textarea>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Variações do Produto</h3>
                    <div className="space-y-4 mt-4">
                        {formData.variants?.map((variant, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start bg-gray-50 p-4 rounded-md border border-gray-200">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Cor (Hex)</label>
                                    <input type="color" name="color" value={variant.color || '#000000'} onChange={(e) => handleVariantChange(index, e)} className="w-full h-10 p-1 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Nome da Cor</label>
                                    <input type="text" name="color_name" placeholder="Ex: Vermelho Ferrari" value={variant.color_name || ''} onChange={(e) => handleVariantChange(index, e)} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 text-sm focus:ring-red-500 focus:border-red-500" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Tamanho</label>
                                    <input type="text" name="size" placeholder="Ex: M" value={variant.size || ''} onChange={(e) => handleVariantChange(index, e)} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 text-sm focus:ring-red-500 focus:border-red-500" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Preço (Opcional)</label>
                                    <input type="number" name="price" placeholder="Preço" step="0.01" value={variant.price || ''} onChange={(e) => handleVariantChange(index, e)} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 text-sm focus:ring-red-500 focus:border-red-500" />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Estoque</label>
                                    <input type="number" name="stock" placeholder="Qtd" value={variant.stock || 0} onChange={(e) => handleVariantChange(index, e)} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 text-sm focus:ring-red-500 focus:border-red-500" required />
                                </div>
                                <div className="md:col-span-1 flex items-center justify-end pt-5">
                                    <button type="button" onClick={() => removeVariant(index)} className="text-red-500 hover:text-red-600 p-2"><Trash2 size={18} /></button>
                                </div>
                                <div className="md:col-span-12">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Imagem da Variação</label>
                                    <ImageUpload 
                                        onImageUpload={(url) => handleVariantImageUpload(index, url)} 
                                        currentImageUrl={variant.image_url} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addVariant} className="mt-4 flex items-center gap-2 text-sm bg-red-50 text-red-600 font-semibold py-2 px-4 rounded-lg hover:bg-red-100 transition-colors">
                        <Plus size={16} /> Adicionar Variação
                    </button>
                </div>

                <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Dimensões para Frete</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
                        <div>
                            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">Peso (kg)</label>
                            <input type="number" name="weight" step="0.01" value={formData.weight || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" required />
                        </div>
                        <div>
                            <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">Altura (cm)</label>
                            <input type="number" name="height" step="0.01" value={formData.height || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" required />
                        </div>
                        <div>
                            <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-2">Largura (cm)</label>
                            <input type="number" name="width" step="0.01" value={formData.width || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" required />
                        </div>
                        <div>
                            <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-2">Profundidade (cm)</label>
                            <input type="number" name="length" step="0.01" value={formData.length || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" required />
                        </div>
                    </div>
                </div>

                {error && <div className="flex items-center gap-2 text-red-700 bg-red-100 p-3 rounded-md"><AlertCircle size={20} /> {error}</div>}

                <div className="flex justify-end gap-4 mt-4">
                    <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
                    <button type="submit" disabled={isLoading} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 disabled:bg-red-300">
                        {isLoading ? <Loader2 className="animate-spin" /> : null}
                        Salvar Produto
                    </button>
                </div>
            </form>
        </div>
    );
};

// --- Início do componente DashboardPage ---

const DashboardPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
    const [activeTab, setActiveTab] = useState('stats');
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [productSearchTerm, setProductSearchTerm] = useState('');

    const fetchProducts = async () => {
        setIsLoadingProducts(true);
        // Seleciona também as variantes
        const { data, error } = await supabase.from('products').select('*, variants:product_variants(*)').order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching products:', error);
        } else {
            setProducts(data as Product[]);
        }
        setIsLoadingProducts(false);
    };

    useEffect(() => {
        if (activeTab === 'products') {
            fetchProducts();
        }
    }, [activeTab]);

    const handleAddNewProduct = () => {
        setEditingProduct(null);
        setShowProductForm(true);
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setShowProductForm(true);
    };

    const handleDeleteProduct = async (productId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este produto? Esta ação é irreversível.')) {
            const { error } = await supabase.rpc('delete_product', { p_product_id: productId });
            if (error) {
                alert(`Erro ao excluir: ${error.message}`);
            } else {
                fetchProducts();
            }
        }
    };

    const handleSaveProduct = () => {
        setShowProductForm(false);
        setEditingProduct(null);
        fetchProducts();
    };

    const handleCancelForm = () => {
        setShowProductForm(false);
        setEditingProduct(null);
    };

    const filteredProducts = useMemo(() => {
        const term = productSearchTerm.toLowerCase();
        if (!term) return products;
        return products.filter(p => 
            p.name.toLowerCase().includes(term) || 
            p.id.toLowerCase().includes(term)
        );
    }, [products, productSearchTerm]);

    const renderContent = () => {
        switch (activeTab) {
            case 'stats':
                return <AdminStats />;
            case 'products':
                if (showProductForm) {
                    return <ProductForm product={editingProduct} onSave={handleSaveProduct} onCancel={handleCancelForm} />;
                }
                return (
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Produtos ({products.length})</h3>
                            <button onClick={handleAddNewProduct} className="flex items-center gap-2 bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
                                <Plus size={20} />
                                Novo Produto
                            </button>
                        </div>
                        
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar produto por nome ou ID..."
                                value={productSearchTerm}
                                onChange={(e) => setProductSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>

                        <div className="space-y-4">
                            {isLoadingProducts ? (
                                <div className="text-center p-8"><Loader2 className="animate-spin mx-auto" /></div>
                            ) : filteredProducts.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">Nenhum produto encontrado.</p>
                            ) : (
                                filteredProducts.map(product => (
                                    <div key={product.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-4 flex-grow min-w-0">
                                            <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-900 truncate">{product.name}</p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {product.variants && product.variants.length > 0 ? `${product.variants.length} variações` : 'Sem variações'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-lg font-bold text-red-600 flex-shrink-0">
                                                R$ {product.discount_price && product.discount_price > 0 ? product.discount_price.toFixed(2) : product.price.toFixed(2)}
                                            </span>
                                            <button onClick={() => handleEditProduct(product)} className="text-red-500 hover:text-red-600 p-1"><Edit size={18} /></button>
                                            <button onClick={() => handleDeleteProduct(product.id)} className="text-red-500 hover:text-red-600 p-1"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );
            case 'categories':
                return <CategoriesManagementPage />;
            case 'orders':
                return <OrdersManagementPage />;
            case 'slider':
                return <HeroSliderManagementPage />;
            case 'social':
                return <SocialLinksManagementPage />;
            case 'page-headers':
                return <PageHeaderManagementPage />;
            case 'popups': // NOVO CASO
                return <PopupManagementPage />;
            case 'shipping':
                return <ShippingSettingsPage />;
            case 'settings':
                return <SettingsPage />;
            case 'synctest':
                return <SyncTestPage />;
            case 'shipping-test':
                return <ShippingTestPage />;
            default:
                return <AdminStats />;
        }
    };

    const navItems = [
        { id: 'stats', name: 'Estatísticas', icon: <LayoutDashboard size={20} /> },
        { id: 'products', name: 'Produtos', icon: <Package size={20} /> },
        { id: 'categories', name: 'Categorias', icon: <Tag size={20} /> },
        { id: 'orders', name: 'Pedidos', icon: <ShoppingBag size={20} /> },
        { id: 'slider', name: 'Slider Home', icon: <Image size={20} /> },
        { id: 'social', name: 'Redes Sociais', icon: <Share2 size={20} /> },
        { id: 'page-headers', name: 'Cabeçalhos', icon: <FileText size={20} /> },
        { id: 'popups', name: 'Pop-ups', icon: <MessageSquare size={20} /> }, // NOVO ITEM
        { id: 'shipping', name: 'Frete', icon: <Truck size={20} /> },
        { id: 'settings', name: 'Configurações', icon: <Settings size={20} /> },
        { id: 'synctest', name: 'Teste Sinc. ME', icon: <Bug size={20} /> },
        { id: 'shipping-test', name: 'Teste Frete', icon: <Truck size={20} /> },
    ];

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Painel Administrativo</h1>
            
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar de Navegação */}
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm sticky top-28">
                        <nav className="space-y-1">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-sm font-medium ${
                                        activeTab === item.id
                                            ? 'bg-red-500 text-white shadow-md'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {React.cloneElement(item.icon as React.ReactElement, { className: 'w-5 h-5' })}
                                    {item.name}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Conteúdo Principal */}
                <div className="flex-grow">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;