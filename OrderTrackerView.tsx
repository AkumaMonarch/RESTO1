
import React, { useMemo } from 'react';
import { AppSettings, Order } from './types';
import { CheckIcon } from './Icons';

interface OrderTrackerViewProps {
  settings: AppSettings;
  lang: 'EN' | 'HI';
  currentOrder: Order | undefined;
  onRestart: () => void;
}

export const OrderTrackerView: React.FC<OrderTrackerViewProps> = ({ settings, lang, currentOrder, onRestart }) => {
  const isDark = settings.themeMode === 'dark';
  const status = currentOrder?.status || 'pending';
  const isDelivery = currentOrder?.customer_details.diningMode === 'DELIVERY';

  const steps = useMemo(() => {
    const baseSteps = [
      { 
        key: 'pending', 
        label: lang === 'EN' ? 'Ordered' : 'ऑर्डर दिया गया', 
        icon: '📝' 
      },
      { 
        key: 'preparing', 
        label: lang === 'EN' ? 'Preparing' : 'तैयार किया जा रहा है', 
        icon: '👨‍🍳' 
      },
    ];

    if (isDelivery) {
      return [
        ...baseSteps,
        { 
          key: 'out_for_delivery', 
          label: lang === 'EN' ? 'On Way' : 'रास्ते में', 
          icon: '🚴' 
        },
        { 
          key: 'completed', 
          label: lang === 'EN' ? 'Delivered' : 'डिलीवर किया गया', 
          icon: '🏠' 
        }
      ];
    }

    return [
      ...baseSteps,
      { 
        key: 'ready', 
        label: lang === 'EN' ? 'Ready' : 'तैयार है', 
        icon: '✨' 
      }
    ];
  }, [isDelivery, lang]);

  const handleWhatsAppShare = () => {
    if (!currentOrder) return;
    const items = currentOrder.cart_items.map(i => `${i.quantity}x ${i.name}`).join('%0A');
    const text = `*New Order from ${settings.brandName}*%0A%0A*Order #:* ${currentOrder.order_number}%0A*Mode:* ${currentOrder.customer_details.diningMode}%0A*Total:* ${settings.currency}${currentOrder.total_price.toFixed(2)}%0A%0A*Items:*%0A${items}`;
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const getStepIndex = (s: string) => {
    if (s === 'pending') return 0;
    if (s === 'preparing') return 1;
    if (isDelivery) {
      if (s === 'out_for_delivery') return 2;
      if (s === 'completed') return 3;
    } else {
      if (s === 'ready' || s === 'completed') return 2;
    }
    return 0;
  };

  const currentIndex = getStepIndex(status);
  const isAllFinished = status === 'completed' || (!isDelivery && status === 'ready');

  return (
    <div className={`h-full flex flex-col items-center p-8 transition-all duration-1000 ${isAllFinished ? 'bg-green-600 text-white' : isDark ? 'bg-[#0F172A] text-white' : 'bg-white text-slate-900'}`}>
      <div className="flex-1 w-full flex flex-col items-center justify-center space-y-12">
        <div className="text-center space-y-3">
          <p className={`text-[10px] font-black uppercase tracking-[0.4em] opacity-40 ${isAllFinished ? 'text-white' : ''}`}>
            {lang === 'EN' ? 'Your Order Number' : 'आपका ऑर्डर नंबर'}
          </p>
          <h2 className={`text-7xl font-black font-oswald italic tracking-tighter transition-all duration-700 ${isAllFinished ? 'text-white scale-110' : 'text-blue-500'} animate-pulse`}>
            #{currentOrder?.order_number || '---'}
          </h2>
        </div>

        <div className="w-full max-w-[280px] space-y-8">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIndex || (isAllFinished && idx <= currentIndex);
            const isActive = idx === currentIndex && !isAllFinished;
            const isPending = idx > currentIndex && !isAllFinished;

            return (
              <div key={step.key} className={`flex items-center gap-6 transition-all duration-500 ${isPending ? 'opacity-20 scale-95' : 'opacity-100'}`}>
                <div className="relative">
                  {idx < steps.length - 1 && (
                    <div className={`absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-10 transition-colors duration-500 ${isCompleted ? (isAllFinished ? 'bg-white/30' : 'bg-blue-500') : 'bg-slate-200'}`}></div>
                  )}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-700 shadow-xl border-4 ${
                    isCompleted ? (isAllFinished ? 'bg-white/20 border-white/40 text-white' : 'bg-blue-500 border-blue-500 text-white') : 
                    isActive ? 'bg-white border-blue-500 text-blue-500 animate-pulse scale-110 shadow-blue-500/30' : 
                    'bg-slate-100 border-slate-200 text-slate-400'
                  }`}>
                    {isCompleted ? <CheckIcon className="w-6 h-6" /> : step.icon}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-blue-500' : ''}`}>
                    {idx + 1}. {step.label}
                  </span>
                  <span className="text-[8px] font-bold opacity-40 uppercase tracking-tighter">
                    {isActive ? (lang === 'EN' ? 'Processing...' : 'प्रक्रिया जारी...') : isCompleted ? (lang === 'EN' ? 'Done' : 'पूर्ण') : (lang === 'EN' ? 'Waiting' : 'प्रतीक्षा')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {isAllFinished && (
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] text-center animate-bounce border border-white/20 shadow-2xl">
            <h3 className="text-xl font-black uppercase tracking-tight">
              {lang === 'EN' ? 'READY FOR YOU!' : 'आपके लिए तैयार है!'}
            </h3>
            <p className="text-[10px] font-bold opacity-80 uppercase mt-1">
              {isDelivery ? (lang === 'EN' ? 'On its way to you' : 'आप तक पहुँच रहा है') : (lang === 'EN' ? 'Collect at the counter' : 'काउंटर पर प्राप्त करें')}
            </p>
          </div>
        )}
      </div>

      <div className="w-full pb-[calc(1rem+env(safe-area-inset-bottom))] space-y-3">
        {!isAllFinished && (
          <button 
            onClick={handleWhatsAppShare}
            className="w-full py-4 rounded-[2rem] bg-[#25D366] text-white font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>📱</span> {lang === 'EN' ? 'Share to WhatsApp' : 'व्हाट्सएप पर शेयर करें'}
          </button>
        )}
        <button 
          onClick={onRestart} 
          className={`w-full py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl active:scale-95 transition-all ${
            isAllFinished ? 'bg-white text-green-600' : isDark ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'
          }`}
        >
          {lang === 'EN' ? 'Finished / New Order' : 'समाप्त / नया ऑर्डर'}
        </button>
      </div>
    </div>
  );
};
