
import React from 'react';
import { Page, User } from '../types';

interface NavbarProps {
  cartCount: number;
  onNavigate: (page: Page) => void;
  user: User | null;
  currentPage: Page;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount, onNavigate, user, currentPage }) => {
  return (
    <header className="hidden md:block sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-warm-accent/10">
      <div className="container mx-auto max-w-4xl px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => onNavigate(Page.HOME)}
            className="flex items-center gap-2 group"
          >
            <div className="bg-primary/20 p-2 rounded-xl border-2 border-primary/20">
              <span className="material-symbols-outlined text-primary text-2xl">bakery_dining</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-[#1d180c] dark:text-white leading-tight">Pão e Cia</span>
              <span className="text-[10px] font-medium text-warm-accent uppercase tracking-wider">Condomínio Bourgogne</span>
            </div>
          </button>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            <button
              onClick={() => onNavigate(Page.HOME)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${currentPage === Page.HOME
                ? 'bg-primary/10 text-primary'
                : 'text-warm-accent hover:bg-primary/5'
                }`}
            >
              Início
            </button>
            <button
              onClick={() => onNavigate(Page.TRACKING)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${currentPage === Page.TRACKING
                ? 'bg-primary/10 text-primary'
                : 'text-warm-accent hover:bg-primary/5'
                }`}
            >
              Pedidos
            </button>
            {user?.isAdmin && (
              <button
                onClick={() => onNavigate(Page.ADMIN)}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${currentPage === Page.ADMIN
                  ? 'bg-primary/10 text-primary'
                  : 'text-warm-accent hover:bg-primary/5'
                  }`}
              >
                Admin
              </button>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <button
              onClick={() => onNavigate(Page.CHECKOUT)}
              className="relative bg-primary/10 p-3 rounded-xl border-2 border-primary/20 hover:bg-primary/20 transition-colors"
            >
              <span className="material-symbols-outlined text-primary">shopping_basket</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[20px] h-[20px] flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile */}
            <button
              onClick={() => onNavigate(user ? Page.PROFILE : Page.LOGIN)}
              className="flex items-center gap-2 bg-white dark:bg-surface-dark px-4 py-2 rounded-xl border border-warm-accent/20 hover:border-primary/30 transition-colors"
            >
              <span className="material-symbols-outlined text-primary">person</span>
              <span className="font-bold text-sm text-[#1d180c] dark:text-white">
                {user ? user.name.split(' ')[0] : 'Entrar'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Navbar);
