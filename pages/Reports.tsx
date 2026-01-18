
import React, { useState, useEffect } from 'react';
import { Order, Page } from '../types';
import { fetchOrders, isSupabaseConfigured, subscribeToOrders } from '../services/supabase';
import { loadOrders } from '../services/storage';

interface ReportsProps {
    onNavigate: (page: Page) => void;
}

const Reports: React.FC<ReportsProps> = ({ onNavigate }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
    const [newOrderAlert, setNewOrderAlert] = useState<Order | null>(null);

    useEffect(() => {
        loadData();

        // Subscribe to realtime orders
        if (isSupabaseConfigured()) {
            const subscription = subscribeToOrders((newOrder) => {
                setOrders(prev => [newOrder, ...prev]);
                setNewOrderAlert(newOrder);
                setTimeout(() => setNewOrderAlert(null), 5000);
            });

            return () => {
                subscription?.unsubscribe();
            };
        }
    }, []);

    const loadData = async () => {
        setLoading(true);
        if (isSupabaseConfigured()) {
            const data = await fetchOrders();
            setOrders(data);
        } else {
            const localOrders = loadOrders();
            setOrders(localOrders);
        }
        setLoading(false);
    };

    const filterOrdersByPeriod = () => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        return orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            const orderDay = orderDate.toISOString().split('T')[0];

            if (selectedPeriod === 'today') {
                return orderDay === today;
            } else if (selectedPeriod === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return orderDate >= weekAgo;
            } else {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return orderDate >= monthAgo;
            }
        });
    };

    const filteredOrders = filterOrdersByPeriod();
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = filteredOrders.length;
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Payment breakdown
    const paymentBreakdown = filteredOrders.reduce((acc, o) => {
        acc[o.paymentMethod] = (acc[o.paymentMethod] || 0) + o.total;
        return acc;
    }, {} as Record<string, number>);

    // Top products
    const productCount: Record<string, { quantity: number; revenue: number }> = {};
    filteredOrders.forEach(o => {
        o.items.forEach(item => {
            if (!productCount[item.name]) {
                productCount[item.name] = { quantity: 0, revenue: 0 };
            }
            productCount[item.name].quantity += item.quantity;
            productCount[item.name].revenue += item.price * item.quantity;
        });
    });
    const topProducts = Object.entries(productCount)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

    const getPaymentLabel = (method: string) => {
        const labels: Record<string, string> = {
            pix: 'Pix',
            card: 'Cartão',
            cash: 'Dinheiro',
            monthly: 'Fiado',
        };
        return labels[method] || method;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'preparing': return 'bg-blue-100 text-blue-700';
            case 'delivering': return 'bg-purple-100 text-purple-700';
            case 'delivered': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: 'Pendente',
            preparing: 'Preparando',
            delivering: 'Em Entrega',
            delivered: 'Entregue',
        };
        return labels[status] || status;
    };

    return (
        <div className="max-w-[480px] mx-auto min-h-screen bg-background-light dark:bg-background-dark pb-24">
            {/* New Order Alert */}
            {newOrderAlert && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 animate-slideUp max-w-[400px]">
                    <span className="material-symbols-outlined text-2xl">notifications_active</span>
                    <div>
                        <p className="font-bold">Novo Pedido!</p>
                        <p className="text-sm opacity-90">Bloco {newOrderAlert.deliveryAddress.block}, Apt {newOrderAlert.deliveryAddress.apartment}</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="sticky top-0 z-40 bg-primary p-4">
                <div className="flex items-center justify-between print:hidden">
                    <button
                        onClick={() => onNavigate(Page.ADMIN)}
                        className="size-10 bg-white/20 rounded-xl flex items-center justify-center text-white"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="text-center">
                        <h1 className="text-white text-lg font-extrabold">Relatórios</h1>
                        <p className="text-white/70 text-xs">Fluxo de caixa e vendas</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => window.print()}
                            className="size-10 bg-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                            title="Imprimir Relatório"
                        >
                            <span className="material-symbols-outlined">print</span>
                        </button>
                        <button
                            onClick={loadData}
                            className="size-10 bg-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                        >
                            <span className="material-symbols-outlined">refresh</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page { margin: 20mm; }
                    body { background: white !important; }
                    .print\\:hidden { display: none !important; }
                    header { background: white !important; color: black !important; position: static !important; padding: 0 !important; }
                    header h1 { color: black !important; font-size: 24px !important; }
                    header p { color: gray !important; }
                    .bg-background-light, .bg-background-dark { background: white !important; }
                    .text-white { color: black !important; }
                    .bg-white, .dark\\:bg-\\[\\#383330\\] { background: white !important; box-shadow: none !important; border: 1px solid #eee !important; }
                    .text-\\[\\#1d180c\\] { color: black !important; }
                    .animate-slideUp, .animate-fadeIn { animation: none !important; }
                    .fixed { position: absolute !important; }
                }
            `}</style>

            {/* Connection Status */}
            <div className={`mx-4 mt-4 p-3 rounded-xl flex items-center gap-2 ${isSupabaseConfigured() ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                <span className="material-symbols-outlined">{isSupabaseConfigured() ? 'cloud_done' : 'cloud_off'}</span>
                <span className="text-sm font-bold">
                    {isSupabaseConfigured() ? 'Conectado ao Supabase (online)' : 'Modo offline (LocalStorage)'}
                </span>
            </div>

            {/* Period Selector */}
            <div className="flex gap-2 p-4">
                {(['today', 'week', 'month'] as const).map(period => (
                    <button
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${selectedPeriod === period
                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                            : 'bg-white dark:bg-[#383330] text-warm-accent'
                            }`}
                    >
                        {period === 'today' ? 'Hoje' : period === 'week' ? '7 dias' : '30 dias'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-warm-accent">Carregando dados...</p>
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-3 px-4">
                        <div className="bg-white dark:bg-[#383330] rounded-xl p-3 shadow-sm text-center">
                            <span className="material-symbols-outlined text-primary text-2xl mb-1">receipt_long</span>
                            <p className="text-2xl font-extrabold text-[#1d180c] dark:text-white">{totalOrders}</p>
                            <p className="text-[10px] font-bold text-warm-accent uppercase">Pedidos</p>
                        </div>
                        <div className="bg-white dark:bg-[#383330] rounded-xl p-3 shadow-sm text-center">
                            <span className="material-symbols-outlined text-green-500 text-2xl mb-1">payments</span>
                            <p className="text-xl font-extrabold text-green-600">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</p>
                            <p className="text-[10px] font-bold text-warm-accent uppercase">Faturamento</p>
                        </div>
                        <div className="bg-white dark:bg-[#383330] rounded-xl p-3 shadow-sm text-center">
                            <span className="material-symbols-outlined text-blue-500 text-2xl mb-1">trending_up</span>
                            <p className="text-xl font-extrabold text-blue-600">R$ {averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</p>
                            <p className="text-[10px] font-bold text-warm-accent uppercase">Ticket Médio</p>
                        </div>
                    </div>

                    {/* Payment Breakdown */}
                    <div className="px-4 mt-6">
                        <h3 className="font-bold text-[#1d180c] dark:text-white mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                            Fluxo de Caixa
                        </h3>
                        <div className="bg-white dark:bg-[#383330] rounded-xl p-4 space-y-3">
                            {Object.entries(paymentBreakdown).length > 0 ? (
                                Object.entries(paymentBreakdown).map(([method, value]) => (
                                    <div key={method} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary text-sm">
                                                    {method === 'pix' ? 'qr_code_2' : method === 'card' ? 'credit_card' : method === 'cash' ? 'payments' : 'receipt_long'}
                                                </span>
                                            </div>
                                            <span className="font-medium text-[#1d180c] dark:text-white">{getPaymentLabel(method)}</span>
                                        </div>
                                        <span className="font-bold text-green-600">R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-warm-accent py-4">Nenhum dado no período</p>
                            )}
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="px-4 mt-6">
                        <h3 className="font-bold text-[#1d180c] dark:text-white mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">star</span>
                            Mais Vendidos
                        </h3>
                        <div className="bg-white dark:bg-[#383330] rounded-xl p-4 space-y-3">
                            {topProducts.length > 0 ? (
                                topProducts.map((product, idx) => (
                                    <div key={product.name} className="flex items-center gap-3">
                                        <div className={`size-8 rounded-lg flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-amber-400 text-white' :
                                            idx === 1 ? 'bg-gray-300 text-gray-700' :
                                                idx === 2 ? 'bg-amber-600 text-white' :
                                                    'bg-warm-accent/20 text-warm-accent'
                                            }`}>
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-[#1d180c] dark:text-white text-sm truncate">{product.name}</p>
                                            <p className="text-xs text-warm-accent">{product.quantity} vendidos</p>
                                        </div>
                                        <span className="font-bold text-primary text-sm">R$ {product.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-warm-accent py-4">Nenhum dado no período</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="px-4 mt-6 pb-8">
                        <h3 className="font-bold text-[#1d180c] dark:text-white mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">history</span>
                            Pedidos Recentes
                        </h3>
                        <div className="space-y-3">
                            {filteredOrders.slice(0, 10).map(order => (
                                <div key={order.id} className="bg-white dark:bg-[#383330] rounded-xl p-4 shadow-sm">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="font-bold text-[#1d180c] dark:text-white">
                                                Bloco {order.deliveryAddress.block}, Apt {order.deliveryAddress.apartment}
                                            </p>
                                            <p className="text-xs text-warm-accent">
                                                {new Date(order.createdAt).toLocaleString('pt-BR')}
                                            </p>
                                        </div>
                                        <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${getStatusColor(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-warm-accent">{order.items.length} itens</span>
                                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{getPaymentLabel(order.paymentMethod)}</span>
                                        </div>
                                        <span className="font-extrabold text-primary">R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            ))}
                            {filteredOrders.length === 0 && (
                                <div className="text-center py-8 bg-white dark:bg-[#383330] rounded-xl">
                                    <span className="material-symbols-outlined text-5xl text-warm-accent/40 mb-2">inbox</span>
                                    <p className="text-warm-accent">Nenhum pedido no período</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Reports;
