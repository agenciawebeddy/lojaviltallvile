import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { SocialLink } from '../../types';
import { Plus, Edit, Trash2, Loader2, AlertCircle, Save, Link, ListOrdered, Globe } from 'lucide-react';
import SocialIconUpload from './SocialIconUpload'; // Caminho corrigido

interface LinkFormProps {
  link: Partial<SocialLink> | null;
  onSave: () => void;
  onCancel: () => void;
}

const LinkForm: React.FC<LinkFormProps> = ({ link, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<SocialLink>>(link || { is_active: true, sort_order: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isEditing = !!link?.id;

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

    const handleIconUpload = (iconUrl: string) => {
        setFormData(prev => ({ ...prev, icon_url: iconUrl }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.url) {
            setError('Nome e URL são obrigatórios.');
            return;
        }
        setIsLoading(true);
        setError(null);

        const payload = {
            id: formData.id,
            name: formData.name,
            url: formData.url,
            icon_url: formData.icon_url || null,
            is_active: formData.is_active,
            sort_order: formData.sort_order || 0,
        };

        const { error: upsertError } = await supabase
            .from('social_links')
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{isEditing ? 'Editar Link Social' : 'Adicionar Novo Link Social'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Nome da Rede Social</label>
                        <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" required />
                    </div>
                    <div>
                        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1"><Link size={16} /> URL Completa</label>
                        <input type="url" name="url" value={formData.url || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" placeholder="https://instagram.com/sua_loja" required />
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
                
                <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ícone/Logo (Opcional)</label>
                    <SocialIconUpload onIconUpload={handleIconUpload} currentIconUrl={formData.icon_url} />
                    <p className="text-xs text-gray-500 mt-2">Se não for fornecido, será usado um ícone padrão (se disponível).</p>
                </div>

                {error && <div className="flex items-center gap-2 text-red-700 bg-red-100 p-3 rounded-md mt-6"><AlertCircle size={20} /> {error}</div>}
                
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 mt-6">
                    <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
                    <button type="submit" disabled={isLoading} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 disabled:bg-red-300">
                        {isLoading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                        Salvar Link
                    </button>
                </div>
            </form>
        </div>
    );
};

const SocialLinksManagementPage: React.FC = () => {
    const [links, setLinks] = useState<SocialLink[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingLink, setEditingLink] = useState<Partial<SocialLink> | null>(null);

    const fetchLinks = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('social_links')
            .select('*')
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching social links:', error);
        } else {
            setLinks(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchLinks();
    }, []);

    const handleAddNew = () => {
        setEditingLink({});
        setShowForm(true);
    };

    const handleEdit = (link: SocialLink) => {
        setEditingLink(link);
        setShowForm(true);
    };

    const handleDelete = async (linkId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este link social?')) {
            const { error } = await supabase.from('social_links').delete().eq('id', linkId);
            if (error) {
                alert(`Erro ao excluir: ${error.message}`);
            } else {
                fetchLinks();
            }
        }
    };

    const handleSave = () => {
        setShowForm(false);
        setEditingLink(null);
        fetchLinks();
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingLink(null);
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Gerenciar Redes Sociais</h2>
                {!showForm && (
                    <button onClick={handleAddNew} className="flex items-center gap-2 bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
                        <Plus size={20} />
                        Adicionar Link
                    </button>
                )}
            </div>

            {showForm && <LinkForm link={editingLink} onSave={handleSave} onCancel={handleCancel} />}

            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center p-8"><Loader2 className="animate-spin mx-auto" /></div>
                ) : links.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nenhum link social cadastrado.</p>
                ) : (
                    links.map(link => (
                        <div key={link.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-4 flex-grow min-w-0">
                                {link.icon_url ? (
                                    <img src={link.icon_url} alt={`${link.name} icon`} className="w-8 h-8 object-contain flex-shrink-0" />
                                ) : (
                                    <Globe size={24} className="text-gray-500 flex-shrink-0" />
                                )}
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-900 truncate">{link.name}</p>
                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-red-500 hover:underline truncate max-w-xs block">{link.url}</a>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${link.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} hidden sm:inline`}>
                                    {link.is_active ? 'Ativo' : 'Inativo'}
                                </span>
                                <span className="text-xs text-gray-500 hidden sm:inline">Ordem: {link.sort_order}</span>
                                <button onClick={() => handleEdit(link)} className="text-red-500 hover:text-red-600 p-1"><Edit size={18} /></button>
                                <button onClick={() => handleDelete(link.id)} className="text-red-500 hover:text-red-600 p-1"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SocialLinksManagementPage;