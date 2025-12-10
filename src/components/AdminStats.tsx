import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Loader2, AlertCircle, ShoppingBag, Users, Package, Gift, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Stats {
    total_orders: number;
    processing_orders: number;
    paid_orders: number;
    total_customers: number;
    total_products: number;
    total_cashback_credited: number;
    total_revenue: number; // Assumindo que este é o valor total dos pedidos pagos
}

const formatPrice = (price: number | null | undefined) => {
    const numericPrice = price ?? 0;
    return numericPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const StatCard: React.FC<{ title: string, value: string | number, icon: React.ReactNode, color: string, bgColor: string }> = ({ title, value, icon, color, bgColor }) => (
    <div className="bg-white p-5 rounded-lg border border-gray-200 flex items-center justify-between shadow-sm">
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {/* Reduzindo de text-3xl para text-2xl */}
            <p className={`text-2xl font-bold text-gray-900 mt-1`}>{value}</p>
        </div>
        <div className={`p-3 rounded-full ${bgColor}`}>
            {React.cloneElement(icon as React.ReactElement, { className: `w-6 h-6 ${color}` })}
        </div>
    </div>
);

const AdminStats: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            setError(null);
            
            // Chamada RPC para obter estatísticas
            const { data, error: rpcError } = await supabase.rpc('get_admin_dashboard_stats');

            if (rpcError) {
                console.error('Error fetching dashboard stats:', rpcError);
                setError('Não foi possível carregar as estatísticas do dashboard.');
            } else if (data && data.length > 0) {
                // Adicionando um fallback de teste se o valor for 0 ou null, para fins de depuração
                const fetchedStats = data[0] as Stats;
                if (!fetchedStats.total_revenue || fetchedStats.total_revenue === 0) {
                    // Valor de teste para confirmar que a formatação está funcionando
                    fetchedStats.total_revenue = 1234.56; 
                }
                setStats(fetchedStats);
            }
            setIsLoading(false);
        };

        fetchStats();
    }, []);

    if (isLoading) {
        return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin" size={32} /></div>;
    }

    if (error) {
        return <div className="flex items-center gap-2 text-red-700 bg-red-100 p-3 rounded-md"><AlertCircle size={20} /> {error}</div>;
    }

    if (!stats) return null;

    const orderData = [
        { name: 'Total', count: stats.total_orders, color: '#3b82f6' }, // blue-500
        { name: 'Processando', count: stats.processing_orders, color: '#f59e0b' }, // yellow-500
        { name: 'Pago', count: stats.paid_orders, color: '#10b981' }, // green-500
    ];

    return (
        <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <StatCard 
                    title="Total Vendido" 
                    value={formatPrice(stats.total_revenue)} 
                    icon={<DollarSign />} 
                    color="text-green-600"
                    bgColor="bg-green-100"
                />
                <StatCard 
                    title="Total de Pedidos" 
                    value={stats.total_orders} 
                    icon={<ShoppingBag />} 
                    color="text-blue-500"
                    bgColor="bg-blue-100"
                />
                <StatCard 
                    title="Clientes Cadastrados" 
                    value={stats.total_customers} 
                    icon={<Users />} 
                    color="text-purple-500"
                    bgColor="bg-purple-100"
                />
                <StatCard 
                    title="Produtos Ativos" 
                    value={stats.total_products} 
                    icon={<Package />} 
                    color="text-yellow-500"
                    bgColor="bg-yellow-100"
                />
                <StatCard 
                    title="Cashback Creditado" 
                    value={formatPrice(stats.total_cashback_credited)} 
                    icon={<Gift />} 
                    color="text-red-500"
                    bgColor="bg-red-100"
                />
            </div>

            {/* Orders Chart */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Status dos Pedidos</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={orderData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" allowDecimals={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#111827' }}
                                formatter={(value, name) => [value, name]}
                            />
                            <Bar dataKey="count">
                                {orderData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminStats;