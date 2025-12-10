import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Loader2, AlertCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  shipping_address: {
    fullName: string;
    email: string;
    document?: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    postalCode: string;
  };
  order_items: {
    quantity: number;
    price: number;
    product_details: {
      name: string;
      imageUrl: string;
    };
  }[];
}

const STATUS_OPTIONS = ['Todos', 'Processando', 'Pago', 'Enviado', 'Entregue', 'Cancelado'];

const OrdersManagementPage = () => {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [updatingStatusFor, setUpdatingStatusFor] = useState<string | null>(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const fetchOrders = async () => {
    setIsLoading(true);
    // Buscamos todos os dados necessários para a exibição e filtragem
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        total_amount,
        status,
        shipping_address,
        order_items (
          quantity,
          price,
          product_details
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      setError('Não foi possível carregar os pedidos.');
    } else {
      setAllOrders(data as Order[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);
  
  const filteredOrders = useMemo(() => {
    let orders = allOrders;
    const lowerSearchTerm = searchTerm.toLowerCase().trim();

    // 1. Filtrar por Status
    if (statusFilter !== 'Todos') {
      orders = orders.filter(order => order.status === statusFilter);
    }

    // 2. Filtrar por Termo de Pesquisa (Nome do Cliente ou ID do Pedido)
    if (lowerSearchTerm) {
      orders = orders.filter(order => 
        order.shipping_address.fullName.toLowerCase().includes(lowerSearchTerm) ||
        order.id.substring(0, 8).toLowerCase().includes(lowerSearchTerm)
      );
    }

    return orders;
  }, [allOrders, statusFilter, searchTerm]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatusFor(orderId);
    setError(null);

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      setError(`Erro ao atualizar status: ${error.message}`);
      // Revert UI on error (re-fetch or manual state update)
      fetchOrders(); 
    } else {
      // Update local state to reflect the change
      setAllOrders(prevOrders =>
        prevOrders.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    }
    setUpdatingStatusFor(null);
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(prevId => (prevId === orderId ? null : orderId));
  };
  
  const formatPrice = (price: number) => price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const getStatusClass = (status: string) => {
    switch (status) {
        case 'Processando':
            return 'bg-yellow-100 text-yellow-800';
        case 'Pago':
            return 'bg-green-100 text-green-800';
        case 'Enviado':
            return 'bg-blue-100 text-blue-800';
        case 'Entregue':
            return 'bg-gray-100 text-gray-800';
        case 'Cancelado':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin" size={32} /></div>;
  }

  if (error && allOrders.length === 0) {
    return <div className="flex items-center gap-2 text-red-700 bg-red-100 p-3 rounded-md"><AlertCircle size={20} /> {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Gerenciamento de Pedidos</h2>
      <p className="text-gray-600 mb-6">{filteredOrders.length} pedidos encontrados.</p>
      
      {/* Filtros e Pesquisa */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Pesquisar por nome ou ID do pedido"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-900 focus:ring-red-500 focus:border-red-500 flex-shrink-0 w-full sm:w-auto"
        >
          {STATUS_OPTIONS.map(status => (
            <option key={status} value={status}>{status === 'Todos' ? 'Todos os Status' : status}</option>
          ))}
        </select>
      </div>

      {error && <div className="flex items-center gap-2 text-red-700 bg-red-100 p-3 rounded-md mb-4"><AlertCircle size={20} /> {error}</div>}

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum pedido encontrado com os filtros atuais.</p>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleOrderDetails(order.id)}>
                {/* Informações do Cliente e Data */}
                <div className="flex-grow min-w-0 pr-4">
                  <p className="font-bold text-gray-900 truncate">{order.shipping_address.fullName}</p>
                  <p className="text-sm text-gray-500">Pedido #{order.id.substring(0, 8)} em {formatDate(order.created_at)}</p>
                </div>
                {/* Status, Valor e Ícone */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusClass(order.status)} hidden sm:block`}>
                    {order.status}
                  </span>
                  <p className="text-lg font-bold text-gray-900 flex-shrink-0">{formatPrice(order.total_amount)}</p>
                  {expandedOrderId === order.id ? <ChevronUp className="flex-shrink-0" /> : <ChevronDown className="flex-shrink-0" />}
                </div>
              </div>
              {expandedOrderId === order.id && (
                <div className="border-t border-gray-200 p-4 flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-2/3 space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Itens do Pedido:</h4>
                      <ul className="space-y-2">
                        {order.order_items.map((item, index) => (
                          <li key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                              <img src={item.product_details.imageUrl} alt={item.product_details.name} className="w-10 h-10 rounded-md object-cover" />
                              <span>{item.product_details.name}</span>
                              <span className="text-gray-500">x {item.quantity}</span>
                            </div>
                            <span className="text-gray-700">{formatPrice(item.price * item.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-2">Status do Pedido</h4>
                      <div className="flex items-center gap-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          disabled={updatingStatusFor === order.id}
                          className="bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-900 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
                        >
                          {STATUS_OPTIONS.filter(s => s !== 'Todos').map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        {updatingStatusFor === order.id && <Loader2 className="animate-spin text-red-500" />}
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6">
                    <h4 className="font-semibold text-gray-800 mb-2">Endereço de Entrega:</h4>
                    <address className="text-sm text-gray-600 space-y-1 not-italic">
                      <p><strong>{order.shipping_address.fullName}</strong></p>
                      <p>{order.shipping_address.street}, {order.shipping_address.number}</p>
                      <p>{order.shipping_address.neighborhood}</p>
                      <p>{order.shipping_address.city} - {order.shipping_address.state}</p>
                      <p>CEP: {order.shipping_address.postalCode}</p>
                      <p className="pt-2">
                        <a href={`mailto:${order.shipping_address.email}`} className="text-red-500 hover:underline">
                          {order.shipping_address.email}
                        </a>
                      </p>
                    </address>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrdersManagementPage;