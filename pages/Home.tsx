
import React from 'react';
import { Product } from '../types';
import { CATEGORIES } from '../constants';

interface HomeProps {
  products: Product[];
  onAddToCart: (p: Product) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
}

const Home: React.FC<HomeProps> = ({
  products,
  onAddToCart,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory
}) => {
  return (
    <div className="animate-fadeIn max-w-[480px] mx-auto">
      {/* Header Mobile */}
      <header className="md:hidden sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-warm-accent uppercase tracking-wider">Condomínio Bourgogne</span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-xl">bakery_dining</span>
              <span className="text-xl font-extrabold text-[#1d180c] dark:text-white">Pão e Cia</span>
            </div>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="px-4 py-4">
        <label className="flex flex-col min-w-40 h-14 w-full group">
          <div className="flex w-full flex-1 items-stretch rounded-xl h-full shadow-sm group-focus-within:shadow-md transition-shadow">
            <div className="text-warm-accent flex border-none bg-white dark:bg-[#383330] items-center justify-center pl-4 rounded-l-xl">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              type="text"
              className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#1d180c] dark:text-white focus:outline-none focus:ring-0 border-none bg-white dark:bg-[#383330] h-full placeholder:text-warm-accent/60 px-4 rounded-l-none pl-2 text-base font-medium"
              placeholder="O que vamos pedir hoje?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </label>
      </div>

      {/* Categories */}
      <div className="flex items-center justify-between px-4 pt-2">
        <h2 className="text-[#1d180c] dark:text-white text-xl font-extrabold leading-tight">Categorias</h2>
      </div>
      <div className="flex overflow-x-auto px-4 py-3 gap-3 no-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex flex-col items-center gap-2 min-w-[72px] cursor-pointer transition-transform hover:scale-105 ${selectedCategory === cat.id ? 'scale-105' : ''
              }`}
          >
            <div className={`p-4 rounded-2xl aspect-square flex items-center justify-center border-2 transition-all ${selectedCategory === cat.id
                ? 'bg-primary/20 border-primary shadow-lg shadow-primary/20'
                : 'bg-primary/10 dark:bg-primary/5 border-primary/20'
              }`}>
              <span className="text-2xl">{cat.icon}</span>
            </div>
            <p className={`text-xs font-bold ${selectedCategory === cat.id ? 'text-primary' : 'dark:text-white'}`}>
              {cat.name}
            </p>
          </button>
        ))}
      </div>

      {/* Coupons */}
      <h2 className="text-[#1d180c] dark:text-white text-xl font-extrabold leading-tight px-4 pt-4">Cupons Ativos</h2>
      <div className="flex overflow-x-auto px-4 py-3 gap-4 no-scrollbar">
        <div className="min-w-[280px] bg-primary rounded-2xl p-4 flex justify-between items-center shadow-lg shadow-primary/20">
          <div>
            <h3 className="text-white font-black text-xl leading-tight">15% OFF</h3>
            <p className="text-white/90 text-sm font-bold uppercase tracking-wide">CUPOM: PRIMEIRACOMPRA</p>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText('PRIMEIRACOMPRA')}
            className="bg-white text-primary px-4 py-2 rounded-lg font-black text-xs uppercase shadow-sm active:scale-95 transition-transform"
          >
            Copiar
          </button>
        </div>
        <div className="min-w-[280px] bg-[#272321] rounded-2xl p-4 flex justify-between items-center shadow-lg">
          <div>
            <h3 className="text-primary font-black text-xl leading-tight">10% OFF</h3>
            <p className="text-white/70 text-sm font-bold uppercase tracking-wide">MORADORES: BOURGOGNE</p>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText('BOURGOGNE')}
            className="bg-primary text-white px-4 py-2 rounded-lg font-black text-xs uppercase shadow-sm active:scale-95 transition-transform"
          >
            Copiar
          </button>
        </div>
      </div>

      {/* Products */}
      <div className="flex justify-between items-center px-4 pt-6 pb-2">
        <h2 className="text-[#1d180c] dark:text-white text-xl font-extrabold">Nossas Delícias</h2>
        <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
          {products.length} itens
        </span>
      </div>

      {products.length > 0 ? (
        <div className="px-4 flex flex-col gap-3 pb-32">
          {products.map(product => (
            <div
              key={product.id}
              className="flex gap-4 p-3 bg-white dark:bg-[#383330] rounded-2xl shadow-sm border border-black/5 dark:border-white/5 items-center cursor-pointer hover:shadow-md transition-shadow"
            >
              <div
                className="size-20 bg-cover bg-center rounded-xl shrink-0"
                style={{ backgroundImage: `url(${product.image})` }}
              />
              <div className="flex flex-col flex-1 gap-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-base leading-tight dark:text-white truncate">{product.name}</h4>
                  <div className="flex items-center gap-1 bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                    <span className="material-symbols-outlined text-primary text-[14px] fill-1">star</span>
                    <span className="text-xs font-bold text-primary">{product.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-warm-accent dark:text-white/60 font-medium truncate">{product.description}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded">
                    {product.category}
                  </span>
                  <span className="text-lg font-extrabold text-primary">
                    R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
                className="bg-primary text-white size-12 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors shrink-0"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 mx-4 bg-white dark:bg-[#383330] rounded-2xl border-2 border-dashed border-warm-accent/30">
          <span className="material-symbols-outlined text-6xl text-warm-accent/40 mb-4">search_off</span>
          <p className="text-lg font-bold text-[#1d180c] dark:text-white">Nenhum produto encontrado</p>
          <p className="text-warm-accent text-sm mt-1">Tente buscar por outro termo ou categoria.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="mt-4 text-primary font-bold text-sm hover:underline"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
