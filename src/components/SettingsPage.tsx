import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Loader2, AlertCircle, Save } from 'lucide-react';
import { StoreSettings } from '../../types'; // Importando a interface global
import ImageUpload from './ImageUpload'; // Importando o componente de upload

const SettingsPage = () => {
  const [settings, setSettings] = useState<StoreSettings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('Error fetching settings:', error);
        setError('Não foi possível carregar as configurações.');
      } else {
        setSettings(data || {});
      }
      setIsLoading(false);
    };

    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Converte para número se for um campo de dimensão ou porcentagem
    const numericValue = ['cashback_percentage', 'free_shipping_threshold', 'logo_height', 'logo_width', 'global_discount_percentage'].includes(name) 
        ? (value === '' ? undefined : Number(value)) 
        : value;
        
    setSettings(prev => ({ ...prev, [name]: numericValue }));
  };

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleLogoUpload = (imageUrl: string) => {
    setSettings(prev => ({ ...prev, store_logo_url: imageUrl }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    const { error: updateError } = await supabase
      .from('store_settings')
      .update({
        store_name: settings.store_name,
        contact_email: settings.contact_email,
        origin_postal_code: settings.origin_postal_code,
        sender_name: settings.sender_name,
        sender_phone: settings.sender_phone,
        sender_document: settings.sender_document,
        sender_address: settings.sender_address,
        cashback_is_active: settings.cashback_is_active,
        cashback_percentage: settings.cashback_percentage,
        free_shipping_is_active: settings.free_shipping_is_active,
        free_shipping_threshold: settings.free_shipping_threshold,
        free_shipping_message: settings.free_shipping_message,
        store_logo_url: settings.store_logo_url,
        logo_height: settings.logo_height, // Salvando a altura
        logo_width: settings.logo_width,   // Salvando a largura
        global_discount_percentage: settings.global_discount_percentage, // NOVO CAMPO
        payment_on_delivery_active: settings.payment_on_delivery_active, // NOVO CAMPO
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);

    if (updateError) {
      setError(`Erro ao salvar: ${updateError.message}`);
    } else {
      setSuccess('Configurações salvas com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin" size={32} /></div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Configurações da Loja</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <h3 className="text-xl font-bold text-gray-900 pt-4 border-t border-gray-200">Identidade Visual</h3>
        <div>
          <label htmlFor="store_logo_url" className="block text-sm font-medium text-gray-700 mb-2">Logo da Loja</label>
          <ImageUpload onImageUpload={handleLogoUpload} currentImageUrl={settings.store_logo_url} />
          <p className="text-xs text-gray-500 mt-2">Recomendado: Imagem PNG ou SVG com fundo transparente.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="logo_height" className="block text-sm font-medium text-gray-700 mb-2">Altura da Logo (px)</label>
                <input type="number" name="logo_height" value={settings.logo_height || 40} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" />
            </div>
            <div>
                <label htmlFor="logo_width" className="block text-sm font-medium text-gray-700 mb-2">Largura da Logo (px)</label>
                <input type="number" name="logo_width" value={settings.logo_width || 150} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" />
            </div>
        </div>
        
        <div>
          <label htmlFor="store_name" className="block text-sm font-medium text-gray-700 mb-2">Nome da Loja</label>
          <input type="text" name="store_name" value={settings.store_name || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" />
        </div>
        <div>
          <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-2">E-mail de Contato</label>
          <input type="email" name="contact_email" value={settings.contact_email || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 pt-4 border-t border-gray-200">Configurações de Pagamento</h3>
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
            <span className="font-medium text-gray-900">Ativar Pagamento na Entrega (COD)</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="payment_on_delivery_active"
                checked={settings.payment_on_delivery_active || false}
                onChange={handleToggleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-red-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </label>
        </div>

        <h3 className="text-xl font-bold text-gray-900 pt-4 border-t border-gray-200">Configurações de Cashback</h3>
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
            <span className="font-medium text-gray-900">Ativar Sistema de Cashback</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="cashback_is_active"
                checked={settings.cashback_is_active || false}
                onChange={handleToggleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-red-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </label>
        </div>
        <div>
          <label htmlFor="cashback_percentage" className="block text-sm font-medium text-gray-700 mb-2">Porcentagem de Cashback (%)</label>
          <input type="number" name="cashback_percentage" step="0.01" value={settings.cashback_percentage || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" placeholder="Ex: 5.00" />
        </div>

        <h3 className="text-xl font-bold text-gray-900 pt-4 border-t border-gray-200">Configurações de Desconto Global</h3>
        <div>
          <label htmlFor="global_discount_percentage" className="block text-sm font-medium text-gray-700 mb-2">Desconto Global (%)</label>
          <input type="number" name="global_discount_percentage" step="0.01" value={settings.global_discount_percentage || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" placeholder="Ex: 10.00" />
          <p className="text-xs text-gray-500 mt-1">Este desconto será aplicado a todos os produtos que não possuem um "Preço com Desconto" definido individualmente.</p>
        </div>

        <h3 className="text-xl font-bold text-gray-900 pt-4 border-t border-gray-200">Configurações de Frete Grátis</h3>
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
            <span className="font-medium text-gray-900">Ativar Frete Grátis</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="free_shipping_is_active"
                checked={settings.free_shipping_is_active || false}
                onChange={handleToggleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-red-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </label>
        </div>
        <div>
          <label htmlFor="free_shipping_threshold" className="block text-sm font-medium text-gray-700 mb-2">Valor Mínimo para Frete Grátis (BRL)</label>
          <input type="number" name="free_shipping_threshold" step="0.01" value={settings.free_shipping_threshold || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" placeholder="Ex: 250.00" />
        </div>
        <div>
          <label htmlFor="free_shipping_message" className="block text-sm font-medium text-gray-700 mb-2">Mensagem de Frete Grátis (Use {'{threshold}'} para o valor)</label>
          <textarea name="free_shipping_message" value={settings.free_shipping_message || ''} onChange={handleChange} rows={2} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" placeholder="Ex: FRETE GRÁTIS PARA TODOS OS PEDIDOS ACIMA DE {threshold}" />
        </div>

        <h3 className="text-xl font-bold text-gray-900 pt-4 border-t border-gray-200">Informações do Remetente (para Frete)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="sender_name" className="block text-sm font-medium text-gray-700 mb-2">Nome do Remetente</label>
                <input type="text" name="sender_name" value={settings.sender_name || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" required />
            </div>
            <div>
                <label htmlFor="sender_phone" className="block text-sm font-medium text-gray-700 mb-2">Telefone do Remetente</label>
                <input type="text" name="sender_phone" value={settings.sender_phone || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" required />
            </div>
            <div>
                <label htmlFor="sender_document" className="block text-sm font-medium text-gray-700 mb-2">CPF/CNPJ do Remetente</label>
                <input type="text" name="sender_document" value={settings.sender_document || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" required />
            </div>
            <div>
                <label htmlFor="sender_address" className="block text-sm font-medium text-gray-700 mb-2">Endereço do Remetente</label>
                <input type="text" name="sender_address" value={settings.sender_address || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" placeholder="Rua, Número, Bairro" required />
            </div>
            <div className="md:col-span-2">
                <label htmlFor="origin_postal_code" className="block text-sm font-medium text-gray-700 mb-2">CEP de Origem</label>
                <input type="text" name="origin_postal_code" value={settings.origin_postal_code || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 focus:ring-red-500 focus:border-red-500" placeholder="00000-000" required />
            </div>
        </div>

        {error && <div className="flex items-center gap-2 text-red-700 bg-red-100 p-3 rounded-md"><AlertCircle size={20} /> {error}</div>}
        {success && <div className="flex items-center gap-2 text-green-700 bg-green-100 p-3 rounded-md">{success}</div>}

        <div className="flex justify-end">
          <button type="submit" disabled={isSaving} className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 disabled:bg-red-300">
            {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;