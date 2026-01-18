
import React from 'react';
import { User, Page } from '../types';

interface ProfileProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout, onNavigate }) => {
  if (!user) {
    return (
      <div className="max-w-[480px] mx-auto text-center py-20 px-4">
        <div className="bg-white dark:bg-[#383330] rounded-2xl p-8 shadow-sm">
          <span className="material-symbols-outlined text-6xl text-warm-accent/40 mb-4">waving_hand</span>
          <h2 className="text-xl font-extrabold text-[#1d180c] dark:text-white mb-2">Ops! Você não está logado</h2>
          <p className="text-warm-accent mb-6">Entre para acessar seu perfil e fazer pedidos</p>
          <button
            onClick={() => onNavigate(Page.LOGIN)}
            className="bg-primary text-white px-8 py-4 rounded-xl font-extrabold shadow-lg shadow-primary/30"
          >
            Entrar agora
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { icon: 'receipt_long', label: 'Meus Pedidos', action: () => onNavigate(Page.TRACKING) },
    { icon: 'apartment', label: 'Meu Endereço', description: 'Condomínio Bourgogne', action: () => { } },
    { icon: 'payments', label: 'Formas de Pagamento', action: () => { } },
    { icon: 'redeem', label: 'Meus Cupons', description: 'Use BOURGOGNE para 10% off', action: () => { } },
  ];

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-background-light dark:bg-background-dark pb-24">
      {/* Header */}
      <header className="flex items-center p-4 justify-between sticky top-0 z-50 bg-background-light dark:bg-background-dark">
        <div className="size-10"></div>
        <h2 className="text-lg font-extrabold text-[#1d180c] dark:text-white">Meu Perfil</h2>
        <button className="size-10 flex items-center justify-center">
          <span className="material-symbols-outlined text-warm-accent">settings</span>
        </button>
      </header>

      {/* Profile Card */}
      <div className="flex flex-col items-center px-4 py-6">
        <div className="relative mb-4">
          <div
            className="size-28 rounded-full border-4 border-primary shadow-lg bg-primary/20 flex items-center justify-center"
          >
            <span className="text-4xl font-extrabold text-primary">{user.name.charAt(0)}</span>
          </div>
          <div className="absolute bottom-1 right-1 bg-primary text-white p-1.5 rounded-full border-2 border-white">
            <span className="material-symbols-outlined text-xs">edit</span>
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-[#1d180c] dark:text-white">{user.name}</h2>
        <p className="text-warm-accent text-sm">{user.email}</p>

        <div className="flex items-center gap-2 mt-3">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">🏢 Bourgogne</span>
          {user.isAdmin && (
            <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">admin_panel_settings</span> Admin
            </span>
          )}
        </div>
      </div>

      {/* Admin Quick Access */}
      {user.isAdmin && (
        <div className="px-4 pb-4">
          <button
            onClick={() => onNavigate(Page.ADMIN)}
            className="w-full flex items-center gap-4 p-4 bg-primary/10 rounded-2xl border-2 border-primary/30 hover:bg-primary/20 transition-colors"
          >
            <div className="size-12 bg-primary rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-2xl">admin_panel_settings</span>
            </div>
            <div className="text-left flex-grow">
              <span className="font-bold text-[#1d180c] dark:text-white">Painel Administrativo</span>
              <p className="text-warm-accent text-sm">Gerenciar produtos e pedidos</p>
            </div>
            <span className="material-symbols-outlined text-primary">chevron_right</span>
          </button>
        </div>
      )}

      {/* Menu Items */}
      <div className="px-4 pt-2 pb-2">
        <h3 className="text-sm font-bold text-warm-accent uppercase tracking-wider mb-3">Configurações</h3>
      </div>
      <div className="px-4 space-y-2">
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            onClick={item.action}
            className="w-full bg-white dark:bg-[#383330] rounded-xl shadow-sm border border-warm-accent/10 p-4 flex items-center gap-4 hover:border-primary/30 transition-colors"
          >
            <div className="size-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined">{item.icon}</span>
            </div>
            <div className="flex-grow text-left">
              <p className="font-bold text-[#1d180c] dark:text-white">{item.label}</p>
              {item.description && (
                <p className="text-xs text-warm-accent">{item.description}</p>
              )}
            </div>
            <span className="material-symbols-outlined text-warm-accent/40">chevron_right</span>
          </button>
        ))}
      </div>

      {/* Order History Preview */}
      <div className="px-4 pt-6 pb-3 flex justify-between items-end">
        <h3 className="text-sm font-bold text-warm-accent uppercase tracking-wider">Último Pedido</h3>
        <button className="text-primary text-xs font-bold">Ver todos</button>
      </div>
      <div className="px-4">
        <div className="bg-white dark:bg-[#383330] p-4 rounded-xl shadow-sm border-l-4 border-green-500">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs font-bold text-warm-accent">Hoje, 10:30</p>
              <h4 className="font-bold text-[#1d180c] dark:text-white">Pão e Cia - Bourgogne</h4>
            </div>
            <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded-full uppercase">Entregue</span>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-warm-accent">3 Itens (Pão Francês...)</p>
            <p className="text-primary font-extrabold text-lg">R$ 34,90</p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 mt-6">
        <button
          onClick={onLogout}
          className="w-full bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-600 h-14 rounded-xl font-extrabold flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">logout</span> Sair da Conta
        </button>
      </div>

      <p className="text-center text-xs text-warm-accent pb-4">
        Versão 2.0.0 | Pão e Cia - Bourgogne
      </p>
    </div>
  );
};

export default Profile;
