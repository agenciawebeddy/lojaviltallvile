import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Loader2, AlertCircle, ChevronDown, ChevronUp, Edit, Save, Gift, History } from 'lucide-react';
import { Profile, CashbackLog } from '../../types';
import PageHeader from './PageHeader'; // Importando PageHeader

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  order_items: {
    quantity: number;
    price: number;
    product_details: {
      name: string;
      imageUrl: string;
    };
  }[];
}

const UserDashboardPage = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [cashbackLogs, setCashbackLogs] = useState<CashbackLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [formData, setFormData] = useState({ full_name: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);

            if (session?.user) {
                await fetchProfile(session.user.id);
                await fetchOrders(session.user.id);
                await fetchCashbackLogs(session.user.id);
            }
            setIsLoading(false);
        };

        fetchInitialData();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
                if (session?.user) {
                    setIsLoading(true);
                    await fetchProfile(session.user.id);
                    await fetchOrders(session.user.id);
                    await fetchCashbackLogs(session.user.id);
                    setIsLoading(false);
                }
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            setError('Não foi possível carregar os dados do perfil.');
        } else if (data) {
            setProfile(data);
            setFormData({ full_name: data.full_name || '' });
        }
    };

    const fetchOrders = async (userId: string) => {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                id,
                created_at,
                total_amount,
                status,
                order_items (
                    quantity,
                    price,
                    product_details
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            setError('Não foi possível carregar o histórico de pedidos.');
        } else {
            setOrders(data as Order[]);
        }
    };
    
    const fetchCashbackLogs = async (userId: string) => {
        const { data, error } = await supabase
            .from('cashback_logs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching cashback logs:', error);
        } else {
            setCashbackLogs(data as CashbackLog[]);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);

        if (session?.user) {
            const { error } = await supabase
                .from('profiles')
                .update({ full_name: formData.full_name, updated_at: new Date().toISOString() })
                .eq('id', session.user.id);

            if (error) {
                setError(error.message);
            } else {
                await fetchProfile(session.user.id);
                setSuccessMessage('Perfil atualizado com sucesso!');
                setIsEditingProfile(false);
                setTimeout(() => setSuccessMessage(null), 3000);
            }
        }
        setIsSaving(false);
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
        return <div className="flex justify-center items-center p-8 h-screen"><Loader2 className="animate-spin" size={32} /></div>;
    }

    if (!session) {
        return <div className="text-center p-8">Por favor, faça login para ver seu painel.</div>;
    }

    return (
        <>
            <PageHeader 
                title="Meu Painel"
                description={`Bem-vindo(a), ${profile?.full_name || session.user.email}. Gerencie seus pedidos e cashback.`}
                imageUrl="https://picsum.photos/seed/userdashboard/1920/300"
            />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12"> {/* Removendo pt-header-safe daqui */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Meu Perfil</h2>
                            {profile && !isEditingProfile && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-gray-500">Nome Completo</label>
                                        <p className="text-lg text-gray-900">{profile.full_name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Email</label>
                                        <p className="text-lg text-gray-900">{session.user.email}</p>
                                    </div>
                                    <button onClick={() => setIsEditingProfile(true)} className="mt-4 w-full flex items-center justify-center gap-2 bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
                                        <Edit size={18} /> Editar Perfil
                                    </button>
                                </div>
                            )}
                            {isEditingProfile && (
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div>
                                        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                                        <input type="text" name="full_name" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                        <input type="email" value={session.user.email || ''} className="w-full bg-gray-100 border border-gray-300 rounded-md text-gray-500 p-2" disabled />
                                    </div>
                                    {error && <div className="flex items-center gap-2 text-red-700 bg-red-100 p-3 rounded-md"><AlertCircle size={20} /> {error}</div>}
                                    {successMessage && <div className="text-green-700">{successMessage}</div>}
                                    <div className="flex justify-end gap-4 mt-4">
                                        <button type="button" onClick={() => setIsEditingProfile(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
                                        <button type="submit" disabled={isSaving} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 disabled:bg-red-300">
                                            {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                                            Salvar
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3 mb-4">
                                <Gift className="text-red-500" size={24} />
                                <h2 className="text-2xl font-bold text-gray-900">Meu Cashback</h2>
                            </div>
                            <p className="text-sm text-gray-600">Seu saldo disponível para usar em futuras compras.</p>
                            <p className="text-4xl font-extrabold text-green-600 my-4">{formatPrice(profile?.saldo_cashback || 0)}</p>
                            <div className="mt-6">
                                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><History size={18} /> Histórico</h3>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                    {cashbackLogs.length > 0 ? cashbackLogs.map(log => (
                                        <div key={log.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded-md">
                                            <div>
                                                <p className={`font-semibold ${log.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {log.type === 'credit' ? '+ ' : '- '}
                                                    {formatPrice(log.amount)}
                                                </p>
                                                <p className="text-xs text-gray-500">{log.description}</p>
                                            </div>
                                            <p className="text-xs text-gray-400">{formatDate(log.created_at)}</p>
                                        </div>
                                    )) : <p className="text-sm text-gray-500">Nenhuma transação.</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Meus Pedidos</h2>
                            <div className="space-y-4">
                                {orders.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">Você ainda não fez nenhum pedido.</p>
                                ) : (
                                    orders.map(order => (
                                        <div key={order.id} className="bg-white rounded-lg border border-gray-200">
                                            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleOrderDetails(order.id)}>
                                                <div>
                                                    <p className="font-bold text-gray-900">Pedido #{order.id.substring(0, 8)}</p>
                                                    <p className="text-sm text-gray-600">Feito em {formatDate(order.created_at)}</p>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusClass(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                    <p className="text-lg font-bold text-gray-900">{formatPrice(order.total_amount)}</p>
                                                    {expandedOrderId === order.id ? <ChevronUp /> : <ChevronDown />}
                                                </div>
                                            </div>
                                            {expandedOrderId === order.id && (
                                                <div className="border-t border-gray-200 p-4">
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
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserDashboardPage;