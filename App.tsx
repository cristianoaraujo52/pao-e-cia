
import React, { useState, useEffect, useCallback } from 'react';
import { Page, Product, CartItem, User, Notification, Order } from './types';
import { MOCK_PRODUCTS } from './constants';
import { loadProducts, saveProducts, addOrder as addLocalOrder } from './services/storage';
import {
  isSupabaseConfigured,
  fetchProducts as fetchSupabaseProducts,
  createProduct as createSupabaseProduct,
  updateProduct as updateSupabaseProduct,
  deleteProduct as deleteSupabaseProduct,
  createOrder as createSupabaseOrder
} from './services/supabase';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import Tracking from './pages/Tracking';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Reports from './pages/Reports';
import Chat from './pages/Chat';
import NotificationToast from './components/NotificationToast';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);

  // Initialize state from local storage to prevent overwriting on mount
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem('cart');
    try {
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [lastOrder, setLastOrder] = useState<Order | null>(() => {
    const stored = localStorage.getItem('lastOrder');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load products data
  useEffect(() => {
    loadProductsData();
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Save user to local storage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Save lastOrder to local storage whenever it changes
  useEffect(() => {
    if (lastOrder) {
      localStorage.setItem('lastOrder', JSON.stringify(lastOrder));
    } else {
      localStorage.removeItem('lastOrder');
    }
  }, [lastOrder]);

  const loadProductsData = async () => {
    setIsLoading(true);

    if (isSupabaseConfigured()) {
      // Load from Supabase
      const supabaseProducts = await fetchSupabaseProducts();
      if (supabaseProducts.length > 0) {
        setProducts(supabaseProducts);
      } else {
        // Initialize with mock products if empty
        setProducts(MOCK_PRODUCTS);
        // Save to Supabase
        for (const product of MOCK_PRODUCTS) {
          await createSupabaseProduct(product);
        }
      }
    } else {
      // Load from LocalStorage
      const stored = loadProducts();
      if (stored && stored.length > 0) {
        setProducts(stored);
      } else {
        setProducts(MOCK_PRODUCTS);
        saveProducts(MOCK_PRODUCTS);
      }
    }

    setIsLoading(false);
  };

  const addNotification = useCallback((message: string, type: Notification['type'] = 'info') => {
    const id = crypto.randomUUID();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  const handleAddProduct = async (product: Product) => {
    if (isSupabaseConfigured()) {
      const created = await createSupabaseProduct(product);
      if (created) {
        setProducts(prev => [created, ...prev]);
        addNotification(`Produto "${product.name}" adicionado!`, 'success');
      } else {
        addNotification('Erro ao adicionar produto', 'error');
      }
    } else {
      const updated = [...products, product];
      setProducts(updated);
      saveProducts(updated);
      addNotification(`Produto "${product.name}" adicionado!`, 'success');
    }
  };

  const handleUpdateProduct = async (product: Product) => {
    if (isSupabaseConfigured()) {
      const success = await updateSupabaseProduct(product);
      if (success) {
        setProducts(prev => prev.map(p => p.id === product.id ? product : p));
        addNotification(`Produto "${product.name}" atualizado!`, 'success');
      } else {
        addNotification('Erro ao atualizar produto', 'error');
      }
    } else {
      const updated = products.map(p => p.id === product.id ? product : p);
      setProducts(updated);
      saveProducts(updated);
      addNotification(`Produto "${product.name}" atualizado!`, 'success');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const product = products.find(p => p.id === productId);

    if (isSupabaseConfigured()) {
      const success = await deleteSupabaseProduct(productId);
      if (success) {
        setProducts(prev => prev.filter(p => p.id !== productId));
        addNotification(`Produto "${product?.name}" removido.`, 'warning');
      } else {
        addNotification('Erro ao remover produto', 'error');
      }
    } else {
      const updated = products.filter(p => p.id !== productId);
      setProducts(updated);
      saveProducts(updated);
      addNotification(`Produto "${product?.name}" removido.`, 'warning');
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    addNotification(`"${product.name}" adicionado ao carrinho!`, 'success');
  };

  const handleLogin = (email: string, isAdmin: boolean = false, userData?: { name?: string; block?: string; apartment?: string; id?: string }) => {
    const newUser: User = {
      id: userData?.id || crypto.randomUUID(), // Prefer real DB ID
      name: userData?.name || (isAdmin ? 'Administrador' : 'Morador Bourgogne'),
      email,
      block: userData?.block,
      apartment: userData?.apartment,
      isAuthenticated: true,
      isAdmin
    };
    setUser(newUser);
    setCurrentPage(Page.HOME);
    addNotification(`Bem-vindo, ${newUser.name}!`, 'success');
  };

  const handleRegisterSuccess = (name: string, block: string, apartment: string, id?: string) => {
    handleLogin(`${block}-${apartment}@bourgogne.com`, false, { name, block, apartment, id });
    addNotification('Conta criada com sucesso!', 'success');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage(Page.HOME);
    addNotification('Você saiu da sua conta.', 'info');
  };

  const handleOrderComplete = async (order: Order) => {
    if (isSupabaseConfigured()) {
      const created = await createSupabaseOrder(order);
      if (created) {
        setLastOrder(created);
        addNotification('Pedido realizado com sucesso!', 'success');
      } else {
        addNotification('Erro ao criar pedido, salvando localmente...', 'warning');
        addLocalOrder(order);
        setLastOrder(order);
      }
    } else {
      addLocalOrder(order);
      setLastOrder(order);
      addNotification('Pedido realizado com sucesso!', 'success');
    }

    setCart([]);
    setCurrentPage(Page.TRACKING);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    addNotification('Item removido do carrinho.', 'info');
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const renderPage = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-warm-accent font-medium">Carregando...</p>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case Page.HOME:
        return (
          <Home
            products={filteredProducts}
            onAddToCart={addToCart}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        );
      case Page.LOGIN:
        return <Login onLogin={handleLogin} onNavigate={setCurrentPage} />;
      case Page.REGISTER:
        return <Register onNavigate={setCurrentPage} onRegisterSuccess={handleRegisterSuccess} />;
      case Page.CHECKOUT:
        return (
          <Checkout
            cart={cart}
            user={user}
            onComplete={handleOrderComplete}
            onNavigate={setCurrentPage}
            onRemoveItem={removeFromCart}
            onUpdateQuantity={updateQuantity}
          />
        );
      case Page.TRACKING:
        return <Tracking order={lastOrder} onFinish={() => setCurrentPage(Page.HOME)} onNavigate={setCurrentPage} />;
      case Page.PROFILE:
        return <Profile user={user} onLogout={handleLogout} onNavigate={setCurrentPage} />;
      case Page.ADMIN:
        return (
          <Admin
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onNavigate={setCurrentPage}
          />
        );
      case Page.REPORTS:
        return <Reports onNavigate={setCurrentPage} />;
      case Page.CHAT:
        return <Chat user={user} onNavigate={setCurrentPage} />;
      default:
        return <Home products={filteredProducts} onAddToCart={addToCart} searchQuery={searchQuery} setSearchQuery={setSearchQuery} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <Navbar
        cartCount={cart.reduce((acc, curr) => acc + curr.quantity, 0)}
        onNavigate={setCurrentPage}
        user={user}
        currentPage={currentPage}
      />

      <main className="flex-grow">
        {renderPage()}
      </main>

      <div className="fixed bottom-20 md:bottom-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map(n => (
          <NotificationToast key={n.id} notification={n} />
        ))}
      </div>

      <BottomNav
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        cartCount={cart.reduce((acc, curr) => acc + curr.quantity, 0)}
        isAdmin={user?.isAdmin}
      />
    </div>
  );
};

export default App;
