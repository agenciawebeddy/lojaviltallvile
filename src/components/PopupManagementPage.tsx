import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Loader2, AlertCircle, Save, Plus, Edit, Trash2 } from 'lucide-react';
import ImageUpload from './ImageUpload';

interface Popup {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  button_text?: string;
  button_link?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PopupFormProps {
  popup: Partial<Popup> | null;
  onSave: () => void;
  onCancel: () => void;
}

const PopupForm: React.FC<PopupFormProps> = ({ popup, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Popup>>(popup || { is_active: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!popup?.id;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    if (!formData.title) {
      setError('O título do pop-up é obrigatório.');
      return;
    }
    setIsLoading(true);
    setError(null);

    const payload = {
      id: formData.id,
      title: formData.title,
      description: formData.description || null,
      image_url: formData.image_url || null,
      button_text: formData.button_text || null,
      button_link: formData.button_link || null,
      is_active: formData.is_active,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from('popups')
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{isEditing ? 'Editar Pop-up' : 'Criar Novo Pop-up'}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Título do Pop-up</label>
          <input type="text" name="title" value={formData.title || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" required />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
          <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500"></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Imagem de Fundo (Opcional)</label>
          <ImageUpload onImageUpload={handleImageUpload} currentImageUrl={formData.image_url} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="button_text" className="block text-sm font-medium text-gray-700 mb-2">Texto do Botão (Opcional)</label>
            <input type="text" name="button_text" value={formData.button_text || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" />
          </div>
          <div>
            <label htmlFor="button_link" className="block text-sm font-medium text-gray-700 mb-2">Link do Botão (Opcional)</label>
            <input type="text" name="button_link" value={formData.button_link || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" placeholder="Ex: shop ou /categorias" />
          </div>
        </div>
        <div className="flex items-center pt-4">
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

        {error && <div className="flex items-center gap-2 text-red-700 bg-red-100 p-3 rounded-md mt-6"><AlertCircle size={20} /> {error}</div>}

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 mt-6">
          <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
          <button type="submit" disabled={isLoading} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 disabled:bg-red-300">
            {isLoading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
            Salvar Pop-up
          </button>
        </div>
      </form>
    </div>
  );
};

const PopupManagementPage: React.FC = () => {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPopup, setEditingPopup] = useState<Partial<Popup> | null>(null);

  const fetchPopups = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('popups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching popups:', error);
    } else {
      setPopups(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPopups();
  }, []);

  const handleAddNew = () => {
    setEditingPopup(null); // Garante que é um novo pop-up
    setShowForm(true);
  };

  const handleEdit = (popup: Popup) => {
    setEditingPopup(popup);
    setShowForm(true);
  };

  const handleDelete = async (popupId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este pop-up?')) {
      const { error } = await supabase.from('popups').delete().eq('id', popupId);
      if (error) {
        alert(`Erro ao excluir: ${error.message}`);
      } else {
        fetchPopups();
      }
    }
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingPopup(null);
    fetchPopups();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPopup(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Pop-ups</h2>
        {!showForm && (
          <button onClick={handleAddNew} className="flex items-center gap-2 bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
            <Plus size={20} />
            Novo Pop-up
          </button>
        )}
      </div>

      {showForm && <PopupForm popup={editingPopup} onSave={handleSave} onCancel={handleCancel} />}

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center p-8"><Loader2 className="animate-spin mx-auto" /></div>
        ) : popups.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum pop-up cadastrado.</p>
        ) : (
          popups.map(popup => (
            <div key={popup.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-4 flex-grow min-w-0">
                {popup.image_url && <img src={popup.image_url} alt={popup.title} className="w-16 h-10 object-cover rounded-md flex-shrink-0" />}
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{popup.title}</p>
                  <p className="text-sm text-gray-500 truncate">{popup.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${popup.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} hidden sm:inline`}>
                  {popup.is_active ? 'Ativo' : 'Inativo'}
                </span>
                <button onClick={() => handleEdit(popup)} className="text-red-500 hover:text-red-600 p-1"><Edit size={18} /></button>
                <button onClick={() => handleDelete(popup.id)} className="text-red-500 hover:text-red-600 p-1"><Trash2 size={18} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PopupManagementPage;