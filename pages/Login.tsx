import React, { useState } from 'react';
import { Page } from '../types';
import { isSupabaseConfigured, loginResident } from '../services/supabase';

interface LoginProps {
  onLogin: (email: string, isAdmin: boolean, userData?: any) => void;
  onNavigate?: (page: Page) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError('');
    setIsLoading(true);

    if (isSupabaseConfigured()) {
      const resident = await loginResident(email, password);

      if (resident) {
        onLogin(resident.email || email, resident.isAdmin, resident);
      } else {
        setError('Usuário ou senha incorretos.');
      }
    } else {
      // Fallback para modo offline/demonstreção
      setTimeout(() => {
        const isAdmin = email.toLowerCase().includes('admin') || password === 'admin123';
        onLogin(email, isAdmin, {
          name: isAdmin ? 'Admin' : 'Visitante',
          block: '1',
          apartment: '101',
          id: 'demo-user-' + Date.now()
        });
      }, 1200);
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-[480px] mx-auto animate-slideUp min-h-screen bg-background-light dark:bg-background-dark">
      {/* Hero Image */}
      <div className="px-4 py-4">
        <div
          className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-primary/10 rounded-2xl min-h-[180px] relative border-2 border-primary/20"
          style={{
            backgroundImage: 'linear-gradient(to top, rgba(251, 248, 244, 0.9), rgba(251, 248, 244, 0)), url("https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800")'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <span className="material-symbols-outlined text-[120px] text-primary">bakery_dining</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="flex flex-col items-center px-6">
        <h1 className="text-[#1d180c] dark:text-white text-[28px] font-extrabold leading-tight text-center pt-2">
          Bem-vindo ao Pão e Cia
        </h1>
        <p className="text-accent-brown dark:text-primary/80 text-base font-medium text-center pt-2 pb-6">
          Condomínio Bourgogne - Blocos 1, 2, 3 e 4
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-4 space-y-4">
        {/* Connection Status */}
        <div className={`p-3 rounded-xl flex items-center gap-2 ${isSupabaseConfigured() ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          <span className="material-symbols-outlined text-sm">{isSupabaseConfigured() ? 'cloud_done' : 'cloud_off'}</span>
          <span className="text-xs font-bold">
            {isSupabaseConfigured() ? 'Login online ativo' : 'Modo demonstração (offline)'}
          </span>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-xl flex items-center gap-2 animate-pulse">
            <span className="material-symbols-outlined text-sm">error</span>
            <span className="text-sm font-bold">{error}</span>
          </div>
        )}

        <div>
          <label className="text-[#1d180c] dark:text-white text-sm font-bold uppercase tracking-wider block pb-2 px-1">
            Seu E-mail ou Apartamento
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-accent-brown/60">mail</span>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl text-[#1d180c] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary border-2 border-accent-brown/20 bg-white dark:bg-background-dark h-14 pl-12 pr-4 text-base font-medium transition-all"
              placeholder="bloco1-apt101 ou email@exemplo.com"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center pb-2 px-1">
            <label className="text-[#1d180c] dark:text-white text-sm font-bold uppercase tracking-wider">
              Sua Senha
            </label>
            <button type="button" className="text-primary text-sm font-bold hover:underline">
              Esqueceu?
            </button>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-accent-brown/60">lock</span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl text-[#1d180c] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary border-2 border-accent-brown/20 bg-white dark:bg-background-dark h-14 pl-12 pr-12 text-base font-medium transition-all"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-accent-brown/60 cursor-pointer"
            >
              <span className="material-symbols-outlined">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-primary hover:bg-primary/90 text-white font-extrabold text-lg h-14 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all ${isLoading ? 'opacity-70' : ''}`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Entrando...
              </>
            ) : (
              <>
                <span>ENTRAR AGORA</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 px-8 py-6">
        <div className="h-[1px] flex-1 bg-accent-brown/20"></div>
        <span className="text-accent-brown/60 text-xs font-bold uppercase tracking-widest">acesso rápido</span>
        <div className="h-[1px] flex-1 bg-accent-brown/20"></div>
      </div>

      {/* Quick Login */}
      <div className="flex flex-col gap-3 px-4 pb-8">
        <div className="flex gap-3">
          <button
            onClick={() => {
              setEmail('morador@bourgogne.com');
              setPassword('123456');
            }}
            className="flex-1 flex items-center justify-center h-14 border-2 border-accent-brown/20 rounded-xl bg-white dark:bg-background-dark gap-2 hover:border-primary/30 transition-colors"
          >
            <span className="material-symbols-outlined text-primary">person</span>
            <span className="text-[#1d180c] dark:text-white font-bold text-sm">Morador</span>
          </button>
          <button
            onClick={() => {
              setEmail('admin@bourgogne.com');
              setPassword('admin123');
            }}
            className="flex-1 flex items-center justify-center h-14 border-2 border-primary/30 rounded-xl bg-primary/10 gap-2 hover:bg-primary/20 transition-colors"
          >
            <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
            <span className="text-primary font-bold text-sm">Admin</span>
          </button>
        </div>

        {onNavigate && (
          <button
            onClick={() => onNavigate(Page.REGISTER)}
            className="w-full flex items-center justify-center h-14 bg-white dark:bg-[#383330] border-2 border-primary/50 text-primary font-extrabold rounded-xl shadow-sm gap-2 hover:bg-primary/5 transition-colors"
          >
            <span className="material-symbols-outlined">person_add</span>
            CRIAR NOVA CONTA
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="pb-10 px-4 text-center space-y-3">
        <p className="text-accent-brown dark:text-primary/70 text-sm">
          🏢 Exclusivo para moradores do Bourgogne
        </p>
      </div>
    </div>
  );
};

export default Login;
