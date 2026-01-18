
import React from 'react';
import { Page } from '../types';

interface BottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  cartCount: number;
  isAdmin?: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate, cartCount, isAdmin }) => {
  const isActive = (page: Page) => currentPage === page;

  return (
    <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/95 dark:bg-[#272321]/95 backdrop-blur-lg border-t border-warm-accent/10 px-4 py-3 flex justify-between items-center z-50">
      <button
        onClick={() => onNavigate(Page.HOME)}
        className={`flex flex-col items-center gap-1 flex-1 ${isActive(Page.HOME) ? 'text-primary' : 'text-warm-accent/50 dark:text-white/40'}`}
      >
        <span className={`material-symbols-outlined ${isActive(Page.HOME) ? 'fill-1' : ''}`}>home</span>
        <span className="text-[10px] font-bold">Início</span>
      </button>

      <button
        onClick={() => onNavigate(Page.CHECKOUT)}
        className={`flex flex-col items-center gap-1 flex-1 relative ${isActive(Page.CHECKOUT) ? 'text-primary' : 'text-warm-accent/50 dark:text-white/40'}`}
      >
        <span className={`material-symbols-outlined ${isActive(Page.CHECKOUT) ? 'fill-1' : ''}`}>shopping_basket</span>
        {cartCount > 0 && (
          <span className="absolute -top-1 right-1/4 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
            {cartCount}
          </span>
        )}
        <span className="text-[10px] font-bold">Carrinho</span>
      </button>

      <button
        onClick={() => onNavigate(Page.TRACKING)}
        className={`flex flex-col items-center gap-1 flex-1 ${isActive(Page.TRACKING) ? 'text-primary' : 'text-warm-accent/50 dark:text-white/40'}`}
      >
        <span className={`material-symbols-outlined ${isActive(Page.TRACKING) ? 'fill-1' : ''}`}>receipt_long</span>
        <span className="text-[10px] font-bold">Pedidos</span>
      </button>

      <button
        onClick={() => onNavigate(Page.CHAT)}
        className={`flex flex-col items-center gap-1 flex-1 ${isActive(Page.CHAT) ? 'text-primary' : 'text-warm-accent/50 dark:text-white/40'}`}
      >
        <span className={`material-symbols-outlined ${isActive(Page.CHAT) ? 'fill-1' : ''}`}>chat</span>
        <span className="text-[10px] font-bold">Chat</span>
      </button>

      {isAdmin && (
        <button
          onClick={() => onNavigate(Page.ADMIN)}
          className={`flex flex-col items-center gap-1 flex-1 ${isActive(Page.ADMIN) ? 'text-primary' : 'text-warm-accent/50 dark:text-white/40'}`}
        >
          <span className={`material-symbols-outlined ${isActive(Page.ADMIN) ? 'fill-1' : ''}`}>admin_panel_settings</span>
          <span className="text-[10px] font-bold">Admin</span>
        </button>
      )}

      <button
        onClick={() => onNavigate(Page.PROFILE)}
        className={`flex flex-col items-center gap-1 flex-1 ${isActive(Page.PROFILE) ? 'text-primary' : 'text-warm-accent/50 dark:text-white/40'}`}
      >
        <span className={`material-symbols-outlined ${isActive(Page.PROFILE) ? 'fill-1' : ''}`}>person</span>
        <span className="text-[10px] font-bold">Perfil</span>
      </button>
    </nav>
  );
};

export default BottomNav;
