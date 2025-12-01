import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { HeroSlide } from '../../types';
import { Plus, Edit, Trash2, Loader2, AlertCircle, Save, Link, Image, ListOrdered } from 'lucide-react';
import ImageUpload from './ImageUpload';

interface SlideFormProps {
  slide: Partial<HeroSlide> | null;
  onSave: () => void;
  onCancel: () => void;
}

const SlideForm: React.FC<SlideFormProps> = ({ slide, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<HeroSlide>>(slide || { is_active: true, sort_order: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isEditing = !!slide?.id;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? parseInt(value) : value 
        }));
    };
    
    const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleImageUpload = (imageUrl: string) => {
        setFormData(prev => ({ ...prev, image_url: imageUrl }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.image_url) {
            setError('Título e imagem são obrigatórios.');
            return;
        }
        setIsLoading(true);
        setError(null);

        const payload = {
            id: formData.id,
            title: formData.title,
            description: formData.description || '',
            button_text: formData.button_text || '',
            button_link: formData.button_link || '#',
            image_url: formData.image_url,
            is_active: formData.is_active,
            sort_order: formData.sort_order || 0,
        };

        const { error: upsertError } = await supabase
            .from('hero_slides')
            .upsert(payload);

        if (upsertError) {
            setError(`Erro ao salvar: ${upsertError.message}`);
            setIsLoading(false);
        } else {
            onSave();
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{isEditing ? 'Editar Slide' : 'Adicionar Novo Slide'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Título Principal</label>
                        <input type="text" name="title" value={formData.title || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" required />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                        <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500"></textarea>
                    </div>
                    
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Imagem de Fundo (1920x1080 recomendado)</label>
                        <ImageUpload onImageUpload={handleImageUpload} currentImageUrl={formData.image_url} />
                    </div>

                    <div>
                        <label htmlFor="button_text" className="block text-sm font-medium text-gray-700 mb-2">Texto do Botão</label>
                        <input type="text" name="button_text" value={formData.button_text || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" placeholder="Ex: Comprar Agora" />
                    </div>
                    <div>
                        <label htmlFor="button_link" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1"><Link size={16} /> Link do Botão</label>
                        <input type="text" name="button_link" value={formData.button_link || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" placeholder="Ex: /shop" />
                    </div>
                    
                    <div>
                        <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1"><ListOrdered size={16} /> Ordem de Exibição</label>
                        <input type="number" name="sort_order" value={formData.sort_order || 0} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" />
                    </div>
                    
                    <div className="flex items-center pt-8">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active || false}
                                onChange={handleToggleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-red-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                            <span className="ml-3 text-sm font-medium text-gray-700">Ativo</span>
                        </label>
                    </div>
                </div>

                {error && <div className="flex items-center gap-2 text-red-700 bg-red-100 p-3 rounded-md mt-6"><AlertCircle size={20} /> {error}</div>}
                
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 mt-6">
                    <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
                    <button type="submit" disabled={isLoading} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 disabled:bg-red-300">
                        {isLoading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                        Salvar Slide
                    </button>
                </div>
            </form>
        </div>
    );
};

const HeroSliderManagementPage: React.FC = () => {
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingSlide, setEditingSlide] = useState<Partial<HeroSlide> | null>(null);

    const fetchSlides = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('hero_slides')
            .select('*')
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching slides:', error);
        } else {
            setSlides(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchSlides();
    }, []);

    const handleAddNew = () => {
        setEditingSlide({});
        setShowForm(true);
    };

    const handleEdit = (slide: HeroSlide) => {
        setEditingSlide(slide);
        setShowForm(true);
    };

    const handleDelete = async (slideId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este slide?')) {
            const { error } = await supabase.from('hero_slides').delete().eq('id', slideId);
            if (error) {
                alert(`Erro ao excluir: ${error.message}`);
            } else {
                fetchSlides();
            }
        }
    };

    const handleSave = () => {
        setShowForm(false);
        setEditingSlide(null);
        fetchSlides();
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingSlide(null);
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Gerenciar Slides do Hero</h2>
                {!showForm && (
                    <button onClick={handleAddNew} className="flex items-center gap-2 bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
                        <Plus size={20} />
                        Adicionar Slide
                    </button>
                )}
            </div>

            {showForm && <SlideForm slide={editingSlide} onSave={handleSave} onCancel={handleCancel} />}

            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center p-8"><Loader2 className="animate-spin mx-auto" /></div>
                ) : slides.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nenhum slide cadastrado. Adicione um para começar!</p>
                ) : (
                    slides.map(slide => (
                        <div key={slide.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-4 flex-grow min-w-0"> {/* Adicionado min-w-0 */}
                                <img src={slide.image_url} alt={slide.title} className="w-20 h-12 object-cover rounded-md flex-shrink-0" />
                                <div className="min-w-0"> {/* Adicionado min-w-0 para permitir que o texto encolha */}
                                    <p className="font-bold text-gray-900 truncate">{slide.title}</p>
                                    <p className="text-sm text-gray-500 truncate max-w-xs">{slide.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0"> {/* Reduzido o gap para 2 */}
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${slide.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} hidden sm:inline`}>
                                    {slide.is_active ? 'Ativo' : 'Inativo'}
                                </span>
                                <span className="text-xs text-gray-500 hidden sm:inline">Ordem: {slide.sort_order}</span>
                                <button onClick={() => handleEdit(slide)} className="text-red-500 hover:text-red-600 p-1"><Edit size={18} /></button>
                                <button onClick={() => handleDelete(slide.id)} className="text-red-500 hover:text-red-600 p-1"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HeroSliderManagementPage;