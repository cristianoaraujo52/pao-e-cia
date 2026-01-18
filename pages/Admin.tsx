
import React, { useState, useEffect } from 'react';
import { Product, Page, Order } from '../types';
import ProductModal from '../components/ProductModal';
import { generateId, loadOrders } from '../services/storage';
import { isSupabaseConfigured, fetchOrders as fetchSupabaseOrders, subscribeToOrders } from '../services/supabase';

interface AdminProps {
    products: Product[];
    onAddProduct: (product: Product) => void;
    onUpdateProduct: (product: Product) => void;
    onDeleteProduct: (productId: string) => void;
    onNavigate: (page: Page) => void;
}

const Admin: React.FC<AdminProps> = ({
    products,
    onAddProduct,
    onUpdateProduct,
    onDeleteProduct,
    onNavigate
}) => {
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
    const [orders, setOrders] = useState<Order[]>([]);
    const [newOrderAlert, setNewOrderAlert] = useState<Order | null>(null);

    useEffect(() => {
        loadOrdersData();

        // Subscribe to realtime orders if Supabase is configured
        if (isSupabaseConfigured()) {
            const subscription = subscribeToOrders((newOrder) => {
                setOrders(prev => [newOrder, ...prev]);
                setNewOrderAlert(newOrder);
                // Play notification sound (optional)
                try {
                    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleRYIN3+/y9V9OxoYY6jI03kwAABWqL3Sd0EWH2OjuNRnJQYfZJ+3zV8lChxmnLLLWiMOH2Oatc5bIwwcYJmyz1wmDx1dmq/QWR8NHV6ZsNJZHwsaXZmt01gcCxpdmq7UWBsKGlyZrtVXGgoZXJmu1lYaCxlcmazXVhoLGVyZrdhWGQsZXJms2VYZCxlcmazaVRkLGFyZrNtVGAwYXJmt3FQYDBhcmK3dUxgMGFuYrd5TGAwYW5is31IYDBhbmazgURcMGFuYrOFRFwwYW5es4VAXDRhbl6vkTxcNGFuXq+RPFw0YXJer5U4XDRhcl6vnThcNGFyXq+hMGAwYXJer6UwYDBdcl6vpShgMFlyXq+lKFwwWXJer6UoXDBZcl6voSxcMFVyXq+hMFwwVXJar6EwXDBVclqvoTBcNFVuXq+dNFwwVW5er500XDBVbl6vnThcMFVuXq+dOFwwVW5er504XDBRcF6vmzxcMFFwXq+bPFwwUXBer5s8XDBRcF6vmzxcMFFwXq+XPFwwUXBer5c8');
                    audio.volume = 0.3;
                    audio.play();
                } catch (e) { }
                setTimeout(() => setNewOrderAlert(null), 5000);
            });

            return () => {
                subscription?.unsubscribe();
            };
        }
    }, []);

    const loadOrdersData = async () => {
        if (isSupabaseConfigured()) {
            const data = await fetchSupabaseOrders();
            setOrders(data);
        } else {
            setOrders(loadOrders());
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSave = (productData: Omit<Product, 'id'> & { id?: string }) => {
        if (productData.id) {
            onUpdateProduct(productData as Product);
        } else {
            const newProduct: Product = { ...productData, id: generateId() } as Product;
            onAddProduct(newProduct);
        }
        setShowModal(false);
        setEditingProduct(null);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setShowModal(true);
    };

    const handleDelete = (productId: string) => {
        onDeleteProduct(productId);
        setDeleteConfirm(null);
    };

    const handleAddNew = () => {
        setEditingProduct(null);
        setShowModal(true);
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

    const todayOrders = orders.filter(o => {
        const today = new Date().toISOString().split('T')[0];
        return o.createdAt.split('T')[0] === today;
    });

    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);

    return (
        <div className="max-w-[480px] mx-auto animate-fadeIn min-h-screen bg-background-light dark:bg-background-dark pb-24">
            {/* New Order Alert */}
            {newOrderAlert && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 animate-slideUp max-w-[400px]">
                    <span className="material-symbols-outlined text-2xl animate-pulse">notifications_active</span>
                    <div>
                        <p className="font-bold">🔔 Novo Pedido!</p>
                        <p className="text-sm opacity-90">Bloco {newOrderAlert.deliveryAddress.block}, Apt {newOrderAlert.deliveryAddress.apartment}</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="sticky top-0 z-40 bg-primary p-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => onNavigate(Page.HOME)}
                        className="size-10 bg-white/20 rounded-xl flex items-center justify-center text-white"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="text-center">
                        <h1 className="text-white text-lg font-extrabold">Painel Admin</h1>
                        <p className="text-white/70 text-xs">Gerenciar produtos e pedidos</p>
                    </div>
                    <button
                        onClick={() => onNavigate(Page.REPORTS)}
                        className="size-10 bg-white/20 rounded-xl flex items-center justify-center text-white"
                    >
                        <span className="material-symbols-outlined">bar_chart</span>
                    </button>
                </div>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 p-4 -mt-2">
                <div className="bg-white dark:bg-[#383330] rounded-xl p-3 shadow-sm text-center">
                    <p className="text-2xl font-extrabold text-primary">{products.length}</p>
                    <p className="text-[10px] font-bold text-warm-accent uppercase">Produtos</p>
                </div>
                <div className="bg-white dark:bg-[#383330] rounded-xl p-3 shadow-sm text-center">
                    <p className="text-2xl font-extrabold text-blue-500">{todayOrders.length}</p>
                    <p className="text-[10px] font-bold text-warm-accent uppercase">Pedidos Hoje</p>
                </div>
                <div className="bg-white dark:bg-[#383330] rounded-xl p-3 shadow-sm text-center">
                    <p className="text-lg font-extrabold text-green-500">R$ {todayRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</p>
                    <p className="text-[10px] font-bold text-warm-accent uppercase">Vendas Hoje</p>
                </div>
            </div>

            {/* Connection Status */}
            <div className={`mx-4 mb-4 p-2 rounded-lg flex items-center gap-2 text-xs ${isSupabaseConfigured() ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                <span className="material-symbols-outlined text-sm">{isSupabaseConfigured() ? 'cloud_done' : 'cloud_off'}</span>
                <span className="font-bold">
                    {isSupabaseConfigured() ? 'Online (Supabase)' : 'Offline (LocalStorage)'}
                </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 px-4 mb-4">
                <button
                    onClick={() => setActiveTab('products')}
                    className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'products'
                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                            : 'bg-white dark:bg-[#383330] text-warm-accent'
                        }`}
                >
                    <span className="material-symbols-outlined text-sm align-middle mr-1">inventory_2</span>
                    Produtos
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all relative ${activeTab === 'orders'
                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                            : 'bg-white dark:bg-[#383330] text-warm-accent'
                        }`}
                >
                    <span className="material-symbols-outlined text-sm align-middle mr-1">receipt_long</span>
                    Pedidos
                    {orders.filter(o => o.status === 'pending').length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                            {orders.filter(o => o.status === 'pending').length}
                        </span>
                    )}
                </button>
            </div>

            {/* Products Tab */}
            {activeTab === 'products' && (
                <>
                    {/* Search and Add */}
                    <div className="px-4 flex gap-3 mb-4">
                        <div className="flex-1 relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-warm-accent">search</span>
                            <input
                                type="text"
                                placeholder="Buscar produtos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-12 pl-10 pr-4 rounded-xl bg-white dark:bg-[#383330] border border-warm-accent/20 focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <button
                            onClick={handleAddNew}
                            className="h-12 px-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">add</span>
                        </button>
                    </div>

                    {/* Products List */}
                    <div className="px-4 space-y-3 pb-8">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="flex items-center gap-3 bg-white dark:bg-[#383330] p-3 rounded-xl shadow-sm">
                                <div
                                    className="size-14 rounded-lg bg-cover bg-center shrink-0"
                                    style={{ backgroundImage: `url(${product.image})` }}
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-[#1d180c] dark:text-white truncate text-sm">{product.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-primary font-extrabold">
                                            R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                            {product.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="size-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center"
                                    >
                                        <span className="material-symbols-outlined text-xl">edit</span>
                                    </button>
                                    {deleteConfirm === product.id ? (
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="size-10 bg-red-500 text-white rounded-lg flex items-center justify-center"
                                            >
                                                <span className="material-symbols-outlined text-xl">check</span>
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(null)}
                                                className="size-10 bg-gray-200 text-gray-600 rounded-lg flex items-center justify-center"
                                            >
                                                <span className="material-symbols-outlined text-xl">close</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setDeleteConfirm(product.id)}
                                            className="size-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center"
                                        >
                                            <span className="material-symbols-outlined text-xl">delete</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {filteredProducts.length === 0 && (
                            <div className="text-center py-12 bg-white dark:bg-[#383330] rounded-2xl">
                                <span className="material-symbols-outlined text-5xl text-warm-accent/40 mb-4">inventory_2</span>
                                <p className="font-bold text-[#1d180c] dark:text-white mb-2">Nenhum produto</p>
                                <button onClick={handleAddNew} className="bg-primary text-white px-6 py-3 rounded-xl font-bold mt-2">
                                    Adicionar Produto
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
                <div className="px-4 space-y-3 pb-8">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="font-bold text-[#1d180c] dark:text-white">Pedidos ({orders.length})</h2>
                        <button
                            onClick={loadOrdersData}
                            className="text-primary text-sm font-bold flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-sm">refresh</span>
                            Atualizar
                        </button>
                    </div>

                    {orders.length > 0 ? (
                        orders.map(order => (
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
                                <div className="text-sm text-warm-accent mb-2">
                                    {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-warm-accent/20">
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">
                                        {order.paymentMethod === 'pix' ? 'Pix' : order.paymentMethod === 'card' ? 'Cartão' : order.paymentMethod === 'cash' ? 'Dinheiro' : 'Fiado'}
                                    </span>
                                    <span className="font-extrabold text-primary">R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white dark:bg-[#383330] rounded-2xl">
                            <span className="material-symbols-outlined text-5xl text-warm-accent/40 mb-4">inbox</span>
                            <p className="font-bold text-[#1d180c] dark:text-white">Nenhum pedido ainda</p>
                        </div>
                    )}
                </div>
            )}

            {/* Product Modal */}
            <ProductModal
                isOpen={showModal}
                product={editingProduct}
                onSave={handleSave}
                onClose={() => { setShowModal(false); setEditingProduct(null); }}
            />
        </div>
    );
};

export default Admin;
