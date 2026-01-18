
import React, { useState } from 'react';
import { Page } from '../types';
import { isSupabaseConfigured, registerResident } from '../services/supabase';

interface RegisterProps {
    onNavigate: (page: Page) => void;
    onRegisterSuccess: (name: string, block: string, apartment: string) => void;
}

const Register: React.FC<RegisterProps> = ({ onNavigate, onRegisterSuccess }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [block, setBlock] = useState('1');
    const [apartment, setApartment] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name || !apartment || !password) {
            setError('Preencha todos os campos obrigatórios');
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não conferem');
            return;
        }

        if (password.length < 4) {
            setError('A senha deve ter pelo menos 4 caracteres');
            return;
        }

        setIsLoading(true);

        if (isSupabaseConfigured()) {
            const resident = await registerResident({
                name,
                phone: phone || undefined,
                block,
                apartment,
                password,
            });

            if (resident) {
                onRegisterSuccess(name, block, apartment);
            } else {
                setError('Erro ao cadastrar. Tente novamente.');
            }
        } else {
            // Fallback: just simulate success for offline mode
            setTimeout(() => {
                onRegisterSuccess(name, block, apartment);
            }, 1000);
        }

        setIsLoading(false);
    };

    return (
        <div className="max-w-[480px] mx-auto animate-slideUp min-h-screen bg-background-light dark:bg-background-dark pb-24">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-primary p-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => onNavigate(Page.LOGIN)}
                        className="size-10 bg-white/20 rounded-xl flex items-center justify-center text-white"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="text-center">
                        <h1 className="text-white text-lg font-extrabold">Criar Conta</h1>
                        <p className="text-white/70 text-xs">Cadastro de Morador</p>
                    </div>
                    <div className="size-10"></div>
                </div>
            </header>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* Connection Status */}
                <div className={`p-3 rounded-xl flex items-center gap-2 ${isSupabaseConfigured() ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    <span className="material-symbols-outlined text-sm">{isSupabaseConfigured() ? 'cloud_done' : 'cloud_off'}</span>
                    <span className="text-xs font-bold">
                        {isSupabaseConfigured() ? 'Cadastro online ativo' : 'Modo demonstração (offline)'}
                    </span>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-xl flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">error</span>
                        <span className="text-sm font-bold">{error}</span>
                    </div>
                )}

                {/* Name */}
                <div>
                    <label className="text-[#1d180c] dark:text-white text-sm font-bold uppercase tracking-wider block pb-2 px-1">
                        Nome Completo *
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-warm-accent/60">person</span>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-xl text-[#1d180c] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary border-2 border-warm-accent/20 bg-white dark:bg-[#383330] h-14 pl-12 pr-4 text-base font-medium"
                            placeholder="Seu nome completo"
                            required
                        />
                    </div>
                </div>

                {/* Phone */}
                <div>
                    <label className="text-[#1d180c] dark:text-white text-sm font-bold uppercase tracking-wider block pb-2 px-1">
                        WhatsApp / Telefone
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-warm-accent/60">phone</span>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full rounded-xl text-[#1d180c] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary border-2 border-warm-accent/20 bg-white dark:bg-[#383330] h-14 pl-12 pr-4 text-base font-medium"
                            placeholder="(21) 99999-9999"
                        />
                    </div>
                </div>

                {/* Block & Apartment */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[#1d180c] dark:text-white text-sm font-bold uppercase tracking-wider block pb-2 px-1">
                            Bloco *
                        </label>
                        <select
                            value={block}
                            onChange={(e) => setBlock(e.target.value)}
                            className="w-full rounded-xl text-[#1d180c] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary border-2 border-warm-accent/20 bg-white dark:bg-[#383330] h-14 px-4 text-base font-medium"
                        >
                            <option value="1">Bloco 1</option>
                            <option value="2">Bloco 2</option>
                            <option value="3">Bloco 3</option>
                            <option value="4">Bloco 4</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[#1d180c] dark:text-white text-sm font-bold uppercase tracking-wider block pb-2 px-1">
                            Apartamento *
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-warm-accent/60">apartment</span>
                            <input
                                type="text"
                                value={apartment}
                                onChange={(e) => setApartment(e.target.value)}
                                className="w-full rounded-xl text-[#1d180c] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary border-2 border-warm-accent/20 bg-white dark:bg-[#383330] h-14 pl-12 pr-4 text-base font-medium"
                                placeholder="Ex: 101"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label className="text-[#1d180c] dark:text-white text-sm font-bold uppercase tracking-wider block pb-2 px-1">
                        Senha *
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-warm-accent/60">lock</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl text-[#1d180c] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary border-2 border-warm-accent/20 bg-white dark:bg-[#383330] h-14 pl-12 pr-4 text-base font-medium"
                            placeholder="Mínimo 4 caracteres"
                            required
                        />
                    </div>
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="text-[#1d180c] dark:text-white text-sm font-bold uppercase tracking-wider block pb-2 px-1">
                        Confirmar Senha *
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-warm-accent/60">lock</span>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full rounded-xl text-[#1d180c] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary border-2 border-warm-accent/20 bg-white dark:bg-[#383330] h-14 pl-12 pr-4 text-base font-medium"
                            placeholder="Digite a senha novamente"
                            required
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-primary hover:bg-primary/90 text-white font-extrabold text-lg h-14 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all ${isLoading ? 'opacity-70' : ''}`}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Cadastrando...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">person_add</span>
                                CRIAR CONTA
                            </>
                        )}
                    </button>
                </div>

                {/* Login Link */}
                <div className="text-center pt-4">
                    <p className="text-warm-accent text-sm">
                        Já tem uma conta?{' '}
                        <button
                            type="button"
                            onClick={() => onNavigate(Page.LOGIN)}
                            className="text-primary font-bold hover:underline"
                        >
                            Fazer Login
                        </button>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default Register;
