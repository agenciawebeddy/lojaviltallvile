import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Loader2, AlertCircle } from 'lucide-react';

interface ShippingService {
  id: number;
  name: string;
  service_id: number;
  is_active: boolean;
}

const ShippingSettingsPage = () => {
  const [services, setServices] = useState<ShippingService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('shipping_services')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching shipping services:', error);
        setError('Não foi possível carregar os serviços de frete.');
      } else {
        setServices(data || []);
      }
      setIsLoading(false);
    };

    fetchServices();
  }, []);

  const handleToggle = async (serviceId: number, currentStatus: boolean) => {
    const originalServices = [...services];
    // Optimistic UI update
    setServices(prev => prev.map(s => s.id === serviceId ? { ...s, is_active: !currentStatus } : s));

    const { error } = await supabase
      .from('shipping_services')
      .update({ is_active: !currentStatus })
      .eq('id', serviceId);

    if (error) {
      setError(`Erro ao atualizar: ${error.message}`);
      // Revert UI on error
      setServices(originalServices);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin" size={32} /></div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Gerenciar Serviços de Frete</h2>
      <p className="text-gray-600 mb-6">Ative ou desative as opções de frete que serão oferecidas aos seus clientes no checkout.</p>
      
      {error && <div className="flex items-center gap-2 text-red-700 bg-red-100 p-3 rounded-md mb-4"><AlertCircle size={20} /> {error}</div>}

      <div className="space-y-4">
        {services.map(service => (
          <div key={service.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
            <span className="font-medium text-gray-900">{service.name}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={service.is_active}
                onChange={() => handleToggle(service.id, service.is_active)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-pink-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShippingSettingsPage;