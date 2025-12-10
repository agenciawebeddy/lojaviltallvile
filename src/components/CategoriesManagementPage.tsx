import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Category } from '../../types';
import { Plus, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react';
import ImageUpload from './ImageUpload';
import IconUpload from './IconUpload';

const CategoryForm = ({ category, onSave, onCancel }: { category: Partial<Category> | null, onSave: () => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState<Partial<Category>>(category || {});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isEditing = !!category?.id;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, name: e.target.value }));
    };

    const handleImageUpload = (imageUrl: string) => {
        setFormData(prev => ({ ...prev, imageUrl }));
    };

    const handleIconUpload = (iconUrl: string) => {
        setFormData(prev => ({ ...prev, icon_url: iconUrl }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.imageUrl) {
            setError('Nome e imagem da categoria são obrigatórios.');
            return;
        }
        setIsLoading(true);
        setError(null);

        const { error: upsertError } = await supabase
            .from('categories')
            .upsert({
                id: formData.id,
                name: formData.name,
                imageUrl: formData.imageUrl,
                icon_url: formData.icon_url,
            });

        if (upsertError) {
            setError(`Erro ao salvar: ${upsertError.message}`);
            setIsLoading(false);
        } else {
            onSave();
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{isEditing ? 'Editar Categoria' : 'Adicionar Nova Categoria'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Nome da Categoria</label>
                    <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Imagem da Categoria</label>
                        <ImageUpload onImageUpload={handleImageUpload} currentImageUrl={formData.imageUrl} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ícone da Categoria (SVG/PNG)</label>
                        <IconUpload onIconUpload={handleIconUpload} currentIconUrl={formData.icon_url} />
                    </div>
                </div>
                {error && <div className="flex items-center gap-2 text-red-700 bg-red-100 p-3 rounded-md"><AlertCircle size={20} /> {error}</div>}
                <div className="flex justify-end gap-4 mt-4">
                    <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
                    <button type="submit" disabled={isLoading} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 disabled:bg-red-300">
                        {isLoading ? <Loader2 className="animate-spin" /> : null}
                        Salvar Categoria
                    </button>
                </div>
            </form>
        </div>
    );
};

const CategoriesManagementPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

    const fetchCategories = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.rpc('get_categories_with_product_count');
        if (error) {
            console.error('Error fetching categories with product count:', error);
        } else {
            setCategories(data as Category[]);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddNew = () => {
        setEditingCategory({});
        setShowForm(true);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setShowForm(true);
    };

    const handleDelete = async (categoryId: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
            const { error } = await supabase.from('categories').delete().eq('id', categoryId);
            if (error) {
                alert(`Erro ao excluir: ${error.message}`);
            } else {
                fetchCategories();
            }
        }
    };

    const handleSave = () => {
        setShowForm(false);
        setEditingCategory(null);
        fetchCategories();
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingCategory(null);
    };

    return (
        <>
            <div className="flex justify-end mb-4">
                {!showForm && (
                    <button onClick={handleAddNew} className="flex items-center gap-2 bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
                        <Plus size={20} />
                        Adicionar Categoria
                    </button>
                )}
            </div>

            {showForm && <CategoryForm category={editingCategory} onSave={handleSave} onCancel={handleCancel} />}

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Adicionando overflow-x-auto para permitir scroll horizontal no mobile */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]"> {/* Adicionando min-w para garantir que a tabela não encolha demais */}
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-gray-500 uppercase tracking-wider w-1/2">Categoria</th>
                                <th className="p-4 text-sm font-semibold text-gray-500 uppercase tracking-wider w-1/4">Produtos</th>
                                <th className="p-4 text-sm font-semibold text-gray-500 uppercase tracking-wider text-right w-1/4">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={3} className="text-center p-8"><Loader2 className="animate-spin mx-auto" /></td></tr>
                            ) : categories.map(category => (
                                <tr key={category.id} className="border-t border-gray-200">
                                    <td className="p-4 flex items-center gap-4 min-w-0">
                                        <img src={category.imageUrl} alt={category.name} className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
                                        {category.icon_url && <img src={category.icon_url} alt="" className="w-6 h-6 object-contain flex-shrink-0" />}
                                        <span className="font-medium text-gray-900 truncate min-w-0">{category.name}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                                            {category.product_count}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right flex-shrink-0">
                                        <button onClick={() => handleEdit(category)} className="text-red-500 hover:text-red-600 p-1"><Edit size={18} /></button>
                                        <button onClick={() => handleDelete(category.id)} className="text-red-500 hover:text-red-600 p-1"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default CategoriesManagementPage;