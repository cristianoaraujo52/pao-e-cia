
import React, { useState } from 'react';
import { CartItem, Page, User, PaymentMethodType, DeliveryAddress, Order } from '../types';
import { addOrder, generateId } from '../services/storage';

interface CheckoutProps {
  cart: CartItem[];
  user: User | null;
  onComplete: (order: Order) => void;
  onNavigate: (page: Page) => void;
  onRemoveItem?: (id: string) => void;
  onUpdateQuantity?: (id: string, delta: number) => void;
}

const BLOCKS = ['1', '2', '3', '4'] as const;

const PAYMENT_METHODS = [
  { id: 'pix' as PaymentMethodType, name: 'Pix', icon: 'qr_code_2', description: '5% de desconto', highlight: true },
  { id: 'card' as PaymentMethodType, name: 'Cartão', icon: 'credit_card', description: 'Crédito ou Débito' },
  { id: 'cash' as PaymentMethodType, name: 'Dinheiro', icon: 'payments', description: 'Pague na entrega' },
  { id: 'monthly' as PaymentMethodType, name: 'Fiado', icon: 'receipt_long', description: 'Conta do mês' },
];

const Checkout: React.FC<CheckoutProps> = ({ cart, user, onComplete, onNavigate, onRemoveItem, onUpdateQuantity }) => {
  const [step, setStep] = useState(1);
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodType>('pix');

  const [block, setBlock] = useState<'1' | '2' | '3' | '4'>('1');
  const [apartment, setApartment] = useState('');
  const [notes, setNotes] = useState('');

  const subtotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const deliveryFee = 0;
  const pixDiscount = selectedPayment === 'pix' ? 0.05 : 0;
  const totalDiscount = discount + pixDiscount;
  const total = subtotal + deliveryFee - (subtotal * totalDiscount);

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'PRIMEIRACOMPRA') {
      setDiscount(0.15);
      alert('Desconto de 15% aplicado!');
    } else if (coupon.toUpperCase() === 'BOURGOGNE') {
      setDiscount(0.10);
      alert('Desconto de morador aplicado (10%)!');
    } else {
      alert('Cupom inválido');
    }
  };

  const validateDelivery = (): boolean => {
    if (!apartment.trim()) {
      alert('Por favor, informe o número do apartamento.');
      return false;
    }
    return true;
  };

  const handleFinishOrder = () => {
    if (!validateDelivery()) return;

    const deliveryAddress: DeliveryAddress = { block, apartment, notes: notes || undefined };
    const order: Order = {
      id: generateId(),
      userId: user?.id || '',
      items: cart,
      subtotal,
      deliveryFee,
      discount: subtotal * totalDiscount,
      total,
      paymentMethod: selectedPayment,
      deliveryAddress,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    addOrder(order);
    onComplete(order);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-[480px] mx-auto text-center py-20 px-4">
        <div className="bg-white dark:bg-[#383330] rounded-2xl p-8 shadow-sm">
          <span className="material-symbols-outlined text-6xl text-warm-accent/40 mb-4">shopping_cart</span>
          <h2 className="text-xl font-extrabold text-[#1d180c] dark:text-white mb-2">Seu carrinho está vazio</h2>
          <p className="text-warm-accent mb-6">Que tal adicionar um pãozinho quentinho?</p>
          <button
            onClick={() => onNavigate(Page.HOME)}
            className="bg-primary text-white px-8 py-4 rounded-xl font-extrabold shadow-lg shadow-primary/30"
          >
            Voltar para a loja
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-[480px] mx-auto text-center py-20 px-4">
        <div className="bg-white dark:bg-[#383330] rounded-2xl p-8 shadow-sm">
          <span className="material-symbols-outlined text-6xl text-warm-accent/40 mb-4">lock</span>
          <h2 className="text-xl font-extrabold text-[#1d180c] dark:text-white mb-2">Acesso restrito</h2>
          <p className="text-warm-accent mb-6">Você precisa estar logado para finalizar o pedido.</p>
          <button
            onClick={() => onNavigate(Page.LOGIN)}
            className="bg-primary text-white px-8 py-4 rounded-xl font-extrabold shadow-lg shadow-primary/30"
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[480px] mx-auto animate-slideUp pb-40">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 pb-2">
        <button onClick={() => step > 1 ? setStep(step - 1) : onNavigate(Page.HOME)} className="text-[#1d180c] dark:text-white size-10 flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h1 className="text-lg font-extrabold flex-1 text-center pr-10 text-[#1d180c] dark:text-white">Meu Carrinho</h1>
      </header>

      {/* Progress */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between bg-white dark:bg-[#383330] rounded-xl p-3">
          {['Itens', 'Entrega', 'Pagar'].map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`size-8 rounded-full flex items-center justify-center font-bold text-sm ${step > i ? 'bg-primary text-white' : step === i + 1 ? 'bg-primary text-white' : 'bg-warm-accent/20 text-warm-accent'}`}>
                {step > i + 1 ? <span className="material-symbols-outlined text-sm">check</span> : i + 1}
              </div>
              <span className={`text-xs font-bold hidden sm:block ${step === i + 1 ? 'text-primary' : 'text-warm-accent'}`}>{label}</span>
              {i < 2 && <div className="w-8 sm:w-12 h-0.5 bg-warm-accent/20 mx-1"></div>}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Cart */}
      {step === 1 && (
        <div className="px-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-[#1d180c] dark:text-white">Seus Pedidos</h2>
            <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{cart.length} Itens</span>
          </div>
          {cart.map(item => (
            <div key={item.id} className="flex items-center gap-4 bg-white dark:bg-[#383330] px-4 py-3 rounded-xl shadow-sm relative overflow-hidden group">
              <div className="size-16 rounded-lg bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${item.image})` }}></div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#1d180c] dark:text-white truncate">{item.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm font-medium text-warm-accent">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>

                  {/* Quantity Controls */}
                  {onUpdateQuantity && (
                    <div className="flex items-center gap-2 bg-background-light dark:bg-background-dark rounded-lg px-2 py-0.5">
                      <button onClick={() => onUpdateQuantity(item.id, -1)} className="text-warm-accent hover:text-primary active:scale-90 px-1 py-1">
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, 1)} className="text-warm-accent hover:text-primary active:scale-90 px-1 py-1">
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <p className="font-extrabold text-primary">R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                {onRemoveItem && (
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                )}
              </div>
            </div>
          ))}
          <button onClick={() => setStep(2)} className="w-full h-14 bg-primary text-white font-extrabold rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 mt-4">
            Continuar <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      )}

      {/* Step 2: Delivery */}
      {step === 2 && (
        <div className="px-4 space-y-4">
          <div className="bg-white dark:bg-[#383330] rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">apartment</span>
              <div>
                <h2 className="font-bold text-[#1d180c] dark:text-white">Endereço de Entrega</h2>
                <p className="text-sm text-warm-accent">Condomínio Bourgogne</p>
              </div>
            </div>

            <p className="text-sm font-bold text-[#1d180c] dark:text-white mb-2 uppercase tracking-wider">Selecione o Bloco</p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {BLOCKS.map(b => (
                <button key={b} onClick={() => setBlock(b)} className={`py-3 rounded-xl font-bold text-lg transition-all ${block === b ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-warm-accent/10 text-warm-accent hover:bg-warm-accent/20'}`}>
                  {b}
                </button>
              ))}
            </div>

            <p className="text-sm font-bold text-[#1d180c] dark:text-white mb-2 uppercase tracking-wider">Apartamento</p>
            <div className="relative mb-4">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-warm-accent/60">door_front</span>
              <input type="text" value={apartment} onChange={(e) => setApartment(e.target.value)} placeholder="Ex: 101, 302..." className="w-full rounded-xl border-2 border-warm-accent/20 bg-background-light dark:bg-background-dark h-14 pl-12 pr-4 font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none" required />
            </div>

            <p className="text-sm font-bold text-[#1d180c] dark:text-white mb-2 uppercase tracking-wider">Observações</p>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex: Deixar com o porteiro..." rows={2} className="w-full rounded-xl border-2 border-warm-accent/20 bg-background-light dark:bg-background-dark p-4 font-medium focus:ring-2 focus:ring-primary outline-none resize-none" />
          </div>
          <button onClick={() => validateDelivery() && setStep(3)} className="w-full h-14 bg-primary text-white font-extrabold rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2">
            Continuar <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 3 && (
        <div className="px-4 space-y-4">
          <h3 className="text-lg font-bold text-[#1d180c] dark:text-white">Forma de Pagamento</h3>
          <div className="space-y-3">
            {PAYMENT_METHODS.map(method => (
              <label key={method.id} onClick={() => setSelectedPayment(method.id)} className={`flex items-center justify-between p-4 bg-white dark:bg-[#383330] rounded-xl border-2 cursor-pointer transition-all ${selectedPayment === method.id ? 'border-primary shadow-md' : 'border-transparent'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${selectedPayment === method.id ? 'bg-primary/20 text-primary' : 'bg-warm-accent/10 text-warm-accent'}`}>
                    <span className="material-symbols-outlined">{method.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-[#1d180c] dark:text-white">{method.name}</p>
                    <p className={`text-xs font-medium ${method.highlight ? 'text-green-600' : 'text-warm-accent'}`}>{method.description}</p>
                  </div>
                </div>
                <div className={`size-6 rounded-full border-2 flex items-center justify-center ${selectedPayment === method.id ? 'border-primary bg-primary' : 'border-warm-accent/30'}`}>
                  {selectedPayment === method.id && <span className="material-symbols-outlined text-white text-sm">check</span>}
                </div>
              </label>
            ))}
          </div>

          {/* Coupon */}
          <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl">
            <p className="text-sm font-bold uppercase mb-2 text-[#1d180c] dark:text-white">Cupom de Desconto</p>
            <div className="flex w-full">
              <input value={coupon} onChange={(e) => setCoupon(e.target.value)} className="flex-1 rounded-l-xl border-none bg-white dark:bg-background-dark h-12 px-4 focus:ring-primary outline-none" placeholder="BOURGOGNE" />
              <button onClick={applyCoupon} className="bg-primary text-[#1d180c] font-bold px-6 rounded-r-xl">Aplicar</button>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-primary/10 p-4 rounded-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">location_on</span>
            <div>
              <p className="font-bold text-[#1d180c] dark:text-white">Bloco {block}, Apt {apartment}</p>
              {notes && <p className="text-sm text-warm-accent">{notes}</p>}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white dark:bg-[#383330] p-4 rounded-xl space-y-2">
            <div className="flex justify-between text-sm text-warm-accent"><span>Subtotal</span><span>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
            <div className="flex justify-between text-sm text-warm-accent"><span>Taxa de Entrega</span><span className="text-green-600 font-bold">Grátis</span></div>
            {totalDiscount > 0 && <div className="flex justify-between text-sm text-green-600 font-bold"><span>Desconto ({Math.round(totalDiscount * 100)}%)</span><span>- R$ {(subtotal * totalDiscount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>}
            <div className="flex justify-between pt-3 border-t border-dashed border-warm-accent/20">
              <span className="text-lg font-bold text-[#1d180c] dark:text-white">Total</span>
              <span className="text-2xl font-extrabold text-primary">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Footer for Step 3 */}
      {step === 3 && (
        <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/80 dark:bg-background-dark/80 backdrop-blur-xl p-4 pb-8 border-t z-50 safe-area-bottom">
          <button onClick={handleFinishOrder} className="w-full h-14 bg-primary text-[#1d180c] text-lg font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-3 mb-2">
            Finalizar Pedido <span className="material-symbols-outlined">shopping_bag</span>
          </button>
        </footer>
      )}
    </div>
  );
};

export default Checkout;
