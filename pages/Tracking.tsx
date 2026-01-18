
import React, { useState, useEffect } from 'react';
import { Order, Page } from '../types';

interface TrackingProps {
  order?: Order | null;
  onFinish: () => void;
  onNavigate?: (page: Page) => void;
}

// Localização do Condomínio Bourgogne
const CONDOMINIO_LOCATION = {
  address: 'Estrada do Guanumbi, 270 - Freguesia (Jacarepaguá)',
  city: 'Rio de Janeiro - RJ',
  lat: -22.93332,
  lng: -43.32965,
};

const Tracking: React.FC<TrackingProps> = ({ order, onFinish, onNavigate }) => {
  const [status, setStatus] = useState(0);
  const statuses = [
    { label: 'Recebido', icon: 'receipt', duration: 3000 },
    { label: 'Preparando', icon: 'bakery_dining', duration: 5000 },
    { label: 'Em Rota', icon: 'delivery_dining', duration: 7000 },
    { label: 'Entregue!', icon: 'home', duration: 2000 },
  ];

  useEffect(() => {
    if (status < statuses.length - 1) {
      const timer = setTimeout(() => {
        setStatus(prev => prev + 1);
      }, statuses[status].duration);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case 'pix': return 'Pix';
      case 'card': return 'Cartão';
      case 'cash': return 'Dinheiro';
      case 'monthly': return 'Fiado';
      default: return method;
    }
  };

  // Google Maps Static API URL (usando OpenStreetMap como fallback gratuito)
  const mapImageUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${CONDOMINIO_LOCATION.lng},${CONDOMINIO_LOCATION.lat}&zoom=15&marker=lonlat:${CONDOMINIO_LOCATION.lng},${CONDOMINIO_LOCATION.lat};color:%23f5b400;size:large&apiKey=demo`;

  // Fallback estático se API não funcionar
  const fallbackMapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${CONDOMINIO_LOCATION.lng - 0.01}%2C${CONDOMINIO_LOCATION.lat - 0.01}%2C${CONDOMINIO_LOCATION.lng + 0.01}%2C${CONDOMINIO_LOCATION.lat + 0.01}&layer=mapnik&marker=${CONDOMINIO_LOCATION.lat}%2C${CONDOMINIO_LOCATION.lng}`;

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-background-light dark:bg-background-dark pb-24">
      {/* Header */}
      <header className="flex items-center p-4 pb-2 justify-between sticky top-0 z-50 bg-background-light dark:bg-background-dark">
        <button
          onClick={() => onNavigate?.(Page.HOME)}
          className="size-10 flex items-center justify-center text-[#1d180c] dark:text-white"
        >
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <div className="flex flex-col items-center flex-1">
          <h2 className="text-[#1d180c] dark:text-white text-lg font-extrabold">
            Pedido #{order?.id.slice(-6).toUpperCase() || '----'}
          </h2>
          <p className="text-warm-accent text-xs font-medium">Pão e Cia - Bourgogne</p>
        </div>
        <div className="size-10"></div>
      </header>

      <main className="flex-1 flex flex-col w-full px-4">
        {/* Map */}
        <div className="relative py-2">
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-warm-accent/20">
            {/* OpenStreetMap Embed */}
            <iframe
              src={fallbackMapUrl}
              className="w-full h-full border-0"
              style={{ filter: 'saturate(1.2)' }}
              title="Mapa do Condomínio Bourgogne"
            />

            {/* Overlay with ETA */}
            <div className="absolute top-4 right-4 bg-white/95 dark:bg-[#1d180c]/95 backdrop-blur-sm p-3 rounded-xl shadow-lg flex flex-col items-center border border-primary/20">
              <p className="text-[10px] uppercase tracking-widest font-bold text-warm-accent">Chegada em</p>
              <p className="text-2xl font-extrabold text-primary">12 min</p>
            </div>

            {/* Delivery Animation */}
            {status === 2 && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="bg-primary p-3 rounded-full shadow-xl animate-pulse">
                  <span className="material-symbols-outlined text-white text-2xl">delivery_dining</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Address Info */}
        <div className="bg-primary/10 p-4 rounded-xl mt-2 flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
          <div>
            <p className="font-bold text-[#1d180c] dark:text-white text-sm">{CONDOMINIO_LOCATION.address}</p>
            <p className="text-warm-accent text-xs">{CONDOMINIO_LOCATION.city}</p>
            {order && (
              <p className="text-primary font-bold text-sm mt-1">
                Bloco {order.deliveryAddress.block}, Apt {order.deliveryAddress.apartment}
              </p>
            )}
          </div>
        </div>

        {/* Status Message */}
        <div className="py-6 text-center">
          <h3 className="text-[#1d180c] dark:text-white text-2xl font-extrabold leading-tight">
            {status === 0 && 'Pedido confirmado!'}
            {status === 1 && 'O pão está quentinho!'}
            {status === 2 && 'A caminho do seu bloco!'}
            {status === 3 && 'Bom apetite! 🥖'}
          </h3>
          <p className="text-warm-accent mt-1 text-sm font-medium">
            {status < 3 ? 'Saindo do forno para a sua mesa.' : 'Obrigado por pedir conosco!'}
          </p>
        </div>

        {/* Status Steps */}
        <div className="px-2 py-4">
          <div className="status-line flex justify-between items-center relative">
            {statuses.map((s, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`size-10 rounded-full flex items-center justify-center shadow-md transition-all ${idx < status ? 'bg-primary text-white' :
                    idx === status ? 'bg-primary text-white size-12 border-4 border-white dark:border-background-dark' :
                      'bg-warm-accent/20 text-warm-accent'
                  }`}>
                  {idx < status ? (
                    <span className="material-symbols-outlined text-sm">check</span>
                  ) : (
                    <span className="material-symbols-outlined text-base">{s.icon}</span>
                  )}
                </div>
                <span className={`text-[10px] font-bold uppercase ${idx === status ? 'text-primary' : 'text-warm-accent'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-white dark:bg-[#383330] p-4 rounded-2xl shadow-sm border border-warm-accent/10 my-4">
            <h4 className="font-bold text-[#1d180c] dark:text-white mb-3">Detalhes do Pedido</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-warm-accent">Itens</span>
                <span className="font-bold text-[#1d180c] dark:text-white">{order.items.length} produtos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-accent">Pagamento</span>
                <span className="font-bold text-[#1d180c] dark:text-white">{getPaymentLabel(order.paymentMethod)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-warm-accent/20">
                <span className="font-bold text-[#1d180c] dark:text-white">Total</span>
                <span className="font-extrabold text-primary text-lg">R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Person */}
        <div className="bg-white dark:bg-[#383330] p-4 rounded-2xl shadow-sm border border-warm-accent/10">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="size-14 rounded-full bg-primary/20 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-primary text-2xl">person</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-[#1d180c] dark:text-white">Carlos Silva</p>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-sm fill-1">star</span>
                <p className="text-warm-accent text-sm">4.9 <span className="opacity-60">(500+ entregas)</span></p>
              </div>
            </div>
            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-bold uppercase">Bicicleta</span>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 h-12 rounded-xl bg-warm-accent/10 text-[#1d180c] dark:text-white font-bold flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">chat_bubble</span> Chat
            </button>
            <button className="flex-1 h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">call</span> Ligar
            </button>
          </div>
        </div>

        {/* Finish Button */}
        {status === statuses.length - 1 && (
          <div className="pt-6 animate-slideUp">
            <h3 className="text-lg font-bold text-[#1d180c] dark:text-white mb-3 text-center">Gostou do serviço?</h3>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} className="text-3xl hover:scale-110 transition-transform">⭐</button>
              ))}
            </div>
            <button
              onClick={onFinish}
              className="w-full h-14 bg-primary text-white rounded-xl font-extrabold shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
            >
              Voltar ao Início <span className="material-symbols-outlined">home</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Tracking;
