import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { PageHeaderData } from '../../types';
import { Loader2, AlertCircle, Save, Edit } from 'lucide-react';
import ImageUpload from './ImageUpload';
import AddShopHeaderButton from './AddShopHeaderButton';

interface PageHeaderFormProps {
    initialData: PageHeaderData;
    onSave: () => void;
    onCancel: () => void;
}

const PageHeaderForm: React.FC<PageHeaderFormProps> = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState<PageHeaderData>(initialData);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (imageUrl: string) => {
        setFormData(prev => ({ ...prev, image_url: imageUrl }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        const { error: updateError } = await supabase
            .from('page_headers')
            .update({
                title: formData.title,
                description: formData.description,
                image_url: formData.image_url,
                updated_at: new Date().toISOString(),
            })
            .eq('page_slug', formData.page_slug);

        if (updateError) {
            setError(`Erro ao salvar: ${updateError.message}`);
        } else {
            setSuccess('Cabeçalho da página salvo com sucesso!');
            onSave();
            setTimeout(() => setSuccess(null), 3000);
        }
        setIsSaving(false);
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4 capitalize">Editar Cabeçalho: {formData.page_slug.replace('-', ' ')}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" required />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Imagem de Fundo (1920x300 recomendado)</label>
                    <ImageUpload onImageUpload={handleImageUpload} currentImageUrl={formData.image_url} />
                </div>

                {error && <div className="flex items-center gap-2 text-red-700 bg-red-100 p-3 rounded-md mt-4"><AlertCircle size={20} /> {error}</div>}
                {success && <div className="flex items-center gap-2 text-green-700 bg-green-100 p-3 rounded-md mt-4">{success}</div>}

                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
                    <button type="submit" disabled={isSaving} className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 disabled:bg-red-300">
                        {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                        Salvar Alterações
                    </button>
                </div>
            </form>
        </div>
    );
};

const PageHeaderManagementPage: React.FC = () => {
    const [headers, setHeaders] = useState<PageHeaderData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingHeader, setEditingHeader] = useState<PageHeaderData | null>(null);

    const fetchHeaders = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('page_headers')
            .select('*')
            .order('page_slug', { ascending: true });

        if (error) {
            console.error('Error fetching page headers:', error);
        } else {
            setHeaders(data as PageHeaderData[]);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchHeaders();
    }, []);

    const handleEdit = (header: PageHeaderData) => {
        setEditingHeader(header);
    };

    const handleSave = () => {
        setEditingHeader(null);
        fetchHeaders();
    };

    const handleCancel = () => {
        setEditingHeader(null);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin" size={32} /></div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gerenciar Cabeçalhos de Páginas</h2>
            <p className="text-gray-600 mb-6">Edite o título, descrição e imagem de fundo das páginas estáticas da loja.</p>

            {/* Botão temporário para adicionar a página Shop */}
            {!headers.find(h => h.page_slug === 'shop') && <AddShopHeaderButton />}

            {editingHeader ? (
                <PageHeaderForm initialData={editingHeader} onSave={handleSave} onCancel={handleCancel} />
            ) : (
                <div className="space-y-4">
                    {headers.map(header => (
                        <div key={header.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-4 flex-grow min-w-0">
                                <img src={header.image_url} alt={`Imagem de ${header.page_slug}`} className="w-16 h-10 object-cover rounded-md flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-900 capitalize">{header.page_slug.replace('-', ' ')}</p>
                                    <p className="text-sm text-gray-500 truncate">{header.title}</p>
                                </div>
                            </div>
                            <button onClick={() => handleEdit(header)} className="text-red-500 hover:text-red-600 p-2 flex items-center gap-1">
                                <Edit size={18} /> Editar
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PageHeaderManagementPage;